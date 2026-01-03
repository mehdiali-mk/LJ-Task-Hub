import mongoose from "mongoose";
import dotenv from "dotenv";
import Project from "../models/project.js";
import Task from "../models/task.js";
import User from "../models/user.js";
import Workspace from "../models/workspace.js";

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};

const debugArchivedTasks = async () => {
  await connectDB();

  try {
    // 1. Get a user (simulate req.user)
    const user = await User.findOne({});
    if (!user) {
        console.log("No users found.");
        return;
    }
    console.log(`Using user: ${user.name} (${user._id})`);

    // 2. Find projects where user is a member
    const projects = await Project.find({ "members.user": user._id });
    const projectIds = projects.map((p) => p._id);
    console.log(`Found ${projects.length} projects for user.`);

    // 3. Run the query involved in getArchivedTasks
    console.log("Running archived tasks query...");
    const tasks = await Task.find({
      project: { $in: projectIds },
      isArchived: true,
    })
      .populate({
        path: "project",
        select: "title workspace",
        populate: {
          path: "workspace",
          select: "name color",
        },
      })
      .populate("assignees", "name profilePicture")
      .sort({ updatedAt: -1 });

    console.log(`Query successful. Found ${tasks.length} archived tasks.`);
    
    if (tasks.length > 0) {
        const firstTask = tasks[0];
        console.log("Sample Task Project:", JSON.stringify(firstTask.project, null, 2));
    }

  } catch (error) {
    console.error("Error executing query:", error);
  } finally {
    await mongoose.disconnect();
  }
};

debugArchivedTasks();
