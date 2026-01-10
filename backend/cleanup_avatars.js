import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./models/user.js";

dotenv.config();

const migrateEmailVerification = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to MongoDB for Migration...");

        // Set isEmailVerified: true for ALL users (since we are disabling email verification requirement)
        const result = await User.updateMany(
            {}, 
            { $set: { isEmailVerified: true } }
        );

        console.log(`Updated ${result.modifiedCount} users to be email verified.`);
        
        process.exit(0);
    } catch (error) {
        console.error("Migration failed:", error);
        process.exit(1);
    }
};

migrateEmailVerification();
