import Admin from "../models/admin.js";
import User from "../models/user.js";
import Workspace from "../models/workspace.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// Admin Login
export const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find admin
    const admin = await Admin.findOne({ email }).select("+password");
    if (!admin) {
      return res.status(401).json({ message: "Invalid admin credentials" });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid admin credentials" });
    }

    // Generate Token (Distinct from User token)
    const token = jwt.sign(
      { adminId: admin._id, role: "master_admin" },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(200).json({
      token,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
      },
    });
  } catch (error) {
    console.error("Admin Login Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get All Users
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Error fetching users" });
  }
};

// Assign Workspace Manager Role
export const assignWorkspaceManager = async (req, res) => {
  try {
    const { userId, workspaceId } = req.body;
    
    const user = await User.findById(userId);
    const workspace = await Workspace.findById(workspaceId);

    if (!user) return res.status(404).json({ message: "User not found" });
    if (!workspace) return res.status(404).json({ message: "Workspace not found" });

    // Update User attributes logic
    // Update User attributes logic
    const isAlreadyManager = user.managedWorkspaces.includes(workspaceId);

    if (isAlreadyManager) {
        // Remove role
        user.managedWorkspaces = user.managedWorkspaces.filter(id => id.toString() !== workspaceId);
        
        // Update isWorkspaceManager flag
        if (user.managedWorkspaces.length === 0) {
            user.isWorkspaceManager = false;
        }

        await user.save();
        return res.status(200).json({ message: "User removed as Workspace Manager", user });
    } else {
        // Add role
        user.managedWorkspaces.push(workspaceId);
        
        // Update isWorkspaceManager flag
        user.isWorkspaceManager = true;

        await user.save();
        return res.status(200).json({ message: "User promoted to Workspace Manager", user });
    }
  } catch (error) {
    console.error("Assignment Error:", error);
    res.status(500).json({ message: "Error assigning role" });
  }
};
