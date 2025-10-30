import mongoose from "mongoose";

export const dbConnection = () => {
  const mongoUri = process.env.MONGO_URI;
  
  if (!mongoUri) {
    console.error("MONGO_URI is not defined in environment variables");
    process.exit(1);
  }

  // Remove dbName option since it's included in the connection string
  mongoose
    .connect(mongoUri)
    .then(() => {
      console.log("Connected to database successfully.");
    })
    .catch((err) => {
      console.error("Error connecting to database:", err.message);
      console.error("Possible causes:");
      console.error("1. Incorrect username or password in MONGO_URI");
      console.error("2. Database user doesn't have access to the cluster");
      console.error("3. Network issues or firewall restrictions");
      console.error("4. Incorrect cluster URL or database name");
      console.error("Please verify your MongoDB Atlas configuration");
      
      // Don't exit in development to allow for retry
      if (process.env.NODE_ENV === "production") {
        process.exit(1);
      }
    });
};