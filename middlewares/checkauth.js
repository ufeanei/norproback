import configs from "../config/env";
const env = process.env.NODE_ENV || "development";
export const checkauth = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(
      " "
    )[1]; /**this contain token */
    let decodedData;
    if (token) {
      decodedData = jwt.verify(token, configs[env].tksecret);
      req.userId = decodedData.userId;
      next();
    } else {
      res.status(400).json({ message: "Vennligst logg inn førsthenticated" });
    }
  } catch (err) {
    res.status(400).json({ message: "Vennligst logg inn først" });
  }
};
