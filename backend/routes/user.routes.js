const { Router } = require("express");
const userModel = require("../models/user.models");
const {
  getUserProfile,
  updateUserProfile,
} = require("../controllers/userprofile.controller");
const jwt = require("jsonwebtoken");
const { JWT_USER_PASSWORD } = require("../config/user.config");
const { userMiddleware } = require("../middlewares/user.middlewares");
const bcrypt = require("bcrypt");
const z = require("zod");

const userRouter = Router();

const signupSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
});

const signinSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
});

userRouter.post("/signup", async function (req, res) {
  try {
    const { email, password, firstName, lastName } = signupSchema.parse(
      req.body
    );

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    await userModel.create({
      email: email,
      password: hashedPassword,
      firstName: firstName,
      lastName: lastName,
    });

    res.json({
      message: "Signup succeeded",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: "Validation failed",
        errors: error.errors,
      });
    }

    if (error.code === 11000) {
      return res.status(409).json({
        message: "Email already exists",
      });
    }

    console.error("Signup error:", error);
    res.status(500).json({
      message: "Signup failed",
    });
  }
});

userRouter.post("/signin", async function (req, res) {
  try {
    const { email, password } = signinSchema.parse(req.body);

    const user = await userModel.findOne({ email: email });

    if (user && (await bcrypt.compare(password, user.password))) {
      const token = jwt.sign(
        {
          id: user._id,
        },
        JWT_USER_PASSWORD,
        {
          expiresIn: "24h",
        }
      );

      res.cookie("auth_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 24 * 60 * 60 * 1000,
      });

      res.json({
        token: token,
        userId: user._id,
      });
    } else {
      res.status(403).json({
        message: "Incorrect credentials",
      });
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: "Validation failed",
        errors: error.errors,
      });
    }

    console.error("Signin error:", error);
    res.status(500).json({
      message: "Signin failed",
    });
  }
});

userRouter.get("/profile", userMiddleware, getUserProfile);
userRouter.put("/profile", userMiddleware, updateUserProfile);

module.exports = userRouter;
