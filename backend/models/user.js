import mongoose, { Schema } from "mongoose";

const userSchema = new Schema(
  {
    email: {
      type: String,
      unique: true,
      trim: true,
      lowercase: true,
      sparse: true, // Allows multiple null/undefined values
    },
    phoneNumber: { 
      type: String, 
      trim: true,
      unique: true, 
      sparse: true,
    },
    password: { type: String, required: true, select: false },
    name: { type: String, required: true, trim: true },
    profilePicture: { type: String },
    isEmailVerified: { type: Boolean, default: false },
    isPhoneVerified: { type: Boolean, default: false },

    // Professional Portfolio
    description: { type: String, default: "" }, // Markdown supported
    designation: {
      type: String,
      enum: ["Developer", "Designer", "Manager", "Product Owner", "Other"],
      default: "Other",
    },
    expertise: [{ type: String }], // Array of tags
    experience: [
      {
        title: { type: String, required: true },
        company: { type: String, required: true },
        startDate: { type: Date, required: true },
        endDate: { type: Date }, // Null means "Present"
        description: { type: String },
      },
    ],
    
    // Workspace Manager Attributes

    isWorkspaceManager: { type: Boolean, default: false },
    managedWorkspaces: [{ type: Schema.Types.ObjectId, ref: "Workspace" }], // Dynamic source of truth for management role

    lastLogin: { type: Date },
  },
  { timestamps: true }
);
const User = mongoose.model("User", userSchema);

export default User;
