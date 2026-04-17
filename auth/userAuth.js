const jwt = require("jsonwebtoken");
const User = require("../modules/user.module");

async function isUser(req, res, next) {
  try {
    let userId;

    const token =
      req.cookies?.user || req.headers.authorization?.split(" ")[1];

    // ❗ Check token exists
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    // ✅ Verify token
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    userId = decoded.uuid; // make sure this matches your JWT payload

    // ✅ Find user (FIXED)
    const user = await User.findOne({ uuid: userId });
    // OR use: await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // 🔐 Role check
    if (user.user_role !== "user") {
      return res.status(403).json({ message: "Access denied: Admin only" });
    }

    // ✅ Attach user
    req.user = user;

    next();
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
}

module.exports = isUser;