import User from "../models/auth.js";
import Question from "../models/question.js";

const checkLimit = async (req, res, next) => {
  try {
    if (!req.userid) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const user = await User.findById(req.userid);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const plan = user.plan || "Free";
    let limit = 1;
    if (plan === "Bronze") limit = 5;
    else if (plan === "Silver") limit = 15;
    else if (plan === "Gold") limit = Infinity;

    // Check questions posted by user in the last 24 hours
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const count = await Question.countDocuments({
      userid: req.userid,
      askedon: { $gte: oneDayAgo },
    });

    if (count >= limit) {
      return res.status(403).json({
        message: `Daily question limit reached. You can only post ${limit} question(s) per day on the ${plan} Plan. Please upgrade to ask more questions!`,
        limit,
        count,
        plan,
      });
    }

    next();
  } catch (error) {
    console.error("Error in checkLimit middleware:", error);
    res.status(500).json({ message: "Internal server error in checkLimit" });
  }
};

export default checkLimit;
