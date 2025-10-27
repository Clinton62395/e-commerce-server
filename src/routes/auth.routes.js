import express from "express";
import { login, register } from "../controllers/auth.controller.js";
import { googleRegister } from "../services/fire.config.js";
import {
  newPassword,
  resetPassword,
} from "../controllers/passwordUpdate.controller.js";

const router = express();

router.post("/register", register);
router.post("/login", login);

// google login route
router.post("/google", googleRegister);

// reset password route
router.post("/resetPassword", resetPassword);

// new password route
router.post("/newPassword", newPassword);

export default router;
