import express from "express";
import cors from "cors";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import User from "./src/models/users.js";
import verifyToken from "./src/middleware/auth.js";

import dotenv from "dotenv";

import {
  generateQuestions,
  userQuestionAnswer,
  fileSummary,
} from "./src/openAi/chatbotHandlers.js";

// Load environment variables from .env file
dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get("/", verifyToken, (req, res) => {
  res.send("App works!!");
});

app.get("/api/suggested-questions", verifyToken, async (req, res) => {
  try {
    const questions = await generateQuestions();
    res.json({
      msg: "Success",
      Code: 200,
      data: questions,
    });
  } catch (error) {
    console.error("Error in /api/suggested-questions:", error);
    res.status(500).json({
      msg: "Error",
      Code: 500,
      err: error.message,
    });
  }
});

app.post("/api/user-question", verifyToken, async (req, res) => {
  try {
    const question = req.body;
    console.log("User question:", question);
    const answer = await userQuestionAnswer(question);
    res.json({
      msg: "Success",
      Code: 200,
      data: answer,
    });
  } catch (error) {
    console.error("Error in /api/user-question:", error);
    res.status(500).json({
      msg: "Error",
      Code: 500,
      err: error.message,
    });
  }
});

app.post("/api/file-summary", verifyToken, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        msg: "No file uploaded",
        Code: 400,
      });
    }

    const fileContent = req.file.buffer.toString("utf-8");
    console.log("File content:", fileContent);

    const summary = await fileSummary(fileContent);
    res.json({
      msg: "Success",
      Code: 200,
      data: summary,
    });
  } catch (error) {
    console.error("Error in /api/file-summary:", error);
    res.status(500).json({
      msg: "Error",
      Code: 500,
      err: error.message,
    });
  }
});

app.post("/api/register", async (req, res) => {
  const { email, password, firstName, lastName } = req.body;
  console.log("Registering user:", req.body);

  if (!email || !password || !firstName || !lastName) {
    return res.status(400).json({
      msg: "Bad Request",
      Code: 400,
      data: "Missing required fields",
    });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        msg: "Conflict",
        Code: 409,
        data: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      email,
      password: hashedPassword,
      firstName,
      lastName,
    });

    await user.save();
    const token = jwt.sign({ email }, process.env.USER_SECRET_KEY);
    console.log("User registered successfully:", token);
    res.status(201).json({
      msg: "Success",
      Code: 201,
      data: { token: token },
    });
  } catch (error) {
    console.error("Error in /api/register:", error);
    res.status(500).json({
      msg: "Error",
      Code: 500,
      err: error.message,
    });
  }
});

app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;
  console.log("Logging in user:", req.body);

  if (!email || !password) {
    return res.status(400).json({
      msg: "Bad Request",
      Code: 400,
      data: "Missing required fields",
    });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        msg: "Not Found",
        Code: 404,
        data: "User not found",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        msg: "Unauthorized",
        Code: 401,
        data: "Invalid credentials",
      });
    }

    const token = jwt.sign({ email }, process.env.USER_SECRET_KEY);
    console.log("User logged in successfully:", token);
    res.status(200).json({
      msg: "Success",
      Code: 200,
      data: { token: token },
    });
  } catch (error) {
    console.error("Error in /api/login:", error);
    res.status(500).json({
      msg: "Error",
      Code: 500,
      err: error.message,
    });
  }
});

app.listen(port, (err) => {
  if (err) {
    console.error(`Error starting server: ${err}`);
  } else {
    console.log(`Server running on port ${port}`);
  }
});
