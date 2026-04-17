const user = require("../modules/user.module");
const suser = require("../modules/subUser.module");
const jwt = require("jsonwebtoken");
const { v4 } = require("uuid");
const bcrypt = require("bcrypt");

async function checkUser(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const prams = url.searchParams;
  const id = prams.get("id");

  const response = await user.findOne({ uuid: id });
  if (!response) {
    return res.json({ error: "User not find" });
  }

  const token = jwt.sign({ role: response.user_role }, process.env.SECRET_KEY, {
    expiresIn: "1d",
  });
  return res.json({ message: "User valied", token });
}

async function createUser(req, res) {
  const { payload } = req.body;

  const hasedPass = await bcrypt.hash(payload.pass, 10);

  const findExistinguser = await user.findOne({ user_email: payload.email });

  if (findExistinguser) {
    return res.json({ error: "user already exist", status: 404 });
  }

  const tSet = new user({
    uuid: v4(),
    user_name: payload.name,
    relation_user_uuid: payload.id,
    user_email: payload.email,
    user_pass: hasedPass,
    user_username: payload.username,
    user_role: payload.role,
    createAt: new Date(),
    is_active: true,
  });
  await tSet.save();

  if (!tSet) {
    return res.json({ error: "Data not saved", status: 404 });
  }

  return res.json({ message: "Data saved Succesfull", status: 200 });
}
async function getUserlist(req, res) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const id = req.query.id;

    const skip = (page - 1) * limit;

    const filter = {}; // modify if needed

    const [users, total] = await Promise.all([
      user
        .find(filter, "uuid user_name user_email is_active user_role")
        .sort({ createdAt: -1, _id: -1 }) // ✅ FIXED
        .skip(skip)
        .limit(limit)
        .lean(),
      user.countDocuments(filter),
    ]);

    res.status(200).json({
      status: 200,
      users,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalUsers: total,
    });
  } catch (error) {
    res.status(500).json({ status: 500, error: error.message });
  }
}
async function getPeningUserlist(req, res) {
  try {
    // 1. Get page and limit from query params (e.g., /api/users?page=1&limit=5)
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const skip = (page - 1) * limit;

    // 2. Fetch data and total count simultaneously
    const [users, total] = await Promise.all([
      suser
        .find({}, "uuid user_name user_email  is_active user_role")
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1, _id: -1 }),
      suser.countDocuments(),
    ]);

    res.status(200).json({
      status: 200,
      users,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalUsers: total,
    });
  } catch (error) {
    res.status(500).json({ status: 500, error: error.message });
  }
}
async function getAlloverDetails(req, res) {
  try {
    const [users, total] = await Promise.all([
      user
        .find({}, "user_name user_email  is_active user_role")
        .limit(5)
        .sort({ createdAt: -1, _id: -1 }),
      user.countDocuments(),
    ]);
    const [usersa, totala] = await Promise.all([
      suser
        .find({}, "user_name user_email  is_active user_role")
        .sort({ createdAt: -1, _id: -1 }),
      suser.countDocuments(),
    ]);

    res.status(200).json({
      status: 200,
      users,
      totalUsers: total,
      totalpandingUser: totala,
    });
  } catch (error) {
    res.status(500).json({ status: 500, error: error.message });
  }
}
//update section//
async function updateUser(req, res) {
  try {
    const userId = req.params.id; // ID of user to update
    const requesterId = req.query.id; // ID of user making the request
    const updateData = req.body;

    // Verify requester exists and get their role
    const requester = await user.findOne({ uuid: requesterId });
    if (!requester) {
      return res
        .status(401)
        .json({ error: "Unauthorized access", status: 401 });
    }

    // Check if user to update exists
    const userToUpdate = await user.findOne({ _id: userId });
    if (!userToUpdate) {
      return res.status(404).json({ error: "User not found", status: 404 });
    }

    // Role-based access control
    const allowedFields = {};

    if (requester.user_role === "manager") {
      // Manager cannot update admin users or their details
      if (userToUpdate.user_role === "admin") {
        return res.status(403).json({
          error: "Managers cannot update admin users",
          status: 403,
        });
      }
      // Manager can update all fields
      if (updateData.user_name) allowedFields.user_name = updateData.user_name;
      if (updateData.user_email) allowedFields.user_email = updateData.user_email;
      if (updateData.user_role) allowedFields.user_role = updateData.user_role;
      if (updateData.hasOwnProperty("is_active")) allowedFields.is_active = updateData.is_active;
    } else if (requester.user_role === "admin") {
      // Admin can update multiple fields
      if (updateData.user_name) allowedFields.user_name = updateData.user_name;
      if (updateData.user_email)
        allowedFields.user_email = updateData.user_email;
      if (updateData.user_role) allowedFields.user_role = updateData.user_role;
      if (updateData.hasOwnProperty("is_active"))
        allowedFields.is_active = updateData.is_active;
    } else {
      return res
        .status(403)
        .json({ error: "Insufficient permissions", status: 403 });
    }

    // Check if email is being updated and if it already exists (excluding current user)
    if (
      allowedFields.user_email &&
      allowedFields.user_email !== userToUpdate.user_email
    ) {
      const existingEmail = await user.findOne({
        user_email: allowedFields.user_email,
      });
      if (existingEmail) {
        return res
          .status(400)
          .json({ error: "Email already in use", status: 400 });
      }
    }

    // Update the user
    const updatedUser = await user.findOneAndUpdate(
      { _id: userId },
      { ...allowedFields, updatedAt: new Date() },
      { returnDocument: 'after' },
    );

    return res.status(200).json({
      message: "User updated successfully",
      status: 200,
    });
  } catch (error) {
    return res.status(500).json({ status: 500, error: error.message });
  }
}

