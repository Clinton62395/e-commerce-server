import express from "express";
import {
  initialisePayment,
  paystackWebhook,
  verifyPayment,
} from "../controllers/payement.controller.js";

const router = express.Router();

router.post("/initialize", initialisePayment);

router.post("/webhook", paystackWebhook);

router.get("/verify/:reference", verifyPayment);

export default router;
