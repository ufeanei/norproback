import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import siteConfigs from "./config/env.js";
import sessionRoutes from "./routes/sessionRoutes.js";

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
app.use(cors());
app.use(bodyParser.json({ limit: "30mb", extended: true }));

app.use("/session", sessionRoutes);
