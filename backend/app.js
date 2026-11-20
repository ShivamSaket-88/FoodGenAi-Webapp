
const express = require("express");
const app = express();

const path = require("path");
const cookieParser = require("cookie-parser");
const fileUpload = require("express-fileupload");
const cors = require("cors");

const errorMiddleware = require("./middlewares/errors");
const ErrorHandler = require("./utils/errorHandler");

// Routes
const foodRouter = require("./routes/foodItem");
const restaurant = require("./routes/restaurant");
const menuRouter = require("./routes/menu");
const order = require("./routes/order");
const auth = require("./routes/auth");
const payment = require("./routes/payment");
const cart = require("./routes/cart");
const aiRouter = require("./routes/ai.routes");

// ==========================================
// REQUEST LOGGER (TEMPORARY DEBUGGING)
// ==========================================

app.use((req, res, next) => {
  console.log("REQUEST RECEIVED:", req.method, req.originalUrl);

  res.on("finish", () => {
    console.log(
      "RESPONSE SENT:",
      req.method,
      req.originalUrl,
      res.statusCode
    );
  });

  next();
});

// ==========================================
// CORS CONFIGURATION
// ==========================================

const allowedOrigins = (
  process.env.FRONTEND_URL || "http://localhost:5173"
)
  .split(",")
  .map((origin) => origin.trim().replace(/\/$/, ""))
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (
        !origin ||
        allowedOrigins.includes(origin.replace(/\/$/, ""))
      ) {
        return callback(null, true);
      }

      console.log("CORS BLOCKED ORIGIN:", origin);

      return callback(
        new Error("This origin is not allowed by CORS.")
      );
    },
    credentials: true,
  })
);

// ==========================================
// GLOBAL MIDDLEWARES
// ==========================================

app.use(cookieParser());
app.use(fileUpload());

app.use(express.json({ limit: "30kb" }));
app.use(express.urlencoded({ extended: true, limit: "30kb" }));

// ==========================================
// HEALTH CHECK
// ==========================================

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "FoodGenAI Backend is running",
  });
});

// ==========================================
// API ROUTES
// ==========================================

app.use("/api/v1/eats", foodRouter);
app.use("/api/v1/eats/menus", menuRouter);
app.use("/api/v1/eats/stores", restaurant);
app.use("/api/v1/eats/orders", order);
app.use("/api/v1/users", auth);
app.use("/api/v1", payment);
app.use("/api/v1/eats/cart", cart);
app.use("/api/v1/ai", aiRouter);

// ==========================================
// VIEW ENGINE
// ==========================================

app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));

// ==========================================
// 404 HANDLER
// ==========================================

app.use((req, res, next) => {
  next(
    new ErrorHandler(
      `Route ${req.originalUrl} not found`,
      404
    )
  );
});

// ==========================================
// GLOBAL ERROR HANDLER
// ==========================================

app.use(errorMiddleware);

module.exports = app;
