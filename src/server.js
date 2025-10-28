import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import errorHandler from "./middlewares/errorHandle.middlewares.js";
import authRoute from "./routes/auth.routes.js";
import authProducts from "./routes/products.routes.js";
import payementRoute from "./routes/payement.routes.js";
import connectDB from "./configs/DB.js";
import limiter from "./middlewares/limiter.middleware.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// rate limiting middleware
app.use(limiter);

app.get("/", (req, res) => {
  res.send("welcom to my e-commerce website");
});
// user router
app.use("/auth", authRoute);

// porduits route
app.use("/products", authProducts);

// payement route
app.use("/payment", payementRoute);

// middleware for routes not founds
app.use((req, res) => {
  res
    .status(404)
    .json({ success: false, message: `route not found ${req.originalUrl}` });
});

//globale middlewar to intercept all error into express
app.use(errorHandler);

const startServer = async () => {
  try {
    await connectDB();
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(` 🌹server is running on port ${PORT} ✔`);
      console.log(`http://localhost:${PORT} `);
    });
  } catch (err) {
    console.log("error starting server", err);
    process.exit(1);
  }
};

startServer();
