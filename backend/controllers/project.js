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

    // Check if user is in project already
    if (project.members.some(m => m.user.toString() === userId)) {
        return res.status(400).json({ message: "User already in project" });
    }

    // Add user
    project.members.push({ user: userId, role: role || 'contributor' });
    await project.save();

    res.status(200).json({ message: "Member added", project });
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
    const { status } = req.body;

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

    if (status) {
        project.status = status;
    }

    await project.save();

    res.status(200).json(project);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};

export { createProject, getProjectDetails, getProjectTasks, addProjectMember, updateProjectMemberRole, updateProject };
