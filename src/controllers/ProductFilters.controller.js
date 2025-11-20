import { catchAsynch } from "../utils/catchAsynch.utils.js";
import Products from "../models/products.models.js";
import { AppError } from "../utils/appError.js";

export const getFilterdProducts = catchAsynch(async (req, res, next) => {
  const { category } = req.query;

  const filters = {};

  if (category) {
    filters.category = category;
  }

  let query = Products.find(filters);

  const product = await query.exec();
  const count = await Products.countDocuments(filters);

  if (!product || product.length === 0) {
    return next(new AppError("no  product found for this category ", 404));
  }

  return res.status(200).send({
    success: true,
    message: "products filters by categories",
    data: product,
    count,
  });
});
