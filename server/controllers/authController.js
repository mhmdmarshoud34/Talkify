import jwt from "jsonwebtoken";
import { User } from "../models/userModel.js";
import { compare } from "bcrypt";
import { renameSync, unlinkSync } from "fs";

const maxAge = 3 * 24 * 60 * 60 * 1000; //3 days

const createToken = (email, userId) => {
  return jwt.sign({ email, userId }, process.env.JWT_KEY, {
    expiresIn: maxAge,
  });
};

export const signup = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).send("Email and Password are required");
    }

    const userData = await User.create({
      email,
      password,
    });

    res.cookie("jwt", createToken(email, userData.id), {
      maxAge,
      secure: true,
      sameSite: "None",
    });

    return res.status(201).json({
      userData: {
        id: userData.id,
        email: userData.email,
        profileSetup: userData.profileSetup,
      },
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).send("An account already exists with this email");
    }

    console.error(error);
    return res.status(500).send("Internal Server Error");
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email && !password) {
      return res.status(400).send("Email and Password is required");
    }

    const userData = await User.findOne({ email });

    if (!userData) {
      return res.status(404).send("User with the given email not found");
    }
    const auth = await compare(password, userData.password);
    if (!auth) {
      return res.status(400).send("Password is incorrect");
    }

    res.cookie("jwt", createToken(email, userData.id), {
      maxAge,
      secure: true,
      sameSite: "None",
    });

    return res.status(200).json({
      userData: {
        id: userData.id,
        email: userData.email,
        profileSetup: userData.profileSetup,
        firstName: userData.firstName,
        lastName: userData.lastName,
        image: userData.image,
        color: userData.color,
      },
    });
  } catch (error) {
    console.log({ error });
    return res.status(500).send("Internal Sever Error");
  }
};

export const getUserInfo = async (req, res, next) => {
  try {
    const userData = await User.findById(req.userId);
    if (!userData) {
      return res.status(404).send("User with the given id is not found");
    }

    return res.status(200).json({
      id: userData.id,
      email: userData.email,
      profileSetup: userData.profileSetup,
      firstName: userData.firstName,
      lastName: userData.lastName,
      image: userData.image,
      color: userData.color,
    });
  } catch (error) {
    console.log({ error });
    return res.status(500).send("Internal Sever Error");
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const { userId } = req;
    const { firstName, lastName, color } = req.body;
    if (!firstName || !lastName) {
      return res.status(400).send("Firstname lastname and color is required");
    }

    const userData = await User.findByIdAndUpdate(
      userId,
      {
        firstName,
        lastName,
        color,
        profileSetup: true,
      },
      { new: true, runValidators: true } //to get the new data from database and run it
    );
    if (!userData) {
      return res.status(404).send("User with the given id is not found");
    }

    return res.status(200).json({
      id: userData.id,
      email: userData.email,
      profileSetup: userData.profileSetup,
      firstName: userData.firstName,
      lastName: userData.lastName,
      image: userData.image,
      color: userData.color,
    });
  } catch (error) {
    console.log({ error });
    return res.status(500).send("Internal Sever Error");
  }
};

export const addProfileImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).send("File is required");
    }

    const date = Date.now();
    let fileName = "uploads/profiles/" + date + req.file.originalname;
    renameSync(req.file.path, fileName);

    const updatedUser = await User.findByIdAndUpdate(
      req.userId,
      { image: fileName },
      { new: true, runValidators: true }
    );

    return res.status(200).json({
      image: updatedUser.image,
    });
  } catch (error) {
    console.log({ error });
    return res.status(500).send("Internal Sever Error");
  }
};

export const removeProfileImage = async (req, res, next) => {
  try {
    const { userId } = req;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).send("User not found");
    }

    if (user.image) {
      unlinkSync(user.image);
    }

    user.image = null;

    await user.save();

    return res.status(200).send("Profile image removed successfully");
  } catch (error) {
    console.log({ error });
    return res.status(500).send("Internal Sever Error");
  }
};

export const logout = async (req, res, next) => {
  try {
    res.cookie("jwt", "", { maxAge: 1, secure: true, sameSite: "None" });

    return res.status(200).send("Logout successfully");
  } catch (error) {
    console.log({ error });
    return res.status(500).send("Internal Sever Error");
  }
};
