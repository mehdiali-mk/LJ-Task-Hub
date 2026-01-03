import express from "express";
import { loginAdmin, getAllUsers, assignWorkspaceManager } from "../controllers/admin.js";
import adminAuthMiddleware from "../middleware/admin-auth-middleware.js";

const router = express.Router();

// Public Admin Login
router.post("/login", loginAdmin);

// Protected Admin Routes (We need middleware later)
router.get("/users", adminAuthMiddleware, getAllUsers);
router.post("/assign-manager", adminAuthMiddleware, assignWorkspaceManager);

export default router;
