import express from "express";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import siteConfigs from "./config/env.js";
import sessionRoutes from "./routes/sessionRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import companiesRoutes from "./routes/companiesRoutes.js";
import jobsRoutes from "./routes/jobsRoutes.js";
import postsRoutes from "./routes/postsRoutes.js";
import jobApplicationRoutes from "./routes/jobApplicationRoutes.js";
import commentRoutes from "./routes/commentsRoutes.js";
import sendMessageRoutes from "./routes/sendMessageRoutes.js";

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

app.use(express.json({ limit: "10mb", extended: true }));
app.use(cookieParser()); // parsing incoming cookies

app.use("/session", sessionRoutes);
app.use("/users", userRoutes);
app.use("/companies", companiesRoutes);
app.use("/jobs", jobsRoutes);
app.use("/applications", jobApplicationRoutes);
app.use("/posts", postsRoutes);
app.use("/comments", commentRoutes);
app.use("/messages", sendMessageRoutes);
