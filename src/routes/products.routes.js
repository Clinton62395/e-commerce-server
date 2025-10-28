import express from "express";
import {
  createProducts,
  deleAllProducts,
  deleteProduct,
  getAllProducts,
  getSingleProduct,
  updateProducts,
} from "../controllers/products.controller.js";
import { AdminsRoute, protectedRoute } from "../middlewares/auth.middleware.js";
import { upload, uploadSingleImage } from "../services/uploadFile.services.js";

const router = express.Router();
router.post("/create", protectedRoute, AdminsRoute, createProducts);
router.delete("/delete/:id", protectedRoute, AdminsRoute, deleteProduct);
router.put("/update/:id", protectedRoute, AdminsRoute, updateProducts);
router.delete("/deleteAll/", protectedRoute, AdminsRoute, deleAllProducts);

router.get("/getAll", getAllProducts);

router.get("/getOne/:id", getSingleProduct);

router.post("/upload-image", upload.single("image"), uploadSingleImage);

export default router;
