import dotenv from "dotenv";
import admin from "firebase-admin";
import { catchAsynch } from "../utils/catchAsynch.utils.js";
import { AppError } from "../utils/appError.js";
import User from "../models/auth.models.js";

dotenv.config();


admin.initializeApp({
  credential: admin.credential.cert({
    type: process.env.TYPE,
    projectId: process.env.PROJECT_ID,
    privateKey: process.env.PRIVATE_KEY?.replace(/\\n/g, "\n"),
    privateKeyId: process.env.PRIVATE_KEY_ID,
    clientId: process.env.CLIENT_ID,
    clientEmail: process.env.CLIENT_EMAIL,
  }),
});

export const googleRegister = catchAsynch(async (req, res, next) => {
  const { token } = req.body;

  if (!token) {
    return next(new AppError("token missing", 400));
  }

  const decodedToken = await admin.auth().verifyIdToken(token);
  const { uid, name, email, picture } = decodedToken;

  let user = await User.findOne({ email });

  if (user) {
    return next(new AppError("user already exists", 400));
  }

  user = await User.create({
    name,
    email,
    image: picture,
    googleId: uid,
  });
  console.log("user from firabase google==>", user);

  res
    .status(200)
    .json({ success: true, message: "user created successfully", user });
});
