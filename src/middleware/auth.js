import jwt from "jsonwebtoken";

function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;
  console.log("Authorization Header: ", authHeader);

  if (!authHeader) {
    console.log("No authorization header present");
    return res.status(401).json({
      msg: "Error",
      Code: 401,
      err: "Access denied",
    });
  }

  const token = authHeader.split(" ")[1]; // Extract token from 'Bearer <token>'
  console.log("Extracted Token: ", token);

  if (!token) {
    console.log("No token present in the authorization header");
    return res.status(401).json({
      msg: "Error",
      Code: 401,
      err: "Access denied",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.USER_SECRET_KEY);
    req.userId = decoded.userId;
    console.log("Token verified successfully, userId: ", decoded.userId);
    next();
  } catch (error) {
    console.log("Invalid token: ", error.message);
    res.status(401).json({
      msg: "Error",
      Code: 401,
      err: "Invalid token",
    });
  }
}

export default verifyToken;
