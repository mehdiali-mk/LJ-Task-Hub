import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import Admin from "./models/admin.js";

dotenv.config();

const seedMasterAdmin = async () => {
    const email = "admin@projectmanager.com"; // Static Email
    const password = "adminpassword123"; // Static Password (should be changed in production)
    const name = "Master Admin";

    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("MongoDB connected");

        // Check if admin exists
        const existingAdmin = await Admin.findOne({ email });
        if (existingAdmin) {
            console.log("Master Admin already exists.");
            process.exit(0);
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newAdmin = new Admin({
            email,
            password: hashedPassword,
            name,
        });

        await newAdmin.save();
        console.log("Master Admin created successfully.");
        console.log(`Email: ${email}`);
        console.log(`Password: ${password}`);
        
        process.exit(0);
    } catch (error) {
        console.error("Error seeding admin:", error);
        process.exit(1);
    }
};

seedMasterAdmin();
