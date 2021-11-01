const Product = require("../models/product");
const ErrorHandler = require("../utils/errorhandler");
const catchAsyncError = require("../middleware/catchAsyncError");
const ApiFeatures = require("../utils/apiFeatures");

// Create Product -- Admin
exports.createProduct = catchAsyncError(async (req, res, next) => {
  req.body.user = req.user.id;
  const product = await Product.create(req.body);
  console.log(product);
  res.status(201).json({
    success: true,
    product,
  });
});

// Get All Products
exports.getAllProducts = catchAsyncError(async (req, res) => {
  const resultPerPage = 5;
  const productCount = await Product.countDocuments();

  const apifeature = new ApiFeatures(Product.find(), req.query)
    .search()
    .filter()
    .pagination(resultPerPage);

  const products = await apifeature.query;
  console.log(products);
  res.status(200).json({
    success: true,
    products,
    productCount,
  });
});

// Get Single Products
exports.getSingleProduct = catchAsyncError(async (req, res, next) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    return next(new ErrorHandler("Product Not Found", 404));
  } else {
    res.status(200).json({
      success: true,
      product,
    });
  }
});

// Update Product -- Admin
exports.updateProduct = catchAsyncError(async (req, res, next) => {
  let product = await Product.findById(req.params.id);
  if (!product) {
    return next(new ErrorHandler("Product Not Found", 404));
  }

  product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });
  console.log(product);
  res.status(200).json({
    success: true,
    product,
  });
});

// Delete Product -- Admin
exports.deleteProduct = catchAsyncError(async (req, res, next) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    return next(new ErrorHandler("Product Not Found", 404));
  }

  await product.remove();
  res.status(200).json({
    success: true,
    message: "Product Deleted Successfully",
  });
});

// Create New Review or Update Review
exports.createProductReview = catchAsyncError(async (req, res, next) => {
  const {
    rating,
    comment,
    productId
  } = req.body;

  const review = {
    user: req.user.id,
    name: req.user.name,
    rating: Number(rating),
    comment,
  };

  const product = await Product.findById(productId);

  const isReviewed = product.reviews.find(
    (rev) => rev.user.toString() === req.user.id.toString()
  );

  if (isReviewed) {
    product.reviews.forEach((rev) => {
      if (rev.user.toString() === req.user._id.toString())
        (rev.rating = rating), (rev.comment = comment);
    });
  } else {
    product.reviews.push(review);
    product.numOfReviews = product.reviews.length;
  }

  let avg = 0;

  product.reviews.forEach((rev) => {
    avg += rev.rating;
  })

  product.ratings = avg / product.reviews.length;

  await product.save({
    validateBeforeSave: false
  });

  res.status(200).json({
    success: true,
  });
});

// Get All Reviews of a product
exports.getSingleProductReview = catchAsyncError(async (req, res, next) => {
  const product = Product.findById(req.params.id);
  if (!product) {
    return next(new ErrorHandler("Product Not Found", 404));
  }
  res.status(200).json({
    success: true,
    reviews: product.reviews,
  });
});

// Delete Review of a product
exports.deleteProductReview = catchAsyncError(async (req, res, next) => {
  const product = Product.findById(req.query.productId);
  if (!product) {
    return next(new ErrorHandler("Product Not Found", 404));
  }

  const reviews = product.reviews.filter( rev => rev._id.toString() !== req.query.id.toString());

  let avg = 0;

  reviews.forEach((rev) => {
    avg += rev.rating;
  })

  const ratings = avg / reviews.length;

  const numOfReviews = reviews.length;

  await Product.findByIdAndUpdate(req.query.productId, {reviews, ratings, numOfReviews}, { new: true, runValidators: true, useFindAndModify: false});

  res.status(200).json({
    success: true,
  });
});