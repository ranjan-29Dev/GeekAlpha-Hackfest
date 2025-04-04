const jwt = require("jsonwebtoken");
const { JWT_USER_PASSWORD } = require("../config/user.config");

function userMiddleware(req, res, next) {
  try {
    const token =
      req.headers.authorization?.split(" ")[1] ||
      req.headers.token ||
      req.cookies?.auth_token ||
      req.query?.token;

    if (!token) {
      return res.status(401).json({
        message: "Authentication required. No token provided.",
      });
    }

    const decoded = jwt.verify(token, JWT_USER_PASSWORD);

    req.userId = decoded.id;
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        message: "Token has expired. Please sign in again.",
      });
    } else if (error.name === "JsonWebTokenError") {
      return res.status(403).json({
        message: "Invalid token. Authentication failed.",
      });
    }

    console.error("Authentication error:", error);
    return res.status(403).json({
      message: "Authentication failed",
    });
  }
}

module.exports = {
  userMiddleware,
};
