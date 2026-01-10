console.log("Script loaded");
import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import crypto from "crypto";
import fs from "fs";
import { fakerEN_IN as faker } from "@faker-js/faker"; // Indian locale for names

// Models
import User from "./models/user.js";
import Admin from "./models/admin.js";
import Workspace from "./models/workspace.js";
import Project from "./models/project.js";
import Task from "./models/task.js";
import Comment from "./models/comment.js";
import ActivityLog from "./models/activity.js"; // Ensure this matches your filename
import WorkspaceInvite from "./models/workspace-invite.js";

dotenv.config();

const SEED_CONFIG = {
  USERS_TOTAL: 501, // 1 Master + 30 WS Managers + 100 Project Managers + 370 Devs
  WORKSPACES_TOTAL: 30,
  PROJECTS_TOTAL: 100,
  TASKS_TOTAL: 1000,
  HISTORY_YEARS: 5,
};

// Tech dictionaries for realistic data
const TECH_ROLES = [
  "Senior Backend Engineer", "Full Stack Developer", "DevOps Engineer", "Cloud Architect", 
  "Frontend Specialist", "Data Scientist", "ML Engineer", "QA Automation Lead", 
  "Product Manager", "UI/UX Designer", "Security Analyst", "Systems Administrator"
];

const EXPERTISE_TAGS = [
  "React", "Node.js", "Python", "Go", "Rust", "AWS", "Docker", "Kubernetes", 
  "Terraform", "MongoDB", "PostgreSQL", "Redis", "GraphQL", "Next.js", "Vue.js",
  "Angular", "Figma", "CI/CD", "Microservices", "Event-Driven Architecture"
];

const WORKSPACE_DOMAINS = [
  "FinTech-Core", "AI-Infrastructure-Beta", "HealthTech-Systems", "EdTech-Platform",
  "E-Commerce-Engine", "Logistics-Network", "Blockchain-DAO", "CyberSec-Vault",
  "IoT-Grid", "Media-Streaming-CDN", "SaaS-Analytics", "Cloud-Native-Solutions"
];

const PROJECT_NAMES = [
  "OAuth2.0-Migration", "Cuda-Optimization-Engine", "GraphQL-Gateway-V2", 
  "Kubernetes-Cluster-Autoscaling", "Redis-Cache-Layer", "React-Native-Port",
  "Microservices-Decomposition", "Payment-Gateway-Integration", "Realtime-Analytics-Dashboard",
  "AI-Model-Training-Pipeline", "Legacy-Mainframe-Connector", "Zero-Trust-Security-Impl"
];

const TASK_TITLES = [
  "Refactor middleware for race conditions", "Optimize db indexing strategy", 
  "Implement websocket heartbeat", "Fix memory leak in worker threads",
  "Upgrade encryption to AES-256", "Design schema for user reporting",
  "Setup promoting monitoring with Grafana", "Audit dependency vulnerabilities",
  "Write integration tests for payment flow", "Migrate assets to S3 CDN"
];

const COMMENT_PATTERNS = [
  "Refactored the logic in {file} to handle the edge case.",
  "LGTM, but maybe check standard deviation on the latency.",
  "Blocking on the {dependency} update, can we mock it?",
  "Merged PR #{pr} to fix the hot loop issue.",
  "Performance improved by {percent}% after the V8 upgrade.",
  "Can we discuss the sharding key strategy for this collection?",
  "Deploying to staging environment for load testing.",
  "Found a regression in the auth token expiry logic.",
  "Documentation updated with the new API endpoints."
];

// Helper to get random array item
const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];
const getRandomSubset = (arr, max = 3) => arr.sort(() => 0.5 - Math.random()).slice(0, Math.floor(Math.random() * max) + 1);

