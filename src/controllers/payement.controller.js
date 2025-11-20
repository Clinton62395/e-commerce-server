import express from "express";
import Paystack from "@paystack/paystack-sdk";
import doten from "dotenv";
import { catchAsynch } from "../utils/catchAsynch.utils.js";
import { AppError } from "../utils/appError.js";
import { Payment } from "../models/payement.models.js";
import { Customer } from "@paystack/paystack-sdk/lib/apis/index.js";

doten.config();

const paystack = new Paystack(process.env.PAYSTACK_SECRET_KEY);

// Route pour initialiser le paiement
export const initialisePayment = catchAsynch(async (req, res, next) => {
  const {
    email,
    amount,
    firstName,
    cartItems,
    lastName,
    country,
    city,
    address,
    postalCode,
    saveInfo,
  } = req.body;
  console.log("==>body contentes", req.body);

  const requiredFields = [
    "email",
    "firstName",
    "lastName",
    "country",
    "city",
    "address",
    "postalCode",
    "cartItems",
    "amount",
  ];

  for (const field of requiredFields) {
    if (!req.body[field]) {
      return next(new AppError(`${field} is required`, 400));
    }
  }

  if (!Array.isArray(cartItems) || cartItems.length === 0) {
    return next(new AppError("cartItems must be a non-empty array", 400));
  }
  const reference = `ORDER-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const payment = await Payment.create({
    reference,
    email: email.toLowerCase(),
    amount,
    firstName,
    lastName,
    country,
    city,
    address,
    postalCode,
    cartItems,
    createdAt: Date.now(),
    saveInfo,
    status: "pending",
  });

  const io = req.app.get("io");
  console.log("📡 Émission Socket.IO: order:new", payment);
  io.emit("order:new", payment);

  try {
    const paystackResponse = await paystack.transaction.initialize({
      email,
      amount: amount * 100,
      reference,
      callback_url:
        process.env.NODE_ENV === "production"
          ? "https://e-commerce-project-azure-five.vercel.app/success"
          : "http://localhost:5173/success",

      metadata: { firstName, lastName, country, city },
    });
    console.log("paystack feellback==>", paystackResponse);
    console.log("paystack feellback data==>", paystackResponse.data);

    const { authorization_url } = paystackResponse.data;

    res.json({
      success: true,
      message: "payement initialized successfully",
      authorization_url: authorization_url,
      reference: reference,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export const paystackWebhook = catchAsynch(async (req, res, next) => {
  const event = req.body;

  console.log("📥 Webhook reçu:", event.event);
  console.log("📥 Webhook reçu status:", event.data.status);

  if (event.event === "charge.success") {
    const { reference, email, amount, paid_at, customer, status } = event.data;

    console.log(`💰 Paiement réussi: ${reference}`);

    // ✅ CORRECTION 1: Utiliser findOneAndUpdate pour récupérer le document
    const updatedPayment = await Payment.findOneAndUpdate(
      { reference },
      {
        $set: {
          status: status,
          paidAt: paid_at,
          email,
          amount: amount / 100, // Convertir de kobo à naira
        },
      },
      {
        new: true, // Retourner le document mis à jour
        upsert: true,
      }
    );

    if (updatedPayment) {
      // ✅ CORRECTION 2: Émettre les vraies données du paiement
      const payment = {
        id: updatedPayment._id,
        reference: updatedPayment.reference,
        amount: updatedPayment.amount,
        status: updatedPayment.status,
        picture: updatedPayment?.picture,
        cartItems: updatedPayment.cartItems,

        firstName: updatedPayment.firstName,
        lastName: updatedPayment.lastName,
        paidAt: updatedPayment.paidAt,
        createdAt: updatedPayment.createdAt,
        // Infos supplémentaires
      };

      // ✅ SIMPLIFICATION: Émettre à TOUS (pas de room)

      const io = req.app.get("io");

      console.log("📡 Émission Socket.IO: order:updated", payment);
      io.emit("order:updated", payment);

      console.log(
        `[Socket.IO] ✅ Transaction ${payment.reference} notifiée aux admins`
      );
    }
  }

  // Paystack doit recevoir une réponse 200
  res.sendStatus(200);
});

export const verifyPayment = catchAsynch(async (req, res, next) => {
  const { reference } = req.params;

  const payment = await Payment.findOne({ reference });

  if (!payment) {
    return next(new AppError("Payment reference not found", 404));
  }

  if (payment.status == "pending") {
    payment.save == "success";
  }

  res.status(200).json({
    success: true,
    message: "Payment reference fetched successfully",
    data: {
      reference: payment.reference,
      email: payment.email,
      amount: payment.amount,
      status: payment.status,
      picture: payment.picture,
      cartItems: payment.cartItems,
      shippingInfo: {
        firstName: payment.firstName,
        lastName: payment.lastName,
        userEmail: payment.email,
        address: payment.address,
        saveInfo: payment.saveInfo,

        city: payment.city,
        country: payment.country,
        postalCode: payment.postalCode,
      },
      paidAt: payment.paidAt,
      createdAt: payment.createdAt,
    },
  });
});

// get All payment

export const getAllPayment = catchAsynch(async (req, res, next) => {
  const payments = await Payment.find().sort({ createdAt: -1 });

  if (!payments || payments.length === 0) {
    return next(new AppError("no payment found", 404));
  }

  console.log("data payment send to front ==>", payments);
  res.status(200).json({
    success: true,
    message: "Payment data successful",
    data: payments,
  });
});
