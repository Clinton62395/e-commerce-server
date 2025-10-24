import jwt from "jsonwebtoken";
import { AppError } from "../utils/appError.js";
import { catchAsynch } from "../utils/catchAsynch.utils.js";

export const protectedRoute = catchAsynch(async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer")) {
    return next(new AppError("Token is missing or invalid", 401));
  }

  const token = authHeader.split(" ")[1];

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    return next(new AppError("Invalid or expired token", 401));
  }

  req.user = decoded;

  next();
});

export const AdminsRoute = catchAsynch(async (req, res, next) => {
  // 1️⃣ Vérifier si req.user existe
  if (!req.user) {
    return next(new AppError("User not authenticated", 401));
  }

  const { roles } = req.user;
  if (!roles) {
    return next(new AppError("Credentials invalid", 401));
  }

  const isAdmin = Array.isArray(roles)
    ? roles.includes("admin")
    : roles === "admin";

  if (!isAdmin) {
    return next(
      new AppError("You don't have permission to access this route", 403)
    );
  }

  next();
});
