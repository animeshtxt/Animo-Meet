import { User } from "../models/user.model.js";
import { status } from "http-status";
import bcrypt, { hash } from "bcrypt";
import crypto from "crypto";

const register = async (req, res) => {
  const { name, username, password } = req.body;

  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res
        .status(status.CONFLICT)
        .json({ message: "User already exists ! Try a different username" });
    }

    const hashedPW = await bcrypt.hash(password, 10);
    const newUser = new User({
      name,
      username,
      password: hashedPW,
    });

    await newUser.save();
    res
      .status(status.CREATED)
      .json({ message: "User registered successfully" });
  } catch (e) {
    console.log(`Error in register route : \nERROR = \n ${e}`);
    return res.status(500).json({ message: `${e}` });
  }
};

const login = async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: "Please provide all credentials" });
  }
  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(status.NOT_FOUND).json({ message: "User not found" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (isMatch) {
      // console.log(isMatch);
      let token = crypto.randomBytes(20).toString("hex");
      user.token = token;
      await user.save();
      return res.status(status.OK).json({
        token: token,
        message: "login successful",
        username: user.username,
        name: user.name,
      });
    } else {
      return res
        .status(status.UNAUTHORIZED)
        .json({ message: "invalid credentials" });
    }
  } catch (e) {
    console.log(`Error in login route : \nERROR = \n ${e}`);
    return res.status(500).json({ message: `${e}` });
  }
};

const verifyUser = async (req, res) => {
  try {
    const user = req.user;

    return res.status(status.OK).json({
      message: "User validated",
      name: user.name,
      username: user.username,
    });
  } catch (e) {
    return res.status(status.INTERNAL_SERVER_ERROR).json({ message: `${e}` });
  }
};

export { login, register, verifyUser };