// Approve user function - move from subUser table to user table
async function approveUser(req, res) {
  try {
    const { suUserId } = req.params; // ID of subUser to approve
    const requesterId = req.query.id; // ID of user making the request

    // Verify requester is admin
    const requester = await user.findOne({ uuid: requesterId });
    if (!requester ) {
      return res.status(403).json({
        error: "unauthorized access",
        status: 403,
      });
    }

    // Find the pending user in subUser table
    const pendingUser = await suser.findOne({ uuid: suUserId });
    if (!pendingUser) {
      return res.status(404).json({
        error: "Pending user not found",
        status: 404,
      });
    }

    // Check if user email already exists in user table
    const existingUser = await user.findOne({ user_email: pendingUser.user_email });
    if (existingUser) {
      return res.status(400).json({
        error: "User email already exists",
        status: 400,
      });
    }

    // Create new user in user table
    const newUser = new user({
      uuid: pendingUser.uuid || v4(),
      user_name: pendingUser.user_name,
      relation_user_uuid: requester.uuid,
      user_email: pendingUser.user_email,
      user_pass: pendingUser.user_pass,
      user_username: pendingUser.user_username,
      user_role: pendingUser.user_role || "user",
      is_active: true,
      createAt: new Date(),
    });

    await newUser.save();

    // Delete from subUser table
    await suser.findOneAndDelete({ uuid: suUserId });

    return res.status(200).json({
      message: "User approved and moved to active users successfully",
      status: 200,
      user: newUser,
    });
  } catch (error) {
    return res.status(500).json({ status: 500, error: error.message });
  }
}

// Update profile name function
async function updateProfileName(req, res) {
  try {
    const userId = req.params.id; // ID of user to update
    const requesterId = req.query.id; // ID of user making the request
    const { user_name } = req.body;

    if (!user_name || user_name.trim() === "") {
      return res.status(400).json({
        error: "User name is required",
        status: 400,
      });
    }

    // Verify requester exists
    const requester = await user.findOne({ uuid: requesterId });
    if (!requester) {
      return res.status(401).json({
        error: "Unauthorized access",
        status: 401,
      });
    }

    // Find user to update
    const userToUpdate = await user.findOne({ uuid: userId });
    if (!userToUpdate) {
      return res.status(404).json({
        error: "User not found",
        status: 404,
      });
    }

    // Users can only update their own name, or admin/manager can update others
    if (requesterId !== userId && requester.user_role !== "admin" && requester.user_role !== "manager") {
      return res.status(403).json({
        error: "You can only update your own profile",
        status: 403,
      });
    }

    // Update user name
    const updatedUser = await user.findOneAndUpdate(
      { uuid: userId },
      { user_name: user_name.trim(), updatedAt: new Date() },
      { returnDocument: "after" }
    );

    return res.status(200).json({
      message: "Profile name updated successfully",
      status: 200,
      user: updatedUser,
    });
  } catch (error) {
    return res.status(500).json({ status: 500, error: error.message });
  }
}

// Change password function
async function changePassword(req, res) {
  try {
    const userId = req.params.id; // ID of user changing password
    const requesterId = req.query.id; // ID of user making the request
    const currentPassword = req.body.current;
    const newPassword = req.body.new;
    const confirmPassword = req.body.confirm;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({
        error: "Current password, new password, and confirm password are required",
        status: 400,
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        error: "New password and confirm password do not match",
        status: 400,
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        error: "New password must be at least 6 characters long",
        status: 400,
      });
    }

    // Verify requester exists
    const requester = await user.findOne({ uuid: requesterId });
    if (!requester) {
      return res.status(401).json({
        error: "Unauthorized access",
        status: 401,
      });
    }

    // Find user to update password
    const userToUpdate = await user.findOne({ uuid: userId });
    if (!userToUpdate) {
      return res.status(404).json({
        error: "User not found",
        status: 404,
      });
    }

    // Users can only update their own password
    if (requesterId !== userId) {
      return res.status(403).json({
        error: "You can only change your own password",
        status: 403,
      });
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, userToUpdate.user_pass);
    if (!isPasswordValid) {
      return res.status(401).json({
        error: "Current password is incorrect",
        status: 401,
      });
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    const updatedUser = await user.findOneAndUpdate(
      { uuid: userId },
      { user_pass: hashedNewPassword, updatedAt: new Date() },
      { returnDocument: "after" }
    );

    return res.status(200).json({
      message: "Password changed successfully",
      status: 200,
    });
  } catch (error) {
    return res.status(500).json({ status: 500, error: error.message });
  }
}
async function deleteAccount(req, res) {
  try {
    const userId = req.params.id; // ID of user to delete
    const requesterId = req.query.id; // ID of user making the request

    // Verify requester exists
    const requester = await user.findOne({ uuid: requesterId });
    if (!requester) {
      return res.status(401).json({
        error: "Unauthorized access",
        status: 401,
      });
    }

    // Find user to delete
    const userToDelete = await user.findOne({ uuid: userId });
    if (!userToDelete) {
      return res.status(404).json({
        error: "User not found",
        status: 404,
      });
    }

    // Users can only delete their own account, or admin/manager can delete others
    if (requesterId !== userId && requester.user_role !== "admin" && requester.user_role !== "manager") {
      return res.status(403).json({
        error: "You can only delete your own account",
        status: 403,
      });
    }

    // Cannot delete admin users unless it's self-deletion
    if (userToDelete.user_role === "admin" && requesterId !== userId) {
      return res.status(403).json({
        error: "Admin users cannot be deleted by other users",
        status: 403,
      });
    }

    // Delete the user
    await user.findOneAndDelete({ uuid: userId });

    return res.status(200).json({
      message: "Account deleted successfully",
      status: 200,
    });
  } catch (error) {
    return res.status(500).json({ status: 500, error: error.message });
  }
}

module.exports = {
  checkUser,
  createUser,
  getUserlist,
  getPeningUserlist,
  getAlloverDetails,
  updateUser,
  approveUser,
  updateProfileName,
  changePassword,
  deleteAccount
};
