import cloudinary from "cloudinary";
import fs from "fs";
import multer from "multer"; 
import dotenv from "dotenv";
import { catchAsynch } from "../utils/catchAsynch.utils.js";
import { AppError } from "../utils/appError.js";

dotenv.config();

// Cloudinary configuration
cloudinary.v2.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

// Multer configuration for temporary file storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Temporary storage folder
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

// Configuration multer avec validation
export const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max
  },
  fileFilter: (req, file, cb) => {
    // Accepter seulement les images
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new AppError("Seules les images sont autorisées", 400), false);
    }
  },
});

// Ensure the 'uploads' directory exists
if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads");
}

// Upload d'une seule image
export const uploadSingleImage = catchAsynch(async (req, res, next) => {
  if (!req.file) {
    return next(new AppError("Aucun fichier uploadé", 400));
  }

  try {
    const result = await cloudinary.v2.uploader.upload(req.file.path, {
      folder: "products",
      transformation: [
        { width: 1000, height: 1000, crop: "limit" },
        { quality: "auto" },
      ],
    });

    // Supprimer le fichier temporaire
    fs.unlinkSync(req.file.path);

    res.status(200).json({
      success: true,
      message: "Image uploadée avec succès",
      url: result.secure_url,
      publicId: result.public_id,
    });
  } catch (error) {
    // Nettoyer le fichier en cas d'erreur
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    return next(new AppError("Erreur lors de l'upload de l'image", 500));
  }
});

