import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import crypto from "crypto";
import User from "./models/user.js";
import Admin from "./models/admin.js";
import Workspace from "./models/workspace.js";
import Project from "./models/project.js";
import Task from "./models/task.js";
import Comment from "./models/comment.js";
import WorkspaceInvite from "./models/workspace-invite.js";

import fs from "fs";

dotenv.config();

// Helper to get random item from array
const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];
const getRandomSubset = (arr, max = 3) => {
    const shuffled = arr.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, Math.floor(Math.random() * max) + 1);
};


const names = ["Alice", "Bob", "Charlie", "David", "Eve", "Frank", "Grace", "Heidi", "Ivan", "Judy", "Kevin", "Liam", "Mia", "Noah", "Olivia"];
const domains = ["tech.com", "corp.net", "agency.io", "studio.co"];
const projectTitles = ["Website Redesign", "Mobile App Launch", "API Migration", "Database Optimization", "Q4 Marketing Strategy", "Employee Onboarding", "Security Audit", "Cloud Infrastructure", "SEO Campaign", "Documentation Overhaul", "Legacy Code Cleanup", "Payment Gateway Integration"];
const taskTitles = ["Fix Bug #102", "Write Unit Tests", "Design Homepage", "Setup CI/CD", "Client Meeting", "Code Review", "Update Readme", "Optimize Images", "Configure Firewall", "Draft Blog Post", "Refactor Auth Module", "Update Dependencies"];

