const Order = require("../models/order");
const Product = require("../models/product");
const ErrorHandler = require("../utils/errorhandler");
const catchAsyncError = require("../middleware/catchAsyncError");
const ApiFeatures = require("../utils/apiFeatures");

// Create New Order 
exports.newOrder = catchAsyncError(async (req, res, next) => {
    const {shippingInfo, orderItems, paymentInfo, itemsPrice, taxPrice, shippingPrice, totalPrice} = req.body

    const order = await Order.create({shippingInfo, orderItems, paymentInfo, itemsPrice, taxPrice, shippingPrice, totalPrice, paidAt: Date.now(), user:req.user.id})

    res.status(201).json({
        success: true,
        order
    })
});

// Get Single Order
exports.getSingleOrder = catchAsyncError(async (req, res, next) => {
   const order = await Order.findById(req.params.id).populate("user", "name email");

   if(!order)
   {
       return next(new ErrorHandler("Order Not Found", 404));
   }

   res.status(200).json({
       success: true,
       order
   })
});

// Get Logged In User Orders
exports.myOrders = catchAsyncError(async (req, res, next) => {

    const orders = await Order.find({user:req.user.id});
 
    if(!orders)
    {
        return next(new ErrorHandler("You Have Not Ordered Yet", 404));
    }
 
    res.status(200).json({
        success: true,
        orders
    })
});

// Get All Orders by Admin
exports.getAllOrders = catchAsyncError(async (req, res, next) => {

    const orders = await Order.find();

    let totalAmount = 0;

    orders.forEach(order => {
        totalAmount += order.totalPrice;
    });
 
    res.status(200).json({
        success: true,
        totalAmount,
        orders
    })
});


// Update Order Status by Admin
exports.updateOrder = catchAsyncError(async (req, res, next) => {

    const order = await Order.findById(req.params.id);

    if(!order)
    {
        return next(new ErrorHandler("Order Not Found", 404));
    }

    if(order.orderStatus === "Delivered")
    {
        return next(new ErrorHandler("You have already delivered this product", 400));
    }
    
    order.orderItems.forEach(async (order) => {
        await updateStock(order.product, order.quantity);
    });

    order.orderStatus = req.body.status;

    if(req.body.status === "Delivered")
    {
        order.deliveredAt = Date.now();
    }

    await order.save({validateBeforeSave: false});

    res.status(200).json({
        success: true,
    })
});


async function updateStock(id, quantity) {
    const product = await Product.findById(id);

    product.stock = product.stock - quantity; 
    
    await product.save({validateBeforeSave: false});
}

// Delete Order by Admin
exports.deleteOrder = catchAsyncError(async (req, res, next) => {

    const order = await Order.findById(req.params.id);

    if(!order)
    {
        return next(new ErrorHandler("Order Not Found", 404));
    }

    await order.remove()

    res.status(200).json({
        success: true,
    })
});