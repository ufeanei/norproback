import mongoose from "mongoose";
import env from "../../config/env";

mongoose
  .connect(env.development.dbURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  })
  .then(() =>
    app.listen(PORT, () => console.log("server running on port 5000"))
  )
  .catch(() => console.log(err.message));
