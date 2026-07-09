import mongoose from "mongoose";
import question from "../models/question.js";

export const Askquestion = async (req, res) => {
  const { postquestiondata } = req.body;
  const postques = new question({ ...postquestiondata });
  try {
    await postques.save();
    res.status(200).json({ data: postques });
  } catch (error) {
    console.log(error);
    res.status(500).json("something went wrong..");
    return;
  }
};

import User from "../models/auth.js";

export const getallquestion = async (req, res) => {
  const { search, tags, author, unanswered, minVotes, startDate, endDate } = req.query;

  try {
    let query = {};

    // 1. Text Search on Title or Body
    if (search) {
      query.$or = [
        { questiontitle: { $regex: search, $options: "i" } },
        { questionbody: { $regex: search, $options: "i" } },
      ];
    }

    // 2. Tag Filter
    if (tags) {
      const tagList = tags.split(",").map((t) => t.trim().toLowerCase());
      query.questiontags = { $in: tagList.map((tag) => new RegExp(`^${tag}$`, "i")) };
    }

    // 3. Author Filter
    if (author) {
      query.userposted = { $regex: author, $options: "i" };
    }

    // 4. Unanswered Filter
    if (unanswered === "true") {
      query.noofanswer = 0;
    }

    // 5. Date Range Filter
    if (startDate || endDate) {
      query.askedon = {};
      if (startDate) query.askedon.$gte = new Date(startDate);
      if (endDate) query.askedon.$lte = new Date(endDate);
    }

    // Fetch matching questions
    let questionsList = await question.find(query);

    // Filter by minVotes in JS (since votes calculation is dynamic)
    if (minVotes) {
      const minV = parseInt(minVotes, 10);
      questionsList = questionsList.filter((q) => {
        const votesCount = (q.upvote || []).length - (q.downvote || []).length;
        return votesCount >= minV;
      });
    }

    // 6. Fetch user plan details to implement High Search Priority
    const users = await User.find({}, "plan");
    const userPlanMap = {};
    users.forEach((u) => {
      userPlanMap[u._id.toString()] = u.plan || "Free";
    });

    const getPlanWeight = (plan) => {
      if (plan === "Gold") return 3;
      if (plan === "Silver") return 2;
      if (plan === "Bronze") return 1;
      return 0;
    };

    // Sort by Plan Weight descending (Gold first), and then by asked date descending
    questionsList.sort((a, b) => {
      const weightA = getPlanWeight(userPlanMap[a.userid] || "Free");
      const weightB = getPlanWeight(userPlanMap[b.userid] || "Free");

      if (weightA !== weightB) {
        return weightB - weightA; // Higher plan comes first
      }

      // Secondary sort: askedon descending (newest first)
      return new Date(b.askedon).getTime() - new Date(a.askedon).getTime();
    });

    // Map and attach authorPlan to each question object
    const questionsWithPlan = questionsList.map((q) => {
      const qObj = q.toObject ? q.toObject() : q;
      qObj.authorPlan = userPlanMap[q.userid] || "Free";
      return qObj;
    });

    res.status(200).json({ data: questionsWithPlan });
  } catch (error) {
    console.error("Error in getallquestion:", error);
    res.status(500).json("something went wrong..");
    return;
  }
};
export const deletequestion = async (req, res) => {
  const { id: _id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(_id)) {
    return res.status(400).json({ message: "question unavailable" });
  }
  try {
    await question.findByIdAndDelete(_id);
    res.status(200).json({ message: "question deleted" });
  } catch (error) {
    res.status(500).json("something went wrong..");
    return;
  }
};
export const votequestion = async (req, res) => {
  const { id: _id } = req.params;
  const { value, userid } = req.body;
  if (!mongoose.Types.ObjectId.isValid(_id)) {
    return res.status(400).json({ message: "question unavailable" });
  }
  try {
    const questionDoc = await question.findById(_id);
    const upindex = questionDoc.upvote.findIndex((id) => id === String(userid));
    const downindex = questionDoc.downvote.findIndex(
      (id) => id === String(userid),
    );
    if (value === "upvote") {
      if (downindex !== -1) {
        questionDoc.downvote = questionDoc.downvote.filter(
          (id) => id !== String(userid),
        );
      }
      if (upindex === -1) {
        questionDoc.upvote.push(userid);
      } else {
        questionDoc.upvote = questionDoc.upvote.filter(
          (id) => id !== String(userid),
        );
      }
    } else if (value === "downvote") {
      if (upindex !== -1) {
        questionDoc.upvote = questionDoc.upvote.filter(
          (id) => id !== String(userid),
        );
      }
      if (downindex === -1) {
        questionDoc.downvote.push(userid);
      } else {
        questionDoc.downvote = questionDoc.downvote.filter(
          (id) => id !== String(userid),
        );
      }
    }
    const questionvote = await question.findByIdAndUpdate(_id, questionDoc, {
      new: true,
    });
    res.status(200).json({ data: questionvote });
  } catch (error) {
    res.status(500).json("something went wrong..");
    return;
  }
};
