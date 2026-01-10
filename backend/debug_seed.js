console.log("Starting debug...");
try {
  console.log("Importing mongoose...");
  await import("mongoose");
  console.log("Importing dotenv...");
  await import("dotenv");
  console.log("Importing bcrypt...");
  await import("bcrypt");
  console.log("Importing faker...");
  await import("@faker-js/faker");
  
  console.log("Importing local models...");
  await import("./models/user.js");
  console.log("User model OK");
  await import("./models/workspace.js");
  console.log("Workspace model OK");
} catch (e) {
  console.error("Import failed:", e);
}
console.log("Debug complete.");
