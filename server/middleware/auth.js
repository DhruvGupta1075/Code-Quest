import jwt from "jsonwebtoken";
const auth = (req, res, next) => {
  try {
    if (!req.headers.authorization) {
      return res.status(401).json({ message: "Authorization token is missing." });
    }
    const token = req.headers.authorization.split(" ")[1];
    let decodedata = jwt.verify(token, process.env.JWT_SECRET);
    req.userid = decodedata?.id;
    next();
  } catch (error) {
    console.log("Authentication verification failed:", error.message);
    return res.status(401).json({ message: "Authentication failed. Session expired or invalid." });
  }
};
export default auth;
