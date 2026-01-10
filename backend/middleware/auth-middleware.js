import jwt from "jsonwebtoken";
import User from "../models/user.js";

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1]; //Bearer dhghjhdkjfg

    if (!token) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role === "master_admin") {
         // Admin Super User Access - Full synthetic user object
         req.user = {
             _id: decoded.adminId, // Use admin ID
             name: "Master Admin",
             email: "admin@projectmanager.com",
             role: "super_admin", // Explicit role for controllers
             isAdmin: true,
             // Provide empty arrays for properties that may be accessed
             managedWorkspaces: [],
             workspaces: [],
         };
         next();
         return;
    }

    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Auth Middleware Error:", error);
    if (error.name === "TokenExpiredError" || error.name === "JsonWebTokenError") {
        return res.status(401).json({
            message: "Unauthorized",
        });
    }
    
    res.status(500).json({
      message: "Internal server error",
    });
  }
};

export default authMiddleware;
