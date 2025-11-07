import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import errorHandler from "./middlewares/errorHandle.middlewares.js";
import authRoute from "./routes/auth.routes.js";
import authProducts from "./routes/products.routes.js";
import payementRoute from "./routes/payement.routes.js";
import connectDB from "./configs/DB.js";
import limiter from "./middlewares/limiter.middleware.js";
import adminRoutes from "./routes/admin.routes.js";
import { Server } from "socket.io";
import http from "http";

dotenv.config();

const app = express();
const server = http.createServer(app);

// ⚙️ Configuration du socket.io avec CORS
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "DELETE", "PUT", "PATCH"],
  },
});

// export io

app.set("io", io);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(limiter); // Limiteur de requêtes

app.get("/", (req, res) => {
  res.send("🌐 Bienvenue sur mon site e-commerce !");
});

// 🔌 Gestion de la connexion socket.io
io.on("connection", (socket) => {
  console.log("✅ Admin connecté:", socket.id);

  // Optionnel: Envoyer une confirmation au client
  socket.emit("connection-confirmed", {
    message: "Dashboard connecté en temps réel ✅",
    socketId: socket.id,
    timestamp: new Date(),
  });

  socket.on("disconnect", () => {
    console.log("❌ Admin déconnecté:", socket.id);
  });
});

// 🧭 Routes principales
app.use("/auth", authRoute);
app.use("/admin", adminRoutes);
app.use("/products", authProducts);
app.use("/payment", payementRoute);

app.get("/test-update", (req, res) => {
  const io = req.app.get("io");
  io.emit("order:updated", {
    reference: "ORDER-123",
    status: "success",
    amount: 5000,
    firstName: "Test",
    lastName: "User",
  });
  res.send("Événement order:updated envoyé");
});

// 🛑 Route non trouvée
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route non trouvée : ${req.originalUrl}`,
  });
});

// ⚠️ Middleware global pour les erreurs
app.use(errorHandler);

// 🚀 Démarrage du serveur
const startServer = async () => {
  try {
    await connectDB();
    const PORT = process.env.PORT || 3000;
    server.listen(PORT, () => {
      console.log(`🌹 Serveur en ligne sur http://localhost:${PORT} ✔`);
    });
  } catch (err) {
    console.error("Erreur au démarrage du serveur :", err);
    process.exit(1);
  }
};

startServer();
