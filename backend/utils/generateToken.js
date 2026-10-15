const jwt = require("jsonwebtoken");

const generateTokenAndSetCookie = (res, customerId) => {
  const token = jwt.sign({ id: customerId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

  const cookieOptions = {
    httpOnly: true, 
    secure: process.env.NODE_ENV === "production", 
    sameSite: "strict", 
    maxAge:24 * 60 * 60 * 1000, 
  };

  res.cookie("token", token, cookieOptions);
  return token;
};

module.exports = generateTokenAndSetCookie;