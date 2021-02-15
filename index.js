import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import siteConfigs from "./config/env.js";
import sessionRoutes from "./routes/sessionRoutes.js";
import userRoutes from "./routes/userRoutes.js";

import cors from "cors";
const app = express();

const PORT = process.env.PORT || 5000;
const env = process.env.NODE_ENV || "development";

// ********data base connection *******
mongoose
  .connect(siteConfigs[env].dbURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() =>
    app.listen(PORT, () => console.log("server running on port 5000"))
  )
  .catch(() => console.log(err.message));
//*************************************** */

//************general middlewares */
app.enable("trust proxy");
app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(bodyParser.json({ limit: "10mb", extended: true }));
app.use(cookieParser()); // parsing incoming cookies

app.use("/session", sessionRoutes);
app.use("/users", userRoutes);
