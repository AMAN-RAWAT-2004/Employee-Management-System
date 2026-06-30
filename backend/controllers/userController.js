const User = require("../model/userModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const signToken = (id, expiry) => {
  return jwt.sign({ id }, process.env.JWT_SECURE, {
    expiresIn: expiry,
  });
};

exports.register = async (req, res) => {
  try {
    const { name, email, password, rememberMe } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(409).json({
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });
    const expiry = rememberMe
      ? process.env.JWT_EXPIRES_IN_REMEMBER
      : process.env.JWT_EXPIRES_IN_NOT_REMEMBER;
    const token = signToken(user._id, expiry);

    user.password = undefined;

    res.status(201).json({
      message: "User registered successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        profilePhoto: user.profilePhoto,
        role: user.role,
        department: user.department,
        designation: user.designaton,
      },
      token,
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password, rememberMe } = req.body;
    // console.log(rememberMe);

    if (!email || !password) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    // if (user.role !== "admin") {
    //   return res.status(403).json({
    //     message: "Access denied. Admins only.",
    //   });
    // }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }
    const expiry = rememberMe
      ? process.env.JWT_EXPIRES_IN_REMEMBER
      : process.env.JWT_EXPIRES_IN_NOT_REMEMBER;

    const token = signToken(user._id, expiry);

    user.password = undefined;

    res.status(200).json({
      message: "Successfully logged in",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        profilePhoto: user.profilePhoto,
        role: user.role,
        department: user.department,
        designation: user.designation,
      },
      token,
    });
  } catch (err) {
    res.status(500).json({
      message: "Server Error",
    });
  }
};
exports.fetchAllUsers = async (req, res) => {
  try {
    const users = await User.find({});
    res.status(200).json({
      message: "Successfully fetched users",
      totalUsers: users.length,
      users,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
