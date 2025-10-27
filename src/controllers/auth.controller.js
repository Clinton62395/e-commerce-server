import test from "node:test";
import User from "../models/auth.models.js";
import { catchAsynch } from "../utils/catchAsynch.utils.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import { AppError } from "../utils/appError.js";

dotenv.config();

export const register = catchAsynch(async (req, res, next) => {
  const { firstName, lastName, phoneNumber, email, password, confirmPassword } =
    req.body;

  const requiredFields = [
    "firstName",
    "lastName",
    "phoneNumber",
    "email",
    "password",
    "confirmPassword",
  ];
  for (const field of requiredFields) {
    if (!req.body[field]) {
      return next(new AppError(`Field '${field}' is required`, 400));
    }
  }

  if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)) {
    return next(
      new AppError(
        "email must contain at least one uppercase letter, one lowercase letter, one number, one special character, and be at least 8 characters and include (@) long",
        400
      )
    );
  }

  if (password !== confirmPassword) {
    return next(new AppError("passwords dot not match", 400));
  }

  const user = await User.findOne({ email });

  if (user) {
    return next(new AppError("User already exists", 409));
  }

  const newUser = await User.create({
    firstName,
    lastName,
    phoneNumber,
    email,
    password,
    isgoogleUser: false,
  });

  //   crest jwt token and refresh token

  const jwtToken = process.env.JWT_SECRET;
  const refreshKey = process.env.REFRESH_TOKEN_SECRET;
  if (!jwtToken || !refreshKey) {
    return next(
      new AppError(
        "JWT token key and refresh token key are missing in the environment",
        500
      )
    );
  }

  const token = jwt.sign(
    { email: newUser.email, id: newUser._id, roles: newUser.roles },
    jwtToken,
    {
      expiresIn: "1h",
    }
  );

  const refreshToken = jwt.sign(
    { email: newUser.email, id: newUser._id, roles: newUser.roles },
    refreshKey,
    {
      expiresIn: "5d",
    }
  );

  res.status(201).json({
    success: true,
    message: "user create successfully",
    token: token,
    refreshToken: refreshToken,
    data: {
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      email: newUser.email,
      phoneNumber: newUser.phoneNumber,
    },
  });
});

export const login = catchAsynch(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError("email and password are required", 400));
  }

  const user = await User.findOne({ email });
  if (!user) {
    return next(new AppError("user not found", 404));
  }

  const isPasswordMatch = await bcrypt.compare(password, user.password);

  if (!isPasswordMatch) {
    return new AppError("password invalid");
  }

  const jwtToken = process.env.JWT_SECRET;
  const refreshKey = process.env.REFRESH_TOKEN_SECRET;
  if (!jwtToken || !refreshKey) {
    return next(
      new AppError(
        "JWT token key and refresh token key are missing in the environment",
        500
      )
    );
  }

  const token = jwt.sign(
    { email: user.email, id: user._id, roles: user.roles },
    jwtToken,
    {
      expiresIn: "1h",
    }
  );

  const refreshToken = jwt.sign(
    { email: user.email, id: user._id, roles: user.roles },
    refreshKey,
    {
      expiresIn: "5d",
    }
  );

  res.status(200).json({
    success: true,
    message: "user login successfully",
    data: user.email,
    token: token,
    refreshToken: refreshToken,
  });
});
