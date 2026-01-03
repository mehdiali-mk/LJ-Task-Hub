import mongoose, { Schema } from "mongoose";

const userSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: { type: String, required: true, select: false },
    name: { type: String, required: true, trim: true },
    profilePicture: { type: String },
    
    // Workspace Manager Attributes

    isWorkspaceManager: { type: Boolean, default: false },
    managedWorkspaces: [{ type: Schema.Types.ObjectId, ref: "Workspace" }], // Dynamic source of truth for management role

    lastLogin: { type: Date },
  },
  { timestamps: true }
);
const User = mongoose.model("User", userSchema);

export default User;
