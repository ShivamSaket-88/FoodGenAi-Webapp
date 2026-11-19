const path = require("path");
const dotenv = require("dotenv");

// Load environment variables before importing app/controllers.
dotenv.config({ path: path.join(__dirname, "config", "config.env") });
console.log("MongoDB URI loaded:", Boolean(process.env.DB_URI));
console.log("MongoDB username:", process.env.DB_URI?.match(
  /mongodb(?:\+srv)?:\/\/([^:]+):/
)?.[1] || "Not found");
console.log("MongoDB database name:", process.env.DB_URI?.match(
  /mongodb(?:\+srv)?:\/\/[^:]+:\/([^?]+)/
)?.[1] || "Not found");

const app = require("./app");
const connectDatabase = require("./config/database");
const cloudinary = require("cloudinary").v2;

process.on("uncaughtException", (err) => {
  console.error("Uncaught exception:", err);
  process.exit(1);
});

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const PORT = process.env.PORT || 8080;

async function startServer() {
  try {
    await connectDatabase();

    const server = app.listen(PORT, "0.0.0.0", () => {
  console.log(
    `Server started on PORT: ${PORT} in ${process.env.NODE_ENV || "development"} mode.`
  );
});

    process.on("unhandledRejection", (err) => {
      console.error("Unhandled promise rejection:", err);
      server.close(() => process.exit(1));
    });
  } catch (err) {
    console.error("Unable to start server:", err.message);
    process.exit(1);
  }
}

startServer();
