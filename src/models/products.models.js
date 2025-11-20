import mongoose from "mongoose";
import slugify from "slugify";

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

    rate: { type: Number, default: 0 },

    slug: { type: String, slug: "title", unique: true },
    mainImage: {
      url: { type: String, required: true },
      public_id: { type: String, required: true },
    },

    picture: [
      {
        url: { type: String, required: true },
        public_id: { type: String, required: true },
      },
    ],

    newArrival: { type: Boolean, default: false },

    promot: { type: Boolean, default: false },

    size: {
      type: [String],
      default: ["one size"],
    },

    releaseDate: {
      type: Date,
    },

    color: { type: [String], required: true, default: [] },

    brands: { type: [String], default: [] },

    tags: { type: [String], default: [] },
    status: {
      type: String,
      enum: ["in stock", "coming soon"],
      default: "in stock",
      required: true,
    },
  },
  { timestamps: true }
);

productsSchema.index({
  clotheName: "text",
  title: "text",
  brands: "text",
  tags: "text",
});

productsSchema.pre("save", function (next) {
  if (!this.slug && this.title) {
    this.slug = slugify(this.title, { lower: true, strict: true });
  }
  next();
});

const Products = mongoose.model("Product", productsSchema);
export default Products;
