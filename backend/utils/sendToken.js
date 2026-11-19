const sendToken = (user, statusCode, res) => {
  const token = user.getJWTToken();
  const isProduction = process.env.NODE_ENV === "production";
  const expiryDays = Number(process.env.JWT_EXPIRES_TIME || 90);

  const cookieOptions = {
    expires: new Date(Date.now() + expiryDays * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
  };

  res.cookie("jwt", token, cookieOptions);
  user.password = undefined;

  res.status(statusCode).json({
    success: true,
    token,
    data: { user },
  });
};

module.exports = sendToken;
