import Products from "../models/products.models.js";
import { AppError } from "../utils/appError.js";
import { catchAsynch } from "../utils/catchAsynch.utils.js";

export const createProducts = catchAsynch(async (req, res, next) => {
  const {
    clotheName,
    price,
    rate,
    brands,
    tags,
    color,
    size,
    picture,
    quantity,
    discountPrice,
    title,
  } = req.body;
  const requiredFields = [
    "clotheName",
    "price",
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
    title,
    discountPrice
  });

  res.status(201).json({
    success: true,
    message: "product created successfuly",
    data: newProduct,
  });
});

// delete a product

export const deleteProduct = catchAsynch(async (req, res, next) => {
  const product = await Products.findByIdAndDelete(req.params.id);
  if (!product) {
    return next(new AppError("product not found", 404));
  }
  res.status(200).json({
    success: true,
    message: "product deleted successfully",
    deletedProduct: {
      id: product._id,
      title: product.title,
    },
  });
});

export const getSingleProduct = catchAsynch(async (req, res, next) => {
  const product = await Products.findById(req.params.id);
  if (!product) {
    return next(new AppError("product not found", 404));
  }

  res.status(200).json({
    success: true,
    message: "product fetched successfully",
    data: product,
  });
});

export const getAllProducts = catchAsynch(async (req, res, next) => {
  const products = await Products.find({});
  if (!products || products.length === 0) {
    return next(new AppError("product not found", 404));
  }

  res.status(200).json({
    success: true,
    message: "Products retrieved successfully",
    data: products,
    count: products.length,
  });
});

export const updateProducts = catchAsynch(async (req, res, next) => {
  const { id } = req.params;
  const product = await Products.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!product) {
    return next(new AppError("product not found"));
  }

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
