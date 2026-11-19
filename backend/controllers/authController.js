
// Import required packages and files

const User = require("../models/user");
const ErrorHandler = require("../utils/errorHandler");
const catchAsyncErrors = require("../middlewares/catchAsyncErrors");
const sendToken = require("../utils/sendToken");
const cloudinary = require("cloudinary");
const { promisify } = require("util");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const Email = require("../utils/email");


// ==========================================
// SIGNUP USER
// POST /api/v1/users/signup
// ==========================================

exports.signup = catchAsyncErrors(async (req, res, next) => {
  console.log("SIGNUP STARTED");

  const {
    name,
    email,
    password,
    passwordConfirm,
    phoneNumber,
  } = req.body;

  if (!name || !email || !password || !passwordConfirm || !phoneNumber) {
    return next(
      new ErrorHandler("Please fill all required fields", 400)
    );
  }

  if (password !== passwordConfirm) {
    return next(
      new ErrorHandler("Passwords do not match", 400)
    );
  }

  let avatar = {
    public_id: "default",
    url: "/images/images.png",
  };

  // Upload avatar only when actual base64 image is provided
  if (
    req.body.avatar &&
    req.body.avatar.startsWith("data:image/")
  ) {
    console.log("AVATAR UPLOAD STARTED");

    const result = await cloudinary.uploader.upload(req.body.avatar, {
      folder: "avatar",
      width: 150,
      crop: "scale",
    });

    console.log("AVATAR UPLOAD COMPLETED");

    avatar = {
      public_id: result.public_id,
      url: result.secure_url,
    };
  }

  console.log("USER CREATION STARTED");

  const user = await User.create({
    name,
    email: email.trim().toLowerCase(),
    password,
    passwordConfirm,
    phoneNumber,
    avatar,
  });

  console.log("USER CREATED:", user._id);

  return sendToken(user, 201, res);
});


// ==========================================
// LOGIN USER
// POST /api/v1/users/login
// ==========================================

exports.login = catchAsyncErrors(async (req, res, next) => {
  console.log("LOGIN: Request received");

  const { email, password } = req.body;

  if (!email || !password) {
    return next(
      new ErrorHandler("Please enter email and password", 400)
    );
  }

  console.log("LOGIN: Searching user");

  const user = await User.findOne({
    email: email.trim().toLowerCase(),
  }).select("+password");

  console.log("LOGIN: User search completed");

  if (!user) {
    return next(
      new ErrorHandler("Invalid email or password", 401)
    );
  }

  console.log("LOGIN: Checking password");

  const isPasswordMatch = await user.correctPassword(password);

  console.log("LOGIN: Password check completed");

  if (!isPasswordMatch) {
    return next(
      new ErrorHandler("Invalid email or password", 401)
    );
  }

  console.log("LOGIN: Generating token");

  return sendToken(user, 200, res);
});


// ==========================================
// PROTECT ROUTE
// ==========================================

exports.protect = catchAsyncErrors(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies && req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return next(
      new ErrorHandler(
        "You are not logged in! Please log in to get access.",
        401
      )
    );
  }

  const decoded = await promisify(jwt.verify)(
    token,
    process.env.JWT_SECRET
  );

  const currentUser = await User.findById(decoded.id);

  if (!currentUser) {
    return next(
      new ErrorHandler(
        "User no longer exists. Please login again.",
        401
      )
    );
  }

  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new ErrorHandler(
        "User recently changed password! Please log in again.",
        401
      )
    );
  }

  req.user = currentUser;

  next();
});


// ==========================================
// GET USER PROFILE
// GET /api/v1/users/me
// ==========================================

exports.getUserProfile = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  res.status(200).json({
    success: true,
    user,
  });
});


// ==========================================
// UPDATE PASSWORD
// PUT /api/v1/users/password/update
// ==========================================

exports.updatePassword = catchAsyncErrors(async (req, res, next) => {
  const {
    oldPassword,
    newPassword,
    newPasswordConfirm,
  } = req.body;

  const user = await User.findById(req.user.id).select("+password");

  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }

  const isMatched = await user.correctPassword(
    oldPassword,
    user.password
  );

  if (!isMatched) {
    return next(
      new ErrorHandler("Old password is incorrect", 400)
    );
  }

  if (newPassword !== newPasswordConfirm) {
    return next(
      new ErrorHandler("New passwords do not match", 400)
    );
  }

  user.password = newPassword;
  user.passwordConfirm = newPasswordConfirm;

  await user.save();

  res.status(200).json({
    success: true,
    message: "Password updated successfully",
  });
});


// ==========================================
// UPDATE PROFILE
// PUT /api/v1/users/me/update
// ==========================================

exports.updateProfile = catchAsyncErrors(async (req, res, next) => {
  const newUserData = {
    name: req.body.name,
    email: req.body.email
      ? req.body.email.trim().toLowerCase()
      : undefined,
  };

  if (req.body.avatar && req.body.avatar.startsWith("data:image/")) {
    const user = await User.findById(req.user.id);

    if (user.avatar && user.avatar.public_id !== "default") {
      await cloudinary.uploader.destroy(user.avatar.public_id);
    }

    const result = await cloudinary.uploader.upload(req.body.avatar, {
      folder: "avatars",
      width: 150,
      crop: "scale",
    });

    newUserData.avatar = {
      public_id: result.public_id,
      url: result.secure_url,
    };
  }

  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    newUserData,
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(200).json({
    success: true,
    user: updatedUser,
  });
});


// ==========================================
// FORGOT PASSWORD
// POST /api/v1/users/forgetPassword
// ==========================================

exports.forgotPassword = catchAsyncErrors(async (req, res, next) => {
  const email = req.body.email
    ? req.body.email.trim().toLowerCase()
    : "";

  const user = await User.findOne({ email });

  if (!user) {
    return next(
      new ErrorHandler("There is no user with this email address.", 404)
    );
  }

  const resetToken = user.createPasswordResetToken();

  await user.save({ validateBeforeSave: false });

  try {
    const resetURL = `${process.env.FRONTEND_URL}/users/resetPassword/${resetToken}`;

    await new Email(user, resetURL).sendPasswordReset();

    res.status(200).json({
      status: "success",
      message: "Token sent to email!",
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    await user.save({ validateBeforeSave: false });

    return next(
      new ErrorHandler(
        "There was an error sending the email, try again later!",
        500
      )
    );
  }
});


// ==========================================
// RESET PASSWORD
// PATCH /api/v1/users/resetPassword/:token
// ==========================================

exports.resetPassword = catchAsyncErrors(async (req, res, next) => {
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    return next(
      new ErrorHandler("Token is invalid or has expired", 400)
    );
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;

  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;

  await user.save();

  return sendToken(user, 200, res);
});


// ==========================================
// LOGOUT
// GET /api/v1/users/logout
// ==========================================

exports.logout = catchAsyncErrors(async (req, res, next) => {
  const isProduction = process.env.NODE_ENV === "production";

  res.cookie("jwt", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
  });

  res.status(200).json({
    success: true,
    message: "Logged out",
  });
});
