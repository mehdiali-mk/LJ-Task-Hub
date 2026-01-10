import User from "../models/user.js";
import Admin from "../models/admin.js";
import bcrypt from "bcrypt";

const getUserProfile = async (req, res) => {
  try {
    // If admin user, return admin profile from Admin model
    if (req.user.isAdmin) {
      const admin = await Admin.findById(req.user._id).select("-password");
      if (!admin) {
        // Return synthetic admin info if not found in DB
        return res.status(200).json({
          _id: req.user._id,
          name: req.user.name || "Master Admin",
          email: req.user.email || "admin@projectmanager.com",
          isAdmin: true,
        });
      }
      return res.status(200).json({
        ...admin.toObject(),
        isAdmin: true,
      });
    }

    const user = await User.findById(req.user._id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    delete user.password;

    res.status(200).json(user);
  } catch (error) {
    console.error("Error fetching user profile:", error);

    res.status(500).json({ message: "Server error" });
  }
};

const updateUserProfile = async (req, res) => {
  try {
    const { name, profilePicture, email, phoneNumber, description, designation, expertise, experience } = req.body;

    // If admin user, update admin profile
    if (req.user.isAdmin) {
      const admin = await Admin.findById(req.user._id);
      if (admin) {
        if (name) admin.name = name;
        if (profilePicture) admin.profilePicture = profilePicture;
        await admin.save();
        return res.status(200).json({
          ...admin.toObject(),
          isAdmin: true,
        });
      }
      // If admin not found in DB, just return success with synthetic data
      return res.status(200).json({
        _id: req.user._id,
        name: name || req.user.name,
        email: req.user.email,
        profilePicture: profilePicture || "",
        isAdmin: true,
      });
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.name = name || user.name;
    user.profilePicture = profilePicture || user.profilePicture;
    user.description = description !== undefined ? description : user.description;
    user.designation = designation || user.designation;
    user.expertise = expertise || user.expertise;
    user.experience = experience || user.experience;

    // Handle Email Update
    if (email && email !== user.email) {
        const existingEmail = await User.findOne({ email });
        if (existingEmail) {
            return res.status(400).json({ message: "Email already in use" });
        }
        user.email = email;
        user.isEmailVerified = false; // Reset verification
    }

    // Handle Phone Update
    if (phoneNumber && phoneNumber !== user.phoneNumber) {
        const existingPhone = await User.findOne({ phoneNumber });
        if (existingPhone) {
            return res.status(400).json({ message: "Phone number already in use" });
        }
        user.phoneNumber = phoneNumber;
        user.isPhoneVerified = false; // Reset verification
    }

    await user.save();

    res.status(200).json(user);
  } catch (error) {
    console.error("Error updating user profile:", error);

    res.status(500).json({ message: "Server error" });
  }
};

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    const user = await User.findById(req.user._id).select("+password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (newPassword !== confirmPassword) {
      return res
        .status(400)
        .json({ message: "New password and confirm password do not match" });
    }

    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password
    );

    if (!isPasswordValid) {
      return res.status(403).json({ message: "Invalid old password" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Error changing password:", error);

    res.status(500).json({ message: "Server error" });
  }
};

const deleteUser = async (req, res) => {
    try {
        const { userId } = req.params;

        // Auth: System Admin Only
        if (!req.user.isAdmin) {
            return res.status(403).json({ message: "Unauthorized: Admin access required" });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Import models for cascading delete
        const Workspace = (await import("../models/workspace.js")).default;
        const Project = (await import("../models/project.js")).default;
        const Task = (await import("../models/task.js")).default;
        const Comment = (await import("../models/comment.js")).default;
        const ActivityLog = (await import("../models/activity.js")).default;

        // 1. Remove user from all workspace members arrays
        await Workspace.updateMany(
            { "members.user": userId },
            { $pull: { members: { user: userId } } }
        );

        // 2. Remove user from all project members arrays
        await Project.updateMany(
            { "members.user": userId },
            { $pull: { members: { user: userId } } }
        );

        // 3. Unassign user from all tasks
        await Task.updateMany(
            { assignees: userId },
            { $pull: { assignees: userId } }
        );

        // 4. Remove user from task watchers
        await Task.updateMany(
            { watchers: userId },
            { $pull: { watchers: userId } }
        );

        // 5. Delete user's comments
        await Comment.deleteMany({ author: userId });

        // 6. Delete user's activity logs
        await ActivityLog.deleteMany({ user: userId });

        // 7. Finally delete the user
        await User.findByIdAndDelete(userId);
        
        res.status(200).json({ message: "User and all references deleted successfully" });
    } catch (error) {
        console.error("Error deleting user:", error);
        res.status(500).json({ message: "Server error" });
    }
};

export { getUserProfile, updateUserProfile, changePassword, deleteUser };
