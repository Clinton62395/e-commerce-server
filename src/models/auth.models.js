import mongoose from "mongoose";
import bcrypt from "bcrypt";
const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: {
      type: String,
      required: true,
      lowercase: true,
      unique: true,
      match: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    },

    roles: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },

    phoneNumber: {
      type: String,
      required: true,
      match: [/^\+?[0-9]{8,15}$/, "phone number is invalid"],
    },
    password: {
      type: String,
      required: true,
      trim: true,
      maxlength: [15, "Password cannot be more than 15 characters"],
      minlength: [6, "Password cannot be less than 6 characters"],
    },
    image: { type: String },
    googleId: { type: String, unique: true },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  // Only hash the password if it has been modified or is new
  if (!this.isModified("password")) {
    return next();
  }
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});
const User = mongoose.model("User", userSchema);
export default User;
