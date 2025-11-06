import mongoose from "mongoose";
import slug from "mongoose-slug-generator";

mongoose.plugin(slug);
const productsSchema = new mongoose.Schema(
  {
    clotheName: { type: String, required: true },

    title: { type: String, required: true },

    description: { type: String, required: true },

    category: {
      type: String,
      required: true,
      default: "men",
      enum: ["men", "women", "menAccessories", "womenAccessories", "discount"],
    },

    price: { type: Number, required: true, default: 0 },
    discountPrice: { type: Number, default: 0 },

    quantity: { type: Number, required: true, default: 0 },

    rate: { type: String, default: "0" },

    slug: { type: String, slug: "title", unique: true },

    picture: { type: String, required: true },

    newArrival: { type: Boolean, default: false },

    promot: { type: Boolean, default: false },

    size: {
      type: Array,
      default: [],
    },

    releaseDate: Date,
    color: { type: Array, required: true, default: [] },

    brands: { type: [String], default: [] },

    tags: { type: [String], default: [] },
  },
  { timestamps: true }
);

productsSchema.index({
  clotheName: "text",
  title: "text",
  brands: "text",
  tags: "text",
});

const Products = mongoose.model("Product", productsSchema);
export default Products;
