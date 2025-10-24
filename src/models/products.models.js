import mongoose from "mongoose";

const productsSchema = new mongoose.Schema(
  {
    clotheName: { type: String, required: true },
    title: { type: String, required: true },
    price: { type: Number, required: true, default: 0 },
    quantity: { type: Number, required: true, default: 0 },
    rate: { type: String },
    picture: { type: String, required: true },
    newArrival: { type: Boolean, default: false },
    promot: { type: Boolean, default: false },
    size: {
      type: [String],
      default: [],
    },
    color: { type: [String], required: true, default: [] },
    brands: { type: [String], default: [] },
    tags: { type: [String], default: [] },
  },
  { timestamps: true }
);

const Products = mongoose.model("Product", productsSchema);
export default Products;