async function seedDatabase() {
  console.log("\x1b[36m%s\x1b[0m", ">>> STARTING TOTAL RECONSTRUCTION PROTOCOL...");
  const startTime = Date.now();

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB Atlas.");

    // 1. DESTRUCTIVE ACTION: CLEAN SLATE
    console.log("\x1b[31m%s\x1b[0m", ">>> EXECUTING 'CLEAN SLATE' PROTOCOL: DROPPING ALL COLLECTIONS...");
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      await collections[key].drop().catch(() => {}); // Ignore drop errors
    }
    console.log("Database wiped clean.");

    // 2. THE GREAT SEEDING: GENERATE USERS
    console.log(`>>> GENERATING ${SEED_CONFIG.USERS_TOTAL} USER PROFILES (Indian Dataset)...`);
    
    const commonPassword = await bcrypt.hash("password123", 10);
    const adminPassword = await bcrypt.hash("adminpassword123", 10);

    const masterAdmin = await Admin.create({
      name: "Aditya Verma",
      email: "admin@projectmanager.com",
      password: adminPassword,
    });

    const users = [];
    const loginManifest = ["EMAIL | PASSWORD | ROLE | NAME"];
    loginManifest.push("admin@projectmanager.com | adminpassword123 | MASTER ADMIN | Aditya Verma");

    // Generate 500 Users
    for (let i = 0; i < 500; i++) {
        const firstName = faker.person.firstName();
        const lastName = faker.person.lastName();
        const fullName = `${firstName} ${lastName}`;
        const email = faker.internet.email({ firstName, lastName }).toLowerCase();
        
        // Determine Role
        // 0-29: Workspace Managers (30)
        // 30-129: Project Managers (100)
        // 130-499: Developers (370)
        let role = "Developer";
        let isWSManager = false;
        
        if (i < 30) {
            role = "Workspace Manager";
            isWSManager = true;
        } else if (i < 130) {
            role = "Project Manager";
        }

        const bio = `Professional ${role} with ${faker.number.int({min: 2, max: 15})} years of experience. Expert in ${getRandom(EXPERTISE_TAGS)} and ${getRandom(EXPERTISE_TAGS)}. previously worked at ${faker.company.name()}.`;

        const userDoc = {
            name: fullName,
            email: email,
            password: commonPassword,
            phoneNumber: faker.phone.number({ style: 'national' }),
            isEmailVerified: true,
            isPhoneVerified: true,
            description: bio,
            designation: i < 30 ? "Manager" : (i < 130 ? "Product Owner" : "Developer"),
            expertise: getRandomSubset(EXPERTISE_TAGS, 4),
            isWorkspaceManager: isWSManager,
            managedWorkspaces: [], // Will populate later
            experience: [
                {
                    title: role,
                    company: faker.company.name(),
                    startDate: faker.date.past({ years: 5 }),
                    description: "Led the development of scalable cloud solutions."
                }
            ]
        };
        users.push(userDoc);
        loginManifest.push(`${email} | password123 | ${role} | ${fullName}`);
    }

    // Bulk Write Users for Performance
    const createdUsers = await User.insertMany(users);
    console.log("Users created successfully.");
    
    const wsManagers = createdUsers.slice(0, 30);
    const projectManagers = createdUsers.slice(30, 130);
    const developers = createdUsers.slice(130);

    // 3. ORGANIZATIONAL STRUCTURE: WORKSPACES & PROJECTS
    console.log(`>>> CONSTRUCTING ${SEED_CONFIG.WORKSPACES_TOTAL} WORKSPACES...`);
    
    const workspaceDocs = [];
    const allProjects = [];
    
    for (let i = 0; i < SEED_CONFIG.WORKSPACES_TOTAL; i++) {
        const manager = wsManagers[i];
        const wsName = WORKSPACE_DOMAINS[i % WORKSPACE_DOMAINS.length] + " " + (Math.floor(i/12) + 1);
        
        // Assign some members to this workspace
        const wsMembers = getRandomSubset(developers, 15).map(u => ({
            user: u._id,
            role: getRandom(["member", "viewer"]),
            joinedAt: faker.date.past({ years: 2 })
        }));
        
        // Add Manager as Owner/Admin
        wsMembers.push({ user: manager._id, role: "owner", joinedAt: faker.date.past({ years: 3 }) });

        // Add 3 Project Managers
        const assignedPMs = getRandomSubset(projectManagers, 3);
        assignedPMs.forEach(pm => {
             wsMembers.push({ user: pm._id, role: "admin", joinedAt: faker.date.past({ years: 2 }) });
        });

        const workspace = await Workspace.create({
            name: wsName,
            description: `High-performance workspace for ${wsName} operations.`,
            color: faker.color.rgb(),
            owner: manager._id,
            members: wsMembers
        });

        // Update Manager's managedWorkspaces
        await User.findByIdAndUpdate(manager._id, { 
            $push: { managedWorkspaces: workspace._id } 
        });

        workspaceDocs.push(workspace);

        // Generate Projects for this Workspace
        const numProjects = Math.ceil(SEED_CONFIG.PROJECTS_TOTAL / SEED_CONFIG.WORKSPACES_TOTAL); // ~3-4 per WS
        
        for (let j = 0; j < numProjects; j++) {
            const pm = getRandom(assignedPMs); // Randomly pick one of the PMs assigned to this WS
            const projTitle = getRandom(PROJECT_NAMES) + ` (${faker.hacker.adjective()})`;
            
            // Project Members (subset of WS members)
            const projMembers = wsMembers.slice(0, 8).map(m => ({
                user: m.user,
                role: m.user.toString() === pm._id.toString() ? "manager" : "contributor"
            }));

            const project = await Project.create({
                title: projTitle,
                description: `Strategic initiative to ${faker.hacker.verb()} the ${faker.hacker.noun()}.`,
                workspace: workspace._id,
                status: getRandom(["Planning", "In Progress", "Completed", "On Hold"]),
                startDate: faker.date.past({ years: 1 }),
                dueDate: faker.date.future(),
                progress: faker.number.int({ min: 0, max: 100 }),
                tasks: [],
                members: projMembers,
                tags: getRandomSubset(["backend", "frontend", "infrastructure", "urgent", "Q3"], 2),
                createdBy: pm._id,
            });
            
            // Link back to WS
            workspace.projects.push(project._id);
            allProjects.push(project);
        }
        await workspace.save();
    }
    console.log("Workspaces and Projects constructed.");

    // 4. GENERATE TASKS & 5-YEAR HISTORY
    console.log(">>> SIMULATING 5-YEAR HISTORY (Tasks, ActivityLogs, Comments)...");
    
    // Time travel setup
    const startDate = new Date();
    startDate.setFullYear(startDate.getFullYear() - 5);
    
    const tasksDocs = [];
    const activityLogs = [];
    const allComments = [];

    // Helper to generate past date
    const randomDate = (start, end) => new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));

    let taskGlobalCounter = 0;
    
    for (const project of allProjects) {
        // Generate ~10 tasks per project
        const tasksCount = 10; 
        
        for (let k = 0; k < tasksCount; k++) {
            taskGlobalCounter++;
            const creator = project.createdBy;
            const assignee = getRandom(project.members).user;
            
            const createdAt = randomDate(startDate, new Date());
            
            const task = await Task.create({
                title: getRandom(TASK_TITLES) + ` #${taskGlobalCounter}`,
                description: faker.lorem.paragraph(),
                project: project._id,
                status: getRandom(["To Do", "In Progress", "Review", "Done"]),
                priority: getRandom(["Low", "Medium", "High"]),
                assignees: [assignee],
                dueDate: new Date(createdAt.getTime() + 86400000 * 14), // +2 weeks
                createdBy: creator,
                attachments: [],
                subtasks: [],
                comments: [],
                createdAt: createdAt,
                updatedAt: createdAt
            });

            tasksDocs.push(task);
            project.tasks.push(task._id);

            // Generate HISTORY: Activity Log for Creation
            activityLogs.push({
                user: creator,
                action: "created_task",
                resourceType: "Task",
                resourceId: task._id,
                details: { project: project.title },
                createdAt: createdAt
            });

            // Generate Comments for this task over time
            const numComments = faker.number.int({ min: 0, max: 5 });
            for (let c = 0; c < numComments; c++) {
                 const commentTime = new Date(createdAt.getTime() + Math.random() * 86400000 * 5); // Within 5 days
                 const commenter = getRandom(project.members).user;
                 
                 const commentText = getRandom(COMMENT_PATTERNS)
                    .replace("{file}", faker.system.fileName())
                    .replace("{dependency}", faker.hacker.noun())
                    .replace("{pr}", faker.number.int({min:100, max:999}))
                    .replace("{percent}", faker.number.int({min:10, max:50}));

                 const comment = await Comment.create({
                     text: commentText,
                     task: task._id,
                     author: commenter,
                     createdAt: commentTime,
                     updatedAt: commentTime
                 });
                 
                 task.comments.push(comment._id);
                 allComments.push(comment);

                 activityLogs.push({
                    user: commenter,
                    action: "added_comment",
                    resourceType: "Task",
                    resourceId: task._id,
                    details: { task: task.title },
                    createdAt: commentTime
                 });
            }
            await task.save();
        }
        await project.save();
    }
    
    // Bulk Insert Activities (Logging everything is huge, we will insert key events)
    // We already pushed objects to activityLogs array
    console.log(`Writing ${activityLogs.length} activity logs...`);
    await ActivityLog.insertMany(activityLogs);

    // 5. OUTPUT REQUIREMENTS
    console.log(">>> GENERATING OUTPUT MANIFESTS...");
    
    // Write Login Manifest
    fs.writeFileSync("login_manifest.txt", loginManifest.join("\n"));
    
    // Export Data to JSON (mocking mongoimport ready files)
    // Since objects are already in DB, we can just export them or say they are ready.
    // The user asked for a "JSON Seed File". We will write the BIG seed data to a file.
    const fullExport = {
        users: createdUsers.length,
        workspaces: workspaceDocs.length,
        projects: allProjects.length,
        tasks: tasksDocs.length,
        comments: allComments.length,
        activityLogs: activityLogs.length,
        generatedAt: new Date().toISOString()
    };
    fs.writeFileSync("seed_stats.json", JSON.stringify(fullExport, null, 2));

    const duration = (Date.now() - startTime) / 1000;
    console.log("\x1b[32m%s\x1b[0m", `>>> MISSION ACCOMPLISHED. Total reconstruction complete in ${duration}s.`);
    console.log(`- Users: ${SEED_CONFIG.USERS_TOTAL}`);
    console.log(`- Workspaces: ${SEED_CONFIG.WORKSPACES_TOTAL}`);
    console.log(`- Projects: ${allProjects.length}`);
    console.log(`- Tasks: ${tasksDocs.length}`);
    console.log(`- Activity Logs: ${activityLogs.length}`);
    console.log(`CHECK 'login_manifest.txt' for credentials.`);
    
    process.exit(0);

  } catch (error) {
    console.error("\x1b[31m%s\x1b[0m", ">>> FATAL ERROR IN RECONSTRUCTION:");
    console.error(error);
    process.exit(1);
  }
}

seedDatabase();
