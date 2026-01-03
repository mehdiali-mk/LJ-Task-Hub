import jwt from "jsonwebtoken";
import Admin from "../models/admin.js";

const adminAuthMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if it's an admin token
    if (decoded.role !== "master_admin") {
         return res.status(403).json({ message: "Access denied. Admin only." });
    }

    const admin = await Admin.findById(decoded.adminId);
    if (!admin) {
      return res.status(401).json({ message: "Admin not found" });
    }

    req.admin = admin;
    next();
  } catch (error) {
    console.error("Admin Auth Error:", error);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

export default adminAuthMiddleware;
