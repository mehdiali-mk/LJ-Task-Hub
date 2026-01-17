import mongoose, { Schema } from "mongoose";

const workspaceModel = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: { type: String, trim: true },
    color: { type: String, default: "#FF5733" },
    // Note: Workspace Manager is determined by Users with this workspace in their managedWorkspaces array
    members: [
      {
        user: { type: Schema.Types.ObjectId, ref: "User" },
        role: {
          type: String,
          enum: ["member", "admin", "viewer"],
          default: "member",
        },
        joinedAt: { type: Date, default: Date.now },
      },
    ],
    projects: [{ type: Schema.Types.ObjectId, ref: "Project" }],
  },
  { timestamps: true }
);

const Workspace = mongoose.model("Workspace", workspaceModel);

export default Workspace;
