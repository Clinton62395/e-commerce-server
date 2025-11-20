import express from "express";
import {
  adminLogin,
  adminRegister,
  getOtpSecret,
} from "../controllers/adminRegister.controller.js";

const router = express.Router();

router.post("/register", adminRegister);
router.post("/login", adminLogin);
router.post("/otp-secret", getOtpSecret);




export default router;
