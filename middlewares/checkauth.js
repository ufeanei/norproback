import configs from "../config/env.js";
import jwt from "jsonwebtoken";
const env = process.env.NODE_ENV || "development";
const checkauth = (req, res, next) => {
  try {
    const token = req.cookies ? req.cookies.tk : null;

    let decodedData;
    if (token) {
      decodedData = jwt.verify(token, configs[env].tksecret);
      req.userId = decodedData.userId;
      console.log(req.userId);
      next();
    } else {
      console.log("error no token");
      res.status(200).json({ message: "Vennligst logg inn først" });
    }
  } catch (err) {
    res.status(401).json({ message: "Vennligst logg inn først" });
  }
};
export default checkauth;
