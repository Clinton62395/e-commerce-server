import { catchAsynch } from "../utils/catchAsynch.utils.js";
import SubScribeNewLetter from "../models/subScribeNewLetter.models.js";
import { AppError } from "../utils/appError.js";

export const subScribNewLetter = catchAsynch(async (req, res, next) => {
  const { email } = req.body;
  if (!email) {
    return next(new AppError("Email is required", 400));
  }

  const existingSubscription = await SubScribeNewLetter.findOne({ email });

  if (existingSubscription) {
    res.status(200).json({
      status: "user already subscribed",
      message: "Email is already subscribed",
      email: existingSubscription.email,
    });
    return;
  }

  const newSubscription = await SubScribeNewLetter.create({
    email: email.toLowerCase(),
  });
  res.status(201).json({
    status: "success",
    data: newSubscription,
  });
});
