import Workspace from "../models/workspace.js";
import Project from "../models/project.js";
import User from "../models/user.js";
import WorkspaceInvite from "../models/workspace-invite.js";
import jwt from "jsonwebtoken";
import { sendEmail } from "../libs/send-email.js";
import { recordActivity } from "../libs/index.js";

const createWorkspace = async (req, res) => {
  try {
    const { name, description, color } = req.body;

    const workspace = await Workspace.create({
      name,
      description,
      color,
      members: [
        {
          user: req.user._id,
          role: "admin",
          joinedAt: new Date(),
        },
      ],
    });

    res.status(201).json(workspace);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};

const getWorkspaces = async (req, res) => {
  try {
    const query = req.user.isAdmin ? {} : { "members.user": req.user._id };

    const workspaceDocs = await Workspace.find(query)
        .populate("members.user", "name email profilePicture")
        .sort({ createdAt: -1 })
        .lean();
    
    // Attach dynamic manager info to each workspace
    const workspaces = await Promise.all(workspaceDocs.map(async (ws) => {
        const manager = await User.findOne({ managedWorkspaces: ws._id }, "name email profilePicture");
        return { ...ws, manager };
    }));

    res.status(200).json(workspaces);
  } catch (error) {
    console.error("getWorkspaces Error:", error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};

const getWorkspaceDetails = async (req, res) => {
  try {
    const { workspaceId } = req.params;

    const workspaceDoc = await Workspace.findById(workspaceId)
        .populate("members.user", "name email profilePicture")
        .lean();

    if (!workspaceDoc) {
      return res.status(404).json({
        message: "Workspace not found",
      });
    }

    // Attach dynamic manager
    const manager = await User.findOne({ managedWorkspaces: workspaceId }, "name email profilePicture");
    const workspace = { ...workspaceDoc, manager };

    res.status(200).json(workspace);
  } catch (error) {
    console.error("getWorkspaceDetails Error:", error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};

const getWorkspaceProjects = async (req, res) => {
  try {
    const { workspaceId } = req.params;

    const query = { _id: workspaceId };
    if (!req.user.isAdmin) {
        query["members.user"] = req.user._id;
    }

    const workspaceDoc = await Workspace.findOne(query)
        .populate("members.user", "name email profilePicture")
        .lean();

    if (!workspaceDoc) {
      return res.status(404).json({
        message: "Workspace not found",
      });
    }

    const manager = await User.findOne({ managedWorkspaces: workspaceId }, "name email profilePicture");
    const workspace = { ...workspaceDoc, manager };

    const projects = await Project.find({
      workspace: workspaceId,
      isArchived: false,
      ...(req.user.isAdmin ? {} : { members: { $elemMatch: { user: req.user._id } } }),
    })
      .populate("tasks", "status")
      .populate("members.user", "name email profilePicture") // Populate member details
      .sort({ createdAt: -1 })
      .lean();

    // Calculate dynamic progress based on task status
    projects.forEach(project => {
        const totalTasks = project.tasks.length;
        const completedTasks = project.tasks.filter(t => t.status === "Done").length;
        project.progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    });

    res.status(200).json({ projects, workspace });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};

const getWorkspaceStats = async (req, res) => {
  try {
    const { workspaceId } = req.params;

    const workspace = await Workspace.findById(workspaceId);

    if (!workspace) {
      return res.status(404).json({
        message: "Workspace not found",
      });
    }

    // Skip member check for admins, but continue to process stats
    if (!req.user.isAdmin) {
      const isMember = workspace.members.some(
        (member) => member.user.toString() === req.user._id.toString()
      );

      if (!isMember) {
        return res.status(403).json({
          message: "You are not a member of this workspace",
        });
      }
    }

    const [totalProjects, projects] = await Promise.all([
      Project.countDocuments({ workspace: workspaceId }),
      Project.find({ workspace: workspaceId })
        .populate(
          "tasks",
          "title status dueDate project updatedAt isArchived priority"
        )
        .sort({ createdAt: -1 }),
    ]);

    const totalTasks = projects.reduce((acc, project) => {
      return acc + project.tasks.length;
    }, 0);

    const totalProjectInProgress = projects.filter(
      (project) => project.status === "In Progress"
    ).length;
    // const totalProjectCompleted = projects.filter(
    //   (project) => project.status === "Completed"
    // ).length;

    const totalTaskCompleted = projects.reduce((acc, project) => {
      return (
        acc + project.tasks.filter((task) => task.status === "Done").length
      );
    }, 0);

    const totalTaskToDo = projects.reduce((acc, project) => {
      return (
        acc + project.tasks.filter((task) => task.status === "To Do").length
      );
    }, 0);

    const totalTaskInProgress = projects.reduce((acc, project) => {
      return (
        acc +
        project.tasks.filter((task) => task.status === "In Progress").length
      );
    }, 0);

    const tasks = projects.flatMap((project) => project.tasks);

    // get upcoming task in next 7 days

    const upcomingTasks = tasks.filter((task) => {
      const taskDate = new Date(task.dueDate);
      const today = new Date();
      return (
        taskDate > today &&
        taskDate <= new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
      );
    });

    const taskTrendsData = [
      { name: "Sun", completed: 0, inProgress: 0, toDo: 0 },
      { name: "Mon", completed: 0, inProgress: 0, toDo: 0 },
      { name: "Tue", completed: 0, inProgress: 0, toDo: 0 },
      { name: "Wed", completed: 0, inProgress: 0, toDo: 0 },
      { name: "Thu", completed: 0, inProgress: 0, toDo: 0 },
      { name: "Fri", completed: 0, inProgress: 0, toDo: 0 },
      { name: "Sat", completed: 0, inProgress: 0, toDo: 0 },
    ];

    // get last 7 days tasks date
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date;
    }).reverse();

    // populate

    for (const project of projects) {
      for (const task in project.tasks) {
        const taskDate = new Date(task.updatedAt);

        const dayInDate = last7Days.findIndex(
          (date) =>
            date.getDate() === taskDate.getDate() &&
            date.getMonth() === taskDate.getMonth() &&
            date.getFullYear() === taskDate.getFullYear()
        );

        if (dayInDate !== -1) {
          const dayName = last7Days[dayInDate].toLocaleDateString("en-US", {
            weekday: "short",
          });

          const dayData = taskTrendsData.find((day) => day.name === dayName);

          if (dayData) {
            switch (task.status) {
              case "Done":
                dayData.completed++;
                break;
              case "In Progress":
                dayData.inProgress++;
                break;
              case "To Do":
                dayData.toDo++;
                break;
            }
          }
        }
      }
    }

    // get project status distribution
    const projectStatusData = [
      { name: "Completed", value: 0, color: "#10b981" },
      { name: "In Progress", value: 0, color: "#3b82f6" },
      { name: "Planning", value: 0, color: "#f59e0b" },
    ];

    for (const project of projects) {
      switch (project.status) {
        case "Completed":
          projectStatusData[0].value++;
          break;
        case "In Progress":
          projectStatusData[1].value++;
          break;
        case "Planning":
          projectStatusData[2].value++;
          break;
      }
    }

    // Task priority distribution
    const taskPriorityData = [
      { name: "High", value: 0, color: "#ef4444" },
      { name: "Medium", value: 0, color: "#f59e0b" },
      { name: "Low", value: 0, color: "#6b7280" },
    ];

    for (const task of tasks) {
      switch (task.priority) {
        case "High":
          taskPriorityData[0].value++;
          break;
        case "Medium":
          taskPriorityData[1].value++;
          break;
        case "Low":
          taskPriorityData[2].value++;
          break;
      }
    }

    const workspaceProductivityData = [];

    for (const project of projects) {
      const projectTask = tasks.filter(
        (task) => task.project.toString() === project._id.toString()
      );

      const completedTask = projectTask.filter(
        (task) => task.status === "Done" && task.isArchived === false
      );

      workspaceProductivityData.push({
        name: project.title,
        completed: completedTask.length,
        total: projectTask.length,
      });
    }

    const stats = {
      totalProjects,
      totalTasks,
      totalProjectInProgress,
      totalTaskCompleted,
      totalTaskToDo,
      totalTaskInProgress,
    };

    res.status(200).json({
      stats,
      taskTrendsData,
      projectStatusData,
      taskPriorityData,
      workspaceProductivityData,
      upcomingTasks,
      recentProjects: projects.slice(0, 5),
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};

const inviteUserToWorkspace = async (req, res) => {
  try {
    const { workspaceId } = req.params;
    const { email } = req.body;

    const workspace = await Workspace.findById(workspaceId);

    if (!workspace) {
      return res.status(404).json({
        message: "Workspace not found",
      });
    }

    // Authorization Check: Admin, Owner, or Workspace Manager
    const isManager = req.user.managedWorkspaces && req.user.managedWorkspaces.some(id => id.toString() === workspaceId);
    const isAdmin = req.user.isAdmin;
    
    if (isAdmin || isManager) {
        // Allowed
    } else {
        const userMemberInfo = workspace.members.find(
          (member) => member.user.toString() === req.user._id.toString()
        );

        if (!userMemberInfo || !["admin", "owner"].includes(userMemberInfo.role)) {
          return res.status(403).json({
            message: "You are not authorized to invite members to this workspace",
          });
        }
    }

    const existingUser = await User.findOne({ email });

    if (!existingUser) {
      return res.status(400).json({
        message: "No user found with this email address. Please ensure the user is registered on the platform.",
      });
    }

    const isMember = workspace.members.some(
      (member) => member.user.toString() === existingUser._id.toString()
    );

    if (isMember) {
      return res.status(400).json({
        message: "This user is already a member of this workspace",
      });
    }

    const isInvited = await WorkspaceInvite.findOne({
      user: existingUser._id,
      workspaceId: workspaceId,
    });

    if (isInvited && isInvited.expiresAt > new Date()) {
      return res.status(400).json({
        message: "An invitation has already been sent to this user. Please wait for them to accept or the invitation to expire.",
      });
    }

    if (isInvited && isInvited.expiresAt < new Date()) {
      await WorkspaceInvite.deleteOne({ _id: isInvited._id });
    }

    // Default role is always 'member' since we removed role selection
    const inviteRole = "member";

    const inviteToken = jwt.sign(
      {
        user: existingUser._id,
        workspaceId: workspaceId,
        role: inviteRole,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    await WorkspaceInvite.create({
      user: existingUser._id,
      workspaceId: workspaceId,
      token: inviteToken,
      role: inviteRole,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    const invitationLink = `${process.env.FRONTEND_URL}/workspace-invite/${workspace._id}?tk=${inviteToken}`;

    const emailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #333;">You're Invited to Join a Workspace! 🎉</h2>
        
        <p style="color: #555; font-size: 16px;">
          Hello <strong>${existingUser.name}</strong>,
        </p>
        
        <p style="color: #555; font-size: 16px;">
          You have been invited to join the workspace "<strong>${workspace.name}</strong>" on TaskHub.
        </p>
        
        ${workspace.description ? `<p style="color: #777; font-size: 14px; font-style: italic;">${workspace.description}</p>` : ''}
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${invitationLink}" 
             style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
            Accept Invitation
          </a>
        </div>
        
        <p style="color: #777; font-size: 14px;">
          Or copy and paste this link in your browser:<br/>
          <a href="${invitationLink}" style="color: #3b82f6;">${invitationLink}</a>
        </p>
        
        <p style="color: #999; font-size: 12px; margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px;">
          This invitation will expire in 7 days. If you didn't expect this invitation, you can safely ignore this email.
        </p>
      </div>
    `;

    await sendEmail(
      email,
      `You've been invited to join "${workspace.name}" workspace`,
      emailContent
    );

    res.status(200).json({
      message: "Invitation sent successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};

const acceptGenerateInvite = async (req, res) => {
  try {
    const { workspaceId } = req.params;

    const workspace = await Workspace.findById(workspaceId);

    if (!workspace) {
      return res.status(404).json({
        message: "Workspace not found",
      });
    }

    const isMember = workspace.members.some(
      (member) => member.user.toString() === req.user._id.toString()
    );

    if (isMember) {
      return res.status(400).json({
        message: "You are already a member of this workspace",
      });
    }

    // Check if this will be the first non-admin member
    const regularMembers = workspace.members.filter(m => m.role !== "admin");
    const isFirstMember = regularMembers.length === 0;

    workspace.members.push({
      user: req.user._id,
      role: "member",
      joinedAt: new Date(),
    });

    await workspace.save();

    // If this is the first non-admin member, make them the workspace manager
    if (isFirstMember) {
      await User.findByIdAndUpdate(req.user._id, {
        $addToSet: { managedWorkspaces: workspaceId }
      });
    }

    await recordActivity(
      req.user._id,
      "joined_workspace",
      "Workspace",
      workspaceId,
      {
        description: `Joined ${workspace.name} workspace${isFirstMember ? ' as Workspace Manager' : ''}`,
      }
    );

    res.status(200).json({
      message: isFirstMember 
        ? "Invitation accepted successfully! You are now the Workspace Manager." 
        : "Invitation accepted successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};

const acceptInviteByToken = async (req, res) => {
  try {
    const { token } = req.body;

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const { user, workspaceId, role } = decoded;

    const workspace = await Workspace.findById(workspaceId);

    if (!workspace) {
      return res.status(404).json({
        message: "Workspace not found",
      });
    }

    const isMember = workspace.members.some(
      (member) => member.user.toString() === user.toString()
    );

    if (isMember) {
      return res.status(400).json({
        message: "User already a member of this workspace",
      });
    }

    const inviteInfo = await WorkspaceInvite.findOne({
      user: user,
      workspaceId: workspaceId,
    });

    if (!inviteInfo) {
      return res.status(404).json({
        message: "Invitation not found",
      });
    }

    if (inviteInfo.expiresAt < new Date()) {
      return res.status(400).json({
        message: "Invitation has expired",
      });
    }

    // Check if this will be the first non-admin member
    const regularMembers = workspace.members.filter(m => m.role !== "admin");
    const isFirstMember = regularMembers.length === 0;

    workspace.members.push({
      user: user,
      role: role || "member",
      joinedAt: new Date(),
    });

    await workspace.save();

    // If this is the first non-admin member, make them the workspace manager
    if (isFirstMember) {
      await User.findByIdAndUpdate(user, {
        $addToSet: { managedWorkspaces: workspaceId }
      });
    }

    await Promise.all([
      WorkspaceInvite.deleteOne({ _id: inviteInfo._id }),
      recordActivity(user, "joined_workspace", "Workspace", workspaceId, {
        description: `Joined ${workspace.name} workspace${isFirstMember ? ' as Workspace Manager' : ''}`,
      }),
    ]);

    res.status(200).json({
      message: isFirstMember 
        ? "Invitation accepted successfully! You are now the Workspace Manager." 
        : "Invitation accepted successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};



const deleteWorkspace = async (req, res) => {
    try {
        const { workspaceId } = req.params;
        const workspace = await Workspace.findById(workspaceId);

        if (!workspace) {
            return res.status(404).json({ message: "Workspace not found" });
        }

        // Auth: System Admin OR Workspace Owner
        if (!req.user.isAdmin && workspace.owner.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Unauthorized to delete workspace" });
        }

        // Cascade delete logic (Projects, Tasks, etc.) would go here.
        // For MVP, simplistic delete.
        await Workspace.findByIdAndDelete(workspaceId);
        
        // Remove from users managedWorkspaces if applicable (logic handled in User model hooks usually, but simplistic here)
        
        await recordActivity(req.user._id, "deleted_workspace", "Workspace", workspaceId, {
            description: `Deleted workspace ${workspace.name}`,
        });

        res.status(200).json({ message: "Workspace deleted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
};

const removeMemberFromWorkspace = async (req, res) => {
    try {
        const { workspaceId, memberId } = req.params;
        const workspace = await Workspace.findById(workspaceId);

        if (!workspace) return res.status(404).json({ message: "Workspace not found" });

        // Auth: System Admin, Owner, or Workspace Admin
        const operatorMember = workspace.members.find(m => m.user.toString() === req.user._id.toString());
        const isOperatorAdmin = operatorMember?.role === "admin" || operatorMember?.role === "owner";
        
        if (!req.user.isAdmin && !isOperatorAdmin && workspace.owner.toString() !== req.user._id.toString()) {
             return res.status(403).json({ message: "Unauthorized to remove members" });
        }

        // Prevent removing the Owner
        const memberToRemove = workspace.members.find(m => m.user.toString() === memberId);
        if (memberToRemove && memberToRemove.role === "owner") {
            return res.status(403).json({ message: "Cannot remove workspace owner" });
        }

        workspace.members = workspace.members.filter(m => m.user.toString() !== memberId);
        await workspace.save();

        res.status(200).json({ message: "Member removed successfully", workspace });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
};

const changeMemberRole = async (req, res) => {
    try {
        const { workspaceId, memberId } = req.params;
        const { role } = req.body; // owner, admin, member, viewer
        
        const workspace = await Workspace.findById(workspaceId);
        if (!workspace) return res.status(404).json({ message: "Workspace not found" });

        // Auth check
        const operatorMember = workspace.members.find(m => m.user.toString() === req.user._id.toString());
        const isOperatorOwner = operatorMember?.role === "owner" || workspace.owner.toString() === req.user._id.toString();

        if (!req.user.isAdmin && !isOperatorOwner) {
            return res.status(403).json({ message: "Only Owner or System Admin can change roles" });
        }

        const memberIndex = workspace.members.findIndex(m => m.user.toString() === memberId);
        if (memberIndex === -1) return res.status(404).json({ message: "Member not found" });

        workspace.members[memberIndex].role = role;
        await workspace.save();

        res.status(200).json({ message: "Role updated successfully", workspace });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
};

const updateWorkspace = async (req, res) => {
    try {
        const { workspaceId } = req.params;
        const { name, description, color } = req.body;

        const workspace = await Workspace.findById(workspaceId);

        if (!workspace) {
            return res.status(404).json({ message: "Workspace not found" });
        }

        // Authorization: Admin or Workspace Owner
        if (!req.user.isAdmin) {
            const member = workspace.members.find(
                (m) => m.user.toString() === req.user._id.toString()
            );
            
            if (!member || (member.role !== "owner" && member.role !== "admin")) {
                return res.status(403).json({ message: "Not authorized to update workspace" });
            }
        }

        if (name) workspace.name = name;
        if (description !== undefined) workspace.description = description;
        if (color) workspace.color = color;

        await workspace.save();

        res.status(200).json(workspace);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export {
  createWorkspace,
  getWorkspaces,
  getWorkspaceDetails,
  getWorkspaceProjects,
  getWorkspaceStats,
  inviteUserToWorkspace,
  acceptGenerateInvite,
  acceptInviteByToken,
  deleteWorkspace,
  removeMemberFromWorkspace,
  changeMemberRole,
  updateWorkspace,
};
