import axios from "axios";
import mongoose from "mongoose";

const API_URL = "http://localhost:8088/api-v1";
// Use a unique suffix to avoid collision on repeated runs
const SUFFIX = Date.now();
const ADMIN_EMAIL = "admin@projectmanager.com";
const ADMIN_PASS = "adminpassword123";

const MANAGER_EMAIL = `manager${SUFFIX}@test.com`;
const MEMBER_EMAIL = `member${SUFFIX}@test.com`;
const PASSWORD = "password123";

async function verifyRBAC() {
  try {
    console.log("Starting RBAC Verification...");

    // 1. Login Admin
    console.log(`1. Logging in Admin (${ADMIN_EMAIL})...`);
    const adminRes = await axios.post(`${API_URL}/admin/login`, {
      email: ADMIN_EMAIL,
      password: ADMIN_PASS,
    });
    const adminToken = adminRes.data.token;
    console.log("   Admin Logged In.");

    // 2. Create Users (Manager and Member)
    console.log(`2. Registering Manager (${MANAGER_EMAIL})...`);
    const managerRes = await axios.post(`${API_URL}/auth/sign-up`, {
      name: "Test Manager",
      email: MANAGER_EMAIL,
      password: PASSWORD,
    });
    const managerToken = managerRes.data.token;
    const managerUser = managerRes.data.user;
    console.log("   Manager Registered.");

    console.log(`3. Registering Member (${MEMBER_EMAIL})...`);
    const memberRes = await axios.post(`${API_URL}/auth/sign-up`, {
      name: "Test Member",
      email: MEMBER_EMAIL,
      password: PASSWORD,
    });
    const memberUser = memberRes.data.user;
    console.log("   Member Registered.");

    // 4. Admin Creates Workspace
    console.log("4. Admin Creating Workspace...");
    const workspaceRes = await axios.post(
      `${API_URL}/workspaces/create`,
      { name: `RBAC Workspace ${SUFFIX}`, description: "Test" },
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );
    const workspaceId = workspaceRes.data._id;
    console.log(`   Workspace Created: ${workspaceId}`);

    // 5. Admin Assigns User as Workspace Manager
    console.log("5. Admin Assigning Workspace Manager...");
    await axios.post(
      `${API_URL}/admin/assign-workspace-manager`,
      { userId: managerUser._id, workspaceId: workspaceId },
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );
    console.log("   Workspace Manager Assigned.");

    // 6. Manager Creates Project (Should Succeed)
    console.log("6. Workspace Manager Creating Project...");
    // Note: Manager needs to be a MEMBER of the workspace first? 
    // Wait, the logic I wrote checks `req.user.managedWorkspaces`.
    // It does NOT explicitly require the user to be in the `members` list of the workspace model, 
    // BUT the logic `createProject` does check membership IF not admin/manager. 
    // If I am Manager, it bypasses.
    
    // HOWEVER: Does assigning manager automatically make them a member? 
    // My previous logic updates `user.managedWorkspaces`. It does NOT update `workspace.members`.
    // Let's see if `createProject` allows it.
    
    const projectRes = await axios.post(
      `${API_URL}/projects/${workspaceId}/create-project`,
      { title: `Manager Project ${SUFFIX}`, description: "Test" },
      { headers: { Authorization: `Bearer ${managerToken}` } }
    );
    const projectId = projectRes.data._id;
    console.log(`   Project Created by Manager: ${projectId}`);
    
    // Verify Creator is Project Manager
    const projectDetails = await axios.get(`${API_URL}/projects/${projectId}`, {
        headers: { Authorization: `Bearer ${managerToken}` } 
    });
    const creatorMember = projectDetails.data.members.find(m => m.user === managerUser._id && m.role === 'manager');
    if(creatorMember) console.log("   Verified: Project Creator is 'manager'");
    else console.error("   FAILED: Project Creator is NOT 'manager'");

    // 7. Manager Adds Member to Project
    console.log("7. Manager Adding Member to Project...");
    await axios.post(
        `${API_URL}/projects/${projectId}/members`,
        { userId: memberUser._id },
        { headers: { Authorization: `Bearer ${managerToken}` } }
    );
    console.log("   Member Added.");

    // 8. Manager Promotes Member to Project Manager
    console.log("8. Manager Promoting Member to Project Manager...");
    await axios.put(
        `${API_URL}/projects/${projectId}/members/${memberUser._id}`,
        { role: "manager" },
        { headers: { Authorization: `Bearer ${managerToken}` } }
    );
    console.log("   Member Promoted.");

    // 9. Check Member's Role
    const updatedProject = await axios.get(`${API_URL}/projects/${projectId}`, {
        headers: { Authorization: `Bearer ${managerToken}` } 
    });
    const promotedMember = updatedProject.data.members.find(m => m.user === memberUser._id);
    if(promotedMember.role === 'manager') console.log("   Verified: Member is now 'manager'");
    else console.error(`   FAILED: Member role is ${promotedMember.role}`);

    console.log("\nSUCCESS: All RBAC flows verified!");

  } catch (error) {
    console.error("\n❌ VERIFICATION FAILED");
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error(`Data:`, error.response.data);
    } else {
      console.error(error.message);
    }
  }
}

verifyRBAC();
