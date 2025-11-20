import cloudinary from "cloudinary";
import dotenv from "dotenv";
import { catchAsynch } from "../utils/catchAsynch.utils.js";

dotenv.config();

cloudinary.v2.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

export const fireBaseSignature = catchAsynch(async (req, res, next) => {
  const timestamp = Math.floor(Date.now() / 1000);

  const signature = cloudinary.v2.utils.api_sign_request(
    { timestamp },
    process.env.CLOUD_API_SECRET
  );

  res.status(200).send({
    success: true,
    message: "signature sent",
    signature,
    timestamp,
    cloud_key: process.env.CLOUD_API_KEY,
    cloud_name: process.env.CLOUD_NAME,
  });
});
