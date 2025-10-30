import mongoose from "mongoose";

const subScribeNewLetterSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true },
  },
  { timestamps: true }
);

const SubScribeNewLetter = mongoose.model(
  "SubScribeNewLetter",
  subScribeNewLetterSchema
);

export default SubScribeNewLetter;