const seedDatabase = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to MongoDB for Bulk Seeding...");

        // 1. CLEAR DATABASE (Drop collections to remove stale indexes)
        console.log("Dropping existing collections...");
        await Comment.deleteMany({}); // Ensure comments are cleared even if drop fails logic below covers it but explicit helps
        const collections = mongoose.connection.collections;
        for (const key in collections) {
            const collection = collections[key];
            try {
                await collection.drop();
                console.log(`Dropped ${key}`);
            } catch (error) {
                if (error.code === 26) {
                    console.log(`Collection ${key} not found (skip)`);
                } else {
                    console.error(`Error dropping ${key}:`, error);
                }
            }
        }

        const passHash = await bcrypt.hash("password123", 10);
        const adminHash = await bcrypt.hash("adminpassword123", 10);

        // 2. CREATE MASTER ADMIN
        console.log("Creating Master Admin...");
        const admin = await Admin.create({
            name: "Master Admin",
            email: "admin@projectmanager.com",
            password: adminHash,
        });
        const createdAdmins = [admin]; // Keep array structure for compatibility below

        // 3. CREATE USERS (20+)
        console.log("Creating 20 Users...");
        const users = [];
        const usersData = [];
        for (let i = 0; i < 20; i++) {
            usersData.push({
                name: `${names[i % names.length]} User`,
                email: i === 0 ? "manager@test.com" : `user${i}@test.com`,
                password: passHash,
                isEmailVerified: true,
                managedWorkspaces: [],
                isWorkspaceManager: false, 
                profilePicture: `https://api.dicebear.com/7.x/avataaars/svg?seed=${names[i]}`,
            });
        }
        
        // Use loop to create to ensure doc methods work
        for (const uData of usersData) {
            const u = await User.create(uData);
            users.push(u);
            process.stdout.write(".");
        }
        console.log("\nUsers created.");
        
        // Separate users into potential roles
        const potentialManagers = users.slice(0, 5); // First 5 are managers
        const regularMembers = users.slice(5);

        // 4. CREATE WORKSPACES (10+)
        console.log("Creating 12 Workspaces...");
        const colors = ["#ef4444", "#f97316", "#f59e0b", "#84cc16", "#10b981", "#06b6d4", "#3b82f6", "#6366f1", "#8b5cf6", "#d946ef"];

        const workspaces = [];

        for (let i = 0; i < 12; i++) {
            console.log(`Processing Workspace ${i}...`);
            const manager = potentialManagers[i % potentialManagers.length];
            const members = [
                { user: manager._id, role: "admin" }, // Manager is admin of workspace
                ...getRandomSubset(regularMembers, 4).map(u => ({ user: u._id, role: getRandom(["member", "viewer"]) }))
            ];

            const ws = await Workspace.create({
                name: `${names[i]} Solutions ${i}`,
                description: `Workspace for ${names[i]}'s team projects`,
                color: colors[i % colors.length],
                owner: createdAdmins[0]._id, // Admins own workspaces in this system typically
                members: members
            });

            // Update Manager User
            console.log(`Updating manager ${manager.email}...`);
            // Re-fetch manager to ensure we have latest version if shared
            const currentManager = await User.findById(manager._id);
            if (currentManager) {
                if (!currentManager.managedWorkspaces.includes(ws._id)) {
                    currentManager.managedWorkspaces.push(ws._id);
                    currentManager.isWorkspaceManager = true;
                    await currentManager.save();
                }
            }
            workspaces.push(ws);
        }

        // 5. CREATE PROJECTS (15+)
        console.log("Creating 15 Projects...");
        const projects = [];
        for (let i = 0; i < 15; i++) {
            const ws = getRandom(workspaces);
            const creator = ws.members.find(m => m.role === 'admin').user; // Creator is manager
            const projectMembers = ws.members.map(m => ({
                user: m.user,
                role: m.role === 'admin' ? 'manager' : 'contributor'
            }));

            const project = await Project.create({
                title: projectTitles[i % projectTitles.length],
                description: `Detailed description for ${projectTitles[i]}`,
                status: getRandom(["Planning", "In Progress", "Completed", "On Hold"]),
                workspace: ws._id,
                createdBy: creator,
                members: projectMembers,
                tags: [getRandom(["dev", "design"]), getRandom(["Q1", "marketing", "urgent"])],
                startDate: new Date(),
                dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30), // +30 days
                progress: Math.floor(Math.random() * 101), // Random 0-100
            });

            // Link project to workspace
            ws.projects.push(project._id);
            await ws.save();
            projects.push(project);
            process.stdout.write(".");
        }
        console.log("\nProjects created.");

        // 6. CREATE TASKS (Increased Volume & Detail)
        const totalTasks = 120;
        console.log(`Creating ${totalTasks} Tasks with Subtasks and Comments...`);
        const tasks = [];
        const taskStatuses = ["To Do", "In Progress", "Review", "Done"];
        const commentTexts = [
            "This looks good to me.", "Can we update the color?", "Blocking on API.", "Ready for review.", 
            "Please check the latest commit.", "Deployed to staging.", "Need more specs.", "Great job!", 
            "Fixed in #404", "Re-opening due to regression."
        ];
        const subtaskTitles = [
            "Research requirements", "Draft initial design", "Setup environment", "Implement core logic", 
            "Write tests", "Refactor code", "Update documentation", "Deploy to dev", "QA verification"
        ];

        for (let i = 0; i < totalTasks; i++) {
            const project = getRandom(projects);
            
            // Find a valid manager/creator
            const managerMember = project.members.find(m => m.role === 'manager');
            const creator = managerMember ? managerMember.user : project.createdBy;
            
            // Assignee
            const assigneeMember = getRandom(project.members);
            const assignee = assigneeMember ? assigneeMember.user : creator;

            // Generate Subtasks (0-5)
            const subtasks = [];
            const numSubtasks = Math.floor(Math.random() * 6);
            for(let s=0; s<numSubtasks; s++) {
                subtasks.push({
                    title: getRandom(subtaskTitles),
                    completed: Math.random() > 0.5,
                    createdAt: new Date()
                });
            }

            const task = await Task.create({
                title: `${taskTitles[i % taskTitles.length]} - ${i}`,
                description: `This is a comprehensive task description for item ${i}. It includes details about requirements, scope, and implementation steps to ensure proper execution.`,
                status: getRandom(taskStatuses),
                priority: getRandom(["Low", "Medium", "High"]),
                project: project._id,
                createdBy: creator,
                assignees: [assignee],
                dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * (Math.floor(Math.random() * 20))),
                subtasks: subtasks,
                tags: [getRandom(["frontend", "backend", "bug", "feature"]), getRandom(["v1.0", "urgent", "nice-to-have"])]
            });

            // Generate Comments (1-4)
            const numComments = Math.floor(Math.random() * 4) + 1;
            for(let c=0; c<numComments; c++) {
                const commentAuthor = getRandom(project.members).user;
                const comment = await Comment.create({
                    text: getRandom(commentTexts),
                    task: task._id,
                    author: commentAuthor,
                });
                task.comments.push(comment._id);
            }
            await task.save();

            tasks.push(task);
            
            // Link task to project
            project.tasks.push(task._id);
            await project.save();
            process.stdout.write(".");
        }
        console.log("\nTasks created.");

        // 7. CREATE WORKSPACE INVITES (10+)
        console.log("Creating 10 Workspace Invites...");
        for (let i = 0; i < 10; i++) {
            const ws = getRandom(workspaces);
            // Create a fake user invite (user might exist or not, schema requires user ref so pick existing)
            const user = getRandom(regularMembers);
            
            // Ensure not already member to be realistic, or just allow overwrite for seed
            const token = crypto.randomBytes(32).toString("hex");
            
            await WorkspaceInvite.create({
                user: user._id,
                workspaceId: ws._id,
                token: token,
                role: "member",
                expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7)
            });
        }

        console.log("-----------------------------------------------");
        console.log("EXTENSIVE SEEDING COMPLETED");
        console.log(`Admins: 1 (Master Only)`);
        console.log(`Users: ${users.length}`);
        console.log("-----------------------------------------------");
        console.log("LOGIN CREDENTIALS:");
        console.log("-----------------------------------------------");
        console.log("MASTER ADMIN:");
        console.log("  Email: admin@projectmanager.com");
        console.log("  Pass:  adminpassword123");
        console.log("");
        console.log("USERS (Password for all: password123):");
        users.forEach(u => {
            const role = u.isWorkspaceManager ? "[MANAGER] " : "[MEMBER]  ";
            console.log(`  ${role} ${u.email} (${u.name})`);
        });
        console.log("-----------------------------------------------");

        process.exit(0);
    } catch (error) {
        console.error("SEEDING FAILED:", error);
        fs.writeFileSync("seed_error.txt", error.stack || error.toString());
        process.exit(1);
    }
};

seedDatabase();
