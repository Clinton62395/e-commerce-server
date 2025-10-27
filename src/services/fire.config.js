import dotenv from "dotenv";
import admin from "firebase-admin";
import jwt from "jsonwebtoken";
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
  const { token: googleToken } = req.body;
  console.log("==>token from frontend", googleToken);
  console.log("==>token from frontend", !!req.body.googleToken);

  if (!googleToken) {
    return next(new AppError("token missing", 400));
  }

  const decodedToken = await admin.auth().verifyIdToken(googleToken);
  const { uid, name, email, picture } = decodedToken;
  console.log("==>decodedToken from firebase", decodedToken);

  let user = await User.findOne({ email });

  if (!user) {
    user = await User.create({
      firstName: name,
      email,
      image: picture,
      isGoogleUser: true,
    });
  }

  const jwtTokenKey = process.env.JWT_SECRET;
  if (!jwtTokenKey) {
    return next(
      new AppError("JWT token key is missing in the environment", 500)
    );
  }

  const token = await jwt.sign(
    { email: user.email, id: user._id, roles: user.roles },
    jwtTokenKey,
    { expiresIn: "1d" }
  );

  console.log("user from firabase google==>", user);

  res.status(200).json({
    success: true,
    message: "user created successfully",
    data: {
      firstName: user.firstName,
      image: user.picture,
      email: user.email,
    },
    token,
  });
});
