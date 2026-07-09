import mongoose from "mongoose";
import user from "../models/auth.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import question from "../models/question.js";
export const Signup = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const exisitinguser = await user.findOne({ email });
    if (exisitinguser) {
      return res.status(404).json({ message: "User already exist" });
    }
    const hashpassword = await bcrypt.hash(password, 12);
    const newuser = await user.create({
      name,
      email,
      password: hashpassword,
    });
    const token = jwt.sign(
      { email: newuser.email, id: newuser._id },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    res.status(200).json({ data: newuser, token });
  } catch (error) {
    res.status(500).json("something went wrong..");
    return;
  }
};
export const Login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const exisitinguser = await user.findOne({ email });
    if (!exisitinguser) {
      return res.status(404).json({ message: "User does not exist" });
    }

    const ispasswordcrct = await bcrypt.compare(
      password,
      exisitinguser.password
    );
    if (!ispasswordcrct) {
      return res.status(400).json({ message: "Invalid password" });
    }
    const token = jwt.sign(
      { email: exisitinguser.email, id: exisitinguser._id },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    res.status(200).json({ data: exisitinguser, token });
  } catch (error) {
    res.status(500).json("something went wrong..");
    return;
  }
};
export const getallusers = async (req, res) => {
  try {
    const alluser = await user.find();
    res.status(200).json({ data: alluser });
  } catch (error) {
    res.status(500).json("something went wrong..");
    return;
  }
};
export const updateprofile = async (req, res) => {
  const { id: _id } = req.params;
  const { name, about, tags, billingDetails } = req.body.editForm || req.body;
  if (!mongoose.Types.ObjectId.isValid(_id)) {
    return res.status(400).json({ message: "User unavailable" });
  }
  try {
    const updateFields = {};
    if (name !== undefined) updateFields.name = name;
    if (about !== undefined) updateFields.about = about;
    if (tags !== undefined) updateFields.tags = tags;
    if (billingDetails !== undefined) updateFields.billingDetails = billingDetails;

    const updatedProfile = await user.findByIdAndUpdate(
      _id,
      { $set: updateFields },
      { new: true }
    );
    res.status(200).json({ data: updatedProfile });
  } catch (error) {
    console.log(error);
    res.status(500).json("something went wrong..");
    return;
  }
};

export const toggleBookmark = async (req, res) => {
  const { questionId } = req.params;
  try {
    const currentUser = await user.findById(req.userid);
    if (!currentUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Validate Silver/Gold plan
    if (currentUser.plan !== "Silver" && currentUser.plan !== "Gold") {
      return res.status(403).json({
        message: "Bookmarking is a premium feature. Please upgrade to Silver or Gold Plan to use bookmarks.",
      });
    }

    const isBookmarked = currentUser.bookmarks.includes(questionId);
    if (isBookmarked) {
      currentUser.bookmarks = currentUser.bookmarks.filter((id) => id !== questionId);
      await currentUser.save();
      res.status(200).json({
        message: "Bookmark removed successfully",
        isBookmarked: false,
        bookmarks: currentUser.bookmarks,
      });
    } else {
      currentUser.bookmarks.push(questionId);
      await currentUser.save();
      res.status(200).json({
        message: "Bookmark added successfully",
        isBookmarked: true,
        bookmarks: currentUser.bookmarks,
      });
    }
  } catch (error) {
    console.error("Error in toggleBookmark:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const getBookmarks = async (req, res) => {
  try {
    const currentUser = await user.findById(req.userid);
    if (!currentUser) {
      return res.status(404).json({ message: "User not found" });
    }

    if (currentUser.plan !== "Silver" && currentUser.plan !== "Gold") {
      return res.status(403).json({ message: "Upgrade to Silver or Gold plan to access bookmarks." });
    }

    const bookmarkedQuestions = await question.find({
      _id: { $in: currentUser.bookmarks },
    });

    res.status(200).json({ data: bookmarkedQuestions });
  } catch (error) {
    console.error("Error in getBookmarks:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const getProfile = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid user ID" });
  }
  try {
    const matchedUser = await user.findById(id).select("-password");
    if (!matchedUser) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ data: matchedUser });
  } catch (error) {
    console.error("Error in getProfile:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};
