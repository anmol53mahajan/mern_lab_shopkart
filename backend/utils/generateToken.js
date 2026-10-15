const jwt = require("jsonwebtoken");

const generateTokenAndSetCookie = (res, customerId) => {
  const isProd = process.env.NODE_ENV === "production";
  const token = jwt.sign({ id: customerId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

  const cookieOptions = {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  };

  res.cookie("token", token, cookieOptions);
  return token;
};

module.exports = generateTokenAndSetCookie;