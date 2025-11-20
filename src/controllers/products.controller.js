import Products from "../models/products.models.js";
import { AppError } from "../utils/appError.js";
import { catchAsynch } from "../utils/catchAsynch.utils.js";
import dotenv from "dotenv";
import { v2 as cloudinary } from "cloudinary";

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  cloud_key: process.env.CLOUD_API_KEY,
  cloud_secret: process.env.CLOUD_API_SECRET,
});

// cloudinary config

export const createProducts = catchAsynch(async (req, res, next) => {
  const {
    clotheName,
    price,
    mainImage,
    rate,
    brands,
    tags,
    color,
    size,
    picture,
    description,
    quantity,
    discountPrice,
    title,
  } = req.body;

  console.log("les donnee frontend de product  ", req.body);
  console.log("les donnee frontend de product count:  ", req.body.length);
  const requiredFields = [
    "clotheName",
    "price",
    "description",
    "mainImage",
    "rate",
    "brands",
    "tags",
    "color",
    "size",
    "picture",
    "quantity",
    "title",
  ];

  for (const field of requiredFields) {
    if (!req.body[field]) {
      return next(new AppError(`field off ${field} is required`, 400));
    }
  }

  const newProduct = await Products.create({
    clotheName,
    price,
    rate,
    brands,
    tags,
    color,
    size,
    picture,
    quantity,
    description,
    mainImage,
    title,
    discountPrice,
  });

  res.status(201).json({
    success: true,
    message: "product created successfuly",
    data: newProduct,
  });
});

export const getSingleProduct = catchAsynch(async (req, res, next) => {
  const product = await Products.findById(req.params.id);

  res.status(200).json({
    success: true,
    message: "product fetched successfully",
    data: product,
  });
});

export const getAllProducts = catchAsynch(async (req, res, next) => {
  const products = await Products.find({});

  if (products.length === 0) {
    return next(new AppError("no product found", 404));
  }

  res.status(200).json({
    success: true,
    message: "product fetched successful",
    data: products,
    count: products.length,
  });
});

export const updateProducts = catchAsynch(async (req, res, next) => {
  const { id } = req.params;
  const product = await Products.findById(id);

  if (!product) {
    return next(new AppError("product not found"));
  }

  Object.keys(req.body).forEach((k) => {
    product[k] = req.body[k] || product[k];
  });

  if (!req.body.mainImage) product.mainImage = product.mainImage;

  await product.save();

  res.status(200).json({
    success: true,
    message: "product updated successfully",
    data: product,
  });
});

// delete all products

export const deleAllProducts = catchAsynch(async (req, res, next) => {
  const count = await Products.countDocuments();
  if (count === 0) {
    return next(new AppError("no products founds", 404));
  }

  await Products.deleteMany();
  res
    .status(200)
    .json({ success: true, message: "all products deleted successfully" });
});

// delete a product

export const deleteProduct = catchAsynch(async (req, res, next) => {
  const { id } = req.params;
  const product = await Products.findById(id);

  if (!product) {
    return next(new AppError("product not found", 404));
  }
  if (Array.isArray(product.picture)) {
    for (let img of product?.picture) {
      if (img?.public_id) {
        await cloudinary.uploader.destroy(img.public_id);
      }
    }
  }

  if (product?.mainImage?.public_id) {
    await cloudinary.uploader.destroy(product.mainImage.public_id);
  }

  await Products.findByIdAndDelete(id);
  res.status(200).json({
    success: true,
    message: `product with ${product.title} deleted successfully`,
    deletedProduct: {
      id: product._id,
      title: product.title,
    },
  });
});
