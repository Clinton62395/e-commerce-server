import express from "express";
import {  login, register } from "../controllers/auth.controller.js";
import { googleRegister } from "../services/fire.config.js";

const router = express();

router.post("/register", register);
router.post("/login", login);

// google login route
router.post("/google", googleRegister);


export default router;
