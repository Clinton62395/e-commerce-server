import mongoose from "mongoose";
import { type } from "os";

const paymentSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      lowercase: true,
      required: true,
      match: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    },

    country: {
      label: { type: String, required: true }, // Nom du pays
      value: { type: String, required: true }, // Code du pays (cca2)
      flag: { type: String }, // URL du drapeau
    },

    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    postalCode: { type: String, required: true },
    address: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    giftwrap: { type: Boolean, default: false },

    saveInfo: { type: Boolean, default: false },

    amount: { type: Number, required: true },

    cartItems: [
      {
        title: { type: String, required: true },
        price: { type: Number, required: true },
        quantity: { type: Number, default: 1 },
        picture: [
          {
            url: { type: String, required: true },
            public_id: { type: String, required: true },
          },
        ],
      },
    ],
    status: { type: String, default: "pending" },
    reference: { type: String },
  },
  { timestamps: true }
);

export const Payment = mongoose.model("Payment", paymentSchema);
