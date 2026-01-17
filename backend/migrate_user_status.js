/**
 * Migration script to add isOnline and lastActiveAt fields to existing users
 * Run this script once to update your existing database with the new fields
 * 
 * Usage: node migrate_user_status.js
 */

import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./models/user.js";

dotenv.config();

async function migrateUsers() {
  console.log(">>> STARTING USER STATUS MIGRATION...");
  const startTime = Date.now();

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB Atlas.");

    // Get all users that don't have the new fields
    const users = await User.find({
      $or: [
        { isOnline: { $exists: false } },
        { lastActiveAt: { $exists: false } }
      ]
    });

    console.log(`Found ${users.length} users to migrate.`);

    if (users.length === 0) {
      console.log("No users need migration. All users already have the new fields.");
      process.exit(0);
    }

    let updatedCount = 0;

    for (const user of users) {
      // Set all users as offline initially (they haven't logged in since the update)
      // If they have a lastLogin date, use that as lastActiveAt
      // Otherwise, use the user's createdAt timestamp
      
      const lastActiveAt = user.lastLogin || user.createdAt || new Date();
      
      await User.findByIdAndUpdate(user._id, {
        isOnline: false,
        lastActiveAt: lastActiveAt
      });

      updatedCount++;

      if (updatedCount % 50 === 0) {
        console.log(`Migrated ${updatedCount}/${users.length} users...`);
      }
    }

    const duration = (Date.now() - startTime) / 1000;
    console.log(`\n>>> MIGRATION COMPLETE in ${duration}s.`);
    console.log(`Updated ${updatedCount} users with isOnline and lastActiveAt fields.`);
    console.log("All users have been set to 'Offline' status.");
    console.log("Their status will update automatically when they log in next.");

    process.exit(0);

  } catch (error) {
    console.error(">>> MIGRATION FAILED:");
    console.error(error);
    process.exit(1);
  }
}

migrateUsers();
