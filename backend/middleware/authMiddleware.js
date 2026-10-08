const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: "No authorization token provided.",
      });
    }

    const token = authHeader.startsWith("Bearer ")
      ? authHeader.substring(7)
      : authHeader;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authorization token is missing.",
      });
    }

    const secret = process.env.JWT_SECRET || "refergo_secret_key";
    const decoded = jwt.verify(token, secret);

    const userId = decoded.id || decoded.user_id || decoded.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Invalid user information in token.",
      });
    }

    const allowedRoles = ["peso_staff", "department_head"];
    const role = String(decoded.role || "").toLowerCase();

    if (!allowedRoles.includes(role)) {
      return res.status(403).json({
        success: false,
        message: "Invalid user role.",
      });
    }

    req.user = {
      id: userId,
      username: decoded.username || null,
      role,
    };

    next();
  } catch (error) {
    console.error("AUTH MIDDLEWARE ERROR:", error);

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Your session has expired. Please login again.",
      });
    }

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid authorization token.",
      });
    }

    return res.status(401).json({
      success: false,
      message: "Authentication failed.",
    });
  }
};
