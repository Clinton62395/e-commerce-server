import { catchAsynch } from "./catchAsynch.utils.js";
import { AppError } from "./appError.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export const handleRefreshToken = catchAsynch(async (req, res, next) => {
  const authHeader = req.headers.authorization;

  console.log("headers content token==>", authHeader);

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(new AppError("Refresh token missing", 401));
  }

  const refreshToken = authHeader.split(" ")[1];

  try {
    // ✅ CORRECTION 1: Utiliser la bonne clé secrète
    // Vous utilisez JWT_REFRESH_SECRET pour générer, donc utilisez-la pour vérifier
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    console.log("decode token content ==>", decoded);

    // ✅ CORRECTION 2: Générer le nouveau access token avec la bonne clé
    const accessToken = jwt.sign({ id: decoded.id }, process.env.JWT_SECRET, {
      expiresIn: "15m",
    });

    // ✅ CORRECTION 3: Générer le nouveau refresh token
    const newRefreshToken = jwt.sign(
      { id: decoded.id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: "7d" }
    );

    // ✅ CORRECTION 4: Renvoyer les bons noms de champs
    return res.status(200).json({
      success: true,
      token: accessToken,
      refreshToken: newRefreshToken,
    });
  } catch (err) {
    console.log("JWT Error:", err.message);
    return next(new AppError("Invalid refresh token", 401));
  }
});
