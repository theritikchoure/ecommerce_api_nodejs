const User = require("../models/user");
const ErrorHandler = require("../utils/errorhandler");
const catchAsyncError = require("../middleware/catchAsyncError");
const sendToken = require('../utils/jwtToken');
const sendMail = require('../utils/sendMail');
const crypto = require('crypto');

// Register a User
exports.registerUser = catchAsyncError(async (req, res, next) => {
    const {name, email, password} = req.body;

    const user = await User.create({
        name, email, password,
        avatar: {
            public_id: "this is sample id",
            url: "profileurl"
        }
    });
    
    sendToken(user, 201, res);
});

// Login User
exports.loginUser = catchAsyncError(async (req, res, next) => {
    const { email, password } = req.body;

    //If user has not given email or password 
    if(!email || !password)
    {
        return next(new ErrorHandler("Please Enter Email and Password", 400))
    }

    const user = await User.findOne({email}).select("+password");

    if(!user)
    {
        return next(new ErrorHandler("Invalid Email or Password", 401))
    }

    const isPasswordMatched = await user.comparePassword(password);

    if (!isPasswordMatched) {
        return next(new ErrorHandler("Invalid email or password", 401));
    }

    sendToken(user, 200, res);
});

// Logout User
exports.loggedOutUser = catchAsyncError(async (req, res, next) => {
    
    res.cookie("token", null, {
        expires: new Date(Date.now()),
        httpOnly: true,
    })

    res.status(200).json({
        success: true,
        message: "Logged Out"
    })
});

// User Forget Password
exports.forgetPassword = catchAsyncError(async (req, res, next) => {
    const user = await User.findOne({email: req.body.email});
    if(!user)
    {
        return next(new ErrorHandler("User Not Found", 404));
    }
    
    // Get ResetPasswordToken 
    const resetToken = user.getResetPasswordToken();
    await user.save({validateBeforeSave:false});

    const resetPasswordUrl = `${req.protocol}://${req.get("host")}/api/v1/users/password/reset/${resetToken}`;

    const message = `Your Password Reset Token is :- \n\n ${resetPasswordUrl} \n\n If you have not requested this email then, please ignore it`;

    try
    {
        await sendMail({
            email: user.email,
            subject: `Ecommerce Website Password Reset`,
            message,
        })

        res.status(200).json({
            success: true,
            message: `Email send to ${user.email} successfully`,
        })
    }
    catch(err)
    {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save({validateBeforeSave:false});

        return next(new ErrorHandler(err.message, 500))
    }
})


// User Reset Password -- User
exports.resetPassword = catchAsyncError(async (req, res, next) => {

    
    //Creating Token Hash
    const resetPasswordToken = crypto.createHash("sha256").update(req.params.token).digest("hex");

    const user = await User.findOne({resetPasswordToken, resetPasswordExpire:{ $gt: Date.now()}});

    if(!user)
    {
        return next(new ErrorHandler("Reset Password Token Invalid or Has Been Expired", 400));
    }

    if(req.body.password !== req.body.confirmPassword)
    {
        return next(new ErrorHandler("Password Does Not Matched", 400));
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    sendToken(user, 200, res);

});

// Get User Details -- User
exports.getUserDetails = catchAsyncError(async (req, res, next) => {
    const user = await User.findById(req.user.id);

    res.status(200).json({
        success: true,
        user
    })
})

// Update User Password -- User
exports.updateUserPassword = catchAsyncError(async (req, res, next) => {
    const user = await User.findById(req.user.id).select("+password");

    const isPasswordMatched = await user.comparePassword(req.body.oldPassword);

    if(!isPasswordMatched)
    {
        return next(new ErrorHandler("Old Password is Incorrect", 400));
    }

    if(req.body.newPassword !== req.body.confirmPassword)
    {
        return next(new ErrorHandler("Password Does not Matched", 400));
    }

    user.password = req.body.newPassword;

    await user.save();

    sendToken(user, 200, res);
});

// Update User Profile -- User
exports.updateUserProfile = catchAsyncError(async (req, res, next) => {

    const newUserData = {
        name: req.body.name,
        email: req.body.email,
    }

    // We will add cloudinary later

    const user = await User.findByIdAndUpdate(req.user.id, newUserData, {new: true, runValidators: true, useFindAndModify:false});

    res.status(200).json({
        success: true
    });

});


// Get All Registered Users -- Admin
exports.getAllRegisteredUsers = catchAsyncError(async (req, res, next) => {
    const users = await User.find();

    res.status(200).json({
        success: true,
        users
    })
});

// Get Single Registered User -- Admin
exports.getSingleRegisteredUser = catchAsyncError(async (req, res, next) => {
    const user = await User.findById(req.params.id);

    if(!user)
    {
        return next(new ErrorHandler("User Not Found", 404));
    }

    res.status(200).json({
        success: true,
        user
    })
});

// Update User Role -- Admin
exports.updateUserRole = catchAsyncError(async (req, res, next) => {

    const newUserRole = {
        role: req.body.role,
    }

    const user = await User.findByIdAndUpdate(req.params.id, newUserRole, {new: true, runValidators: true, useFindAndModify:false});

    if (!user) {
        return next(new ErrorHandler("User Not Found", 404));
    }

    res.status(200).json({
        success: true
    });
});

// Delete User -- Admin
exports.deleteUser = catchAsyncError(async (req, res, next) => {

    // we will remove cloudinary later

    const user = await User.findById(req.params.id);

    if (!user) {
      return next(new ErrorHandler("User Not Found", 404));
    }
  
    await user.remove();
    res.status(200).json({
      success: true,
      message: "User Deleted Successfully",
    });
  });