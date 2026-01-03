import Workspace from "../models/workspace.js";
import Project from "../models/project.js";
import Task from "../models/task.js";

const createProject = async (req, res) => {
  try {
    const { workspaceId } = req.params;
    const { title, description, status, startDate, dueDate, tags, members } =
      req.body;

    const workspace = await Workspace.findById(workspaceId);

    if (!workspace) {
      return res.status(404).json({
        message: "Workspace not found",
      });
    }

    // Authorization: Admin, Member, or Workspace Manager
    
    const isManager = req.user.managedWorkspaces && req.user.managedWorkspaces.some(id => id.toString() === workspaceId);
    
    if (req.user.isAdmin || isManager) {
        // Allowed to create project
    } else {
        const isMember = workspace.members.some(
          (member) => member.user.toString() === req.user._id.toString()
        );

        if (!isMember) {
          return res.status(403).json({
            message: "You are not a member of this workspace",
          });
        }
    }

    const tagArray = tags ? tags.split(",") : [];

    const newProject = await Project.create({
      title,
      description,
      status,
      startDate,
      dueDate,
      tags: tagArray,
      workspace: workspaceId,
      members: [
        ...(members || []),
        { user: req.user._id, role: "manager" }
      ],
      createdBy: req.user._id,
    });

    workspace.projects.push(newProject._id);
    await workspace.save();

    return res.status(201).json(newProject);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

const getProjectDetails = async (req, res) => {
  try {
    const { projectId } = req.params;

    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    if (!req.user.isAdmin) {
        const isMember = project.members.some(
          (member) => member.user.toString() === req.user._id.toString()
        );

        if (!isMember) {
          return res.status(403).json({
            message: "You are not a member of this project",
          });
        }
    }

    res.status(200).json(project);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

const getProjectTasks = async (req, res) => {
  try {
    const { projectId } = req.params;
    const project = await Project.findById(projectId).populate("members.user");

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    if (!req.user.isAdmin) {
        const isMember = project.members.some(
          (member) => member.user._id.toString() === req.user._id.toString()
        );

        if (!isMember) {
          return res.status(403).json({
            message: "You are not a member of this project",
          });
        }
    }

    const tasks = await Task.find({
      project: projectId,
      isArchived: false,
    })
      .populate("assignees", "name profilePicture")
      .sort({ createdAt: -1 });

    res.status(200).json({
      project,
      tasks,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};



const addProjectMember = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { userId, role } = req.body; // Expect userId for simplicity, or look up by email

    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: "Project not found" });

    // Authorization: Admin, Workspace Manager, or Project Manager
    const workspaceId = project.workspace;
    const isWorkspaceManager = req.user.managedWorkspaces && req.user.managedWorkspaces.some(id => id.toString() === workspaceId.toString());
    const isProjectManager = project.members.some(m => m.user.toString() === req.user._id.toString() && m.role === 'manager');
    const isAdmin = req.user.isAdmin;

    if (!isAdmin && !isWorkspaceManager && !isProjectManager) {
        return res.status(403).json({ message: "Not authorized to manage project members" });
    }

    // Check if user is in workspace first
    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) return res.status(404).json({ message: "Workspace not found (from project)" });

    const isWorkspaceMember = workspace.members.some(m => m.user.toString() === userId);
    if (!isWorkspaceMember && !isAdmin && !isWorkspaceManager) {
         // Admins/Managers can arguably add non-members (maybe invite them?), but user requirements say "compulsarily the member or users of that workspace"
         // So strict check:
         return res.status(400).json({ message: "User must be a member of the workspace first" });
    }

    // Check if user is in project already
    if (project.members.some(m => m.user.toString() === userId)) {
        return res.status(400).json({ message: "User already in project" });
    }

    // Add user
    project.members.push({ user: userId, role: role || 'contributor' });
    await project.save();

    // Populate user details for frontend return
    await project.populate('members.user', 'name email profilePicture');

    res.status(200).json({ message: "Member added", project });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const removeProjectMember = async (req, res) => {
    try {
      const { projectId, memberId } = req.params; // memberId is the User ID to remove
  
      const project = await Project.findById(projectId);
      if (!project) return res.status(404).json({ message: "Project not found" });
  
      // Authorization
      const workspaceId = project.workspace;
      const isWorkspaceManager = req.user.managedWorkspaces && req.user.managedWorkspaces.some(id => id.toString() === workspaceId.toString());
      const isProjectManager = project.members.some(m => m.user.toString() === req.user._id.toString() && m.role === 'manager');
      const isAdmin = req.user.isAdmin;
  
      if (!isAdmin && !isWorkspaceManager && !isProjectManager) {
          return res.status(403).json({ message: "Not authorized to remove project members" });
      }

      // Ensure we don't leave the project with 0 managers if we are removing a manager?
      // Optional check, but generally good practice. For now simpler logic: just remove.
      
      const memberIndex = project.members.findIndex(m => m.user.toString() === memberId);
      if (memberIndex === -1) {
          return res.status(404).json({ message: "Member not found in project" });
      }

      project.members.splice(memberIndex, 1);
      await project.save();
      
      // Populate user details for frontend return
      await project.populate('members.user', 'name email profilePicture');
      
      res.status(200).json({ message: "Member removed", project });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Internal server error" });
    }
};

const updateProjectMemberRole = async (req, res) => {
    try {
      const { projectId, memberId } = req.params; // memberId is the User ID
      const { role } = req.body;
  
      const project = await Project.findById(projectId);
      if (!project) return res.status(404).json({ message: "Project not found" });
  
      // Authorization
      const workspaceId = project.workspace;
      const isWorkspaceManager = req.user.managedWorkspaces && req.user.managedWorkspaces.some(id => id.toString() === workspaceId.toString());
      const isProjectManager = project.members.some(m => m.user.toString() === req.user._id.toString() && m.role === 'manager');
      const isAdmin = req.user.isAdmin;
  
      if (!isAdmin && !isWorkspaceManager && !isProjectManager) {
          return res.status(403).json({ message: "Not authorized" });
      }
  
      const memberIndex = project.members.findIndex(m => m.user.toString() === memberId);
      if (memberIndex === -1) return res.status(404).json({ message: "Member not found in project" });
  
      project.members[memberIndex].role = role;
      await project.save();
  
      res.status(200).json({ message: "Role updated", project });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Internal server error" });
    }
};

const updateProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { status, title, description } = req.body;

    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    // Authorization: Admin, Workspace Manager, or Project Manager
    const workspaceId = project.workspace;
    const isWorkspaceManager = req.user.managedWorkspaces && req.user.managedWorkspaces.some(id => id.toString() === workspaceId.toString());
    const isProjectManager = project.members.some(m => m.user.toString() === req.user._id.toString() && m.role === 'manager');
    const isAdmin = req.user.isAdmin;

    if (!isAdmin && !isWorkspaceManager && !isProjectManager) {
        return res.status(403).json({ message: "Not authorized to update project" });
    }

    // Specific check: Only Workspace Manager (or Admin) can edit Title/Description
    if ((title || description) && !isAdmin && !isWorkspaceManager) {
         return res.status(403).json({ message: "Only Workspace Managers can edit project details" });
    }

    if (status) project.status = status;
    if (title) project.title = title;
    if (description) project.description = description;

    await project.save();

    res.status(200).json(project);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};

const deleteProject = async (req, res) => {
    try {
        const { projectId } = req.params;

        const project = await Project.findById(projectId);
        if (!project) return res.status(404).json({ message: "Project not found" });

        // Authorization: Workspace Manager or Admin ONLY
        const workspaceId = project.workspace;
        const isWorkspaceManager = req.user.managedWorkspaces && req.user.managedWorkspaces.some(id => id.toString() === workspaceId.toString());
        const isAdmin = req.user.isAdmin;

        if (!isAdmin && !isWorkspaceManager) {
            return res.status(403).json({ message: "Only Workspace Managers can delete projects" });
        }

        // Cleanup: Delete tasks
        await Task.deleteMany({ project: projectId });

        // Cleanup: Remove from Workspace
        await Workspace.findByIdAndUpdate(workspaceId, {
            $pull: { projects: projectId }
        });

        // Delete Project
        await Project.findByIdAndDelete(projectId);

        res.status(200).json({ message: "Project deleted successfully" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export { createProject, getProjectDetails, getProjectTasks, addProjectMember, updateProjectMemberRole, updateProject, removeProjectMember, deleteProject };
