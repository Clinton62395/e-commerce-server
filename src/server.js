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

export { io };

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(limiter); // Limiteur de requêtes

app.get("/", (req, res) => {
  res.send("🌐 Bienvenue sur mon site e-commerce !");
});

// 🔌 Gestion de la connexion socket.io
io.on("connection", (socket) => {
  console.log("🟢 Nouvelle connexion socket :", socket.id);

  // Quand un admin rejoint le dashboard
  socket.on("join-dashboard", (adminData) => {
    console.log(`👑 Admin connecté : ${adminData.userName}`);
    socket.join("dashboard-admins");
    // Envoie un message de confirmation à l’admin connecté
    socket.emit("dashboard-connected", {
      message: "Dashboard connecté en temps réel ✅",
      timeStamp: new Date(),
    });
  });

  // Déconnexion d’un client
  socket.on("disconnect", () => {
    console.log("🔴 Déconnexion socket :", socket.id);
  });
});

// 🧭 Routes principales
app.use("/auth", authRoute);
app.use("/admin", adminRoutes);
app.use("/products", authProducts);
app.use("/payment", payementRoute);

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
