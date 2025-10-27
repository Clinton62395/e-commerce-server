import { AppError } from "../utils/appError.js";
import { catchAsynch } from "../utils/catchAsynch.utils.js";
import dotenv from "dotenv";
import transporter from "../configs/nodemailer.js";
import crypto from "crypto";
import User from "../models/auth.models.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();
export const resetPassword = catchAsynch(async (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return next(new AppError(" email is required", 400));
  }
  const user = await User.findOne({ email });
  if (!user) {
    return next(new AppError("User with this email does not exist", 404));
  }

  const resetToken = crypto.randomBytes(32).toString("hex");

  user.passwordResetToken = resetToken;
  user.passwordResetExpires = Date.now() + 20 * 60 * 1000; // 20 minutes
  await user.save({ validateBeforeSave: false });

  const redirectedLink = process.env.Frontend_URL || process.env.BASE_URL;

  const resetURL = `${redirectedLink}/reset-password?token=${resetToken}&email=${email}`;

  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  console.log("__dirname", __dirname);

  const templatePath = path.join(__dirname, "../templates/resetPassword.html");
  console.log("templatePath", templatePath);

  const template = fs.readFileSync(templatePath, "utf-8");
  const html = template
    .replace("{{firstName}}", user.firstName)
    .replace("{{lastName}}", user.lastName)
    .replace("{{resetURL}}", resetURL);

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Password Reset",
    html,
  };
  await transporter.sendMail(mailOptions);

  res.status(200).json({
    status: "success",
    message: "Password reset email sent successfully",
  });
});

export const newPassword = catchAsynch(async (req, res, next) => {
  const { token, newPassword } = req.body;
  console.log("==> token and newPassword", req.body);
  console.log("==> token and newPassword", !!req.body);
  console.log("==> token and newPassword", !!req.body.newPassword);
  console.log("==> token and newPassword", !!req.body.token);
  if (!token || !newPassword) {
    return next(new AppError("Token and new password are required", 400));
  }
  const user = await User.findOne({
    passwordResetToken: token,
    passwordResetExpires: { $gt: Date.now() },
  });
  if (!user) {
    return next(new AppError("Token is invalid or has expired", 400));
  }
  user.password = newPassword;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  res.status(200).json({
    status: "success",
    message: "Password updated successfully",
  });
});
