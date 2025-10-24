import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();
const mongo_url = process.env.MONGO_URL;

const connectDB = async () => {
  try {
    if (!mongo_url) {
      throw new Error("mongo url is not defined in environnement env");
    }

    console.log(`attempting to mongodb url , ${mongo_url}`);
    await mongoose.connect(mongo_url);

    console.log("✅connection to mongodb successfully");
  } catch (err) {
    console.error("❌error when mongodb connection", err);
  }
};

export default connectDB;
