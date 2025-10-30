import dotenv from "dotenv";
import { catchAsynch } from "../utils/catchAsynch.utils.js";
import { AppError } from "../utils/appError.js";
import User from "../models/auth.models.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

dotenv.config();

const system_secret = String(process.env.SYSTEME_SECRET);

export const adminRegister = catchAsynch(async (req, res, next) => {
  const { name, password, email, adminSecret } = req.body;

  console.log("body data received ==>", req.body);

  // Validation

  const requiredFields = ["name", "password", "email", "adminSecret"];
  for (const field of requiredFields) {
    if (!req.body[field]) {
      return next(new AppError(`${field} is required`, 400));
    }
  }

  if (adminSecret !== system_secret) {
    return next(new AppError("Invalid admin secret", 401));
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new AppError("User with this email already exists", 400));
  }

  const newAdmin = await User.create({
    firstName: name,
    password,
    email,
    roles: "admin",
  });

  const tokenKey = process.env.JWT_SECRET;
  const refreshTokenKey = process.env.REFRESH_TOKEN_SECRET;

  if (!tokenKey || !refreshTokenKey) {
    return next(
      new AppError("JWT secret or refresh token secret are missing", 500)
    );
  }

  const token = jwt.sign(
    { email: newAdmin.email, id: newAdmin._id, roles: newAdmin.roles },
    tokenKey,
    { expiresIn: "1h" }
  );

  const refreshToken = jwt.sign(
    { email: newAdmin.email, id: newAdmin._id, roles: newAdmin.roles },
    refreshTokenKey,
    { expiresIn: "7d" }
  );

  res.status(201).json({
    success: true,
    token,
    refreshToken,
    message: "New admin created successfully",
    data: {
      email: newAdmin.email,
      firstName: newAdmin.firstName,
    },
  });
});

export const adminLogin = catchAsynch(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError("Email and password are required", 400));
  }

  const user = await User.findOne({ email });

  if (!user) {
    return next(new AppError("User with this email does not exist", 404));
  }
  if (user.roles !== "admin") {
    return next(new AppError("Access denied: not an admin", 403));
  }

  const isPasswordMatch = await bcrypt.compare(password, user.password);
  if (!isPasswordMatch) {
    return next(new AppError("Invalid password", 401));
  }

  const tokenKey = process.env.JWT_SECRET;
  const refreshTokenKey = process.env.REFRESH_TOKEN_SECRET;

  const token = jwt.sign(
    { email: user.email, id: user._id, roles: user.roles },
    tokenKey,
    { expiresIn: "1h" }
  );

  const refreshToken = jwt.sign(
    { email: user.email, id: user._id, roles: user.roles },
    refreshTokenKey,
    { expiresIn: "7d" }
  );

  res.status(200).json({
    success: true,
    token,
    refreshToken,
    message: "Admin login successful",
    data: { email: user.email },
  });
});

// get OTP code for verification and engage auto submission

export const getOtpSecret = catchAsynch(async (req, res, next) => {
  const { adminSecret } = req.body;

  const isCodeMatch = adminSecret == process.env.SYSTEME_SECRET;
  if (!isCodeMatch) {
    return res.status(401).json({
      success: false,
      message: "OTP secret invalide",
      isValiCode: false,
    });
  }

  if (isCodeMatch) {
    res.status(200).json({
      success: true,
      message: "OTP secret valid",
      isValiCode: true,
    });
  }
});
