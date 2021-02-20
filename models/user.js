import mongoose from "mongoose";
import bcrypt from "bcrypt";
import { nanoid } from "nanoid";

const validEmail = function (email) {
  let regx = /\S+@\S+\.\S+/;
  return regx.test(email);
};

const emailValidation = [
  { validator: validEmail, message: "ugyldig epostadresse" },
];

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: [true, "må fyless ut"], trim: true },

  email: {
    type: String,
    required: [true, "må fyless ut"],
    validate: emailValidation,
    trim: true,
  },
  password: { type: String, required: [true, "må fylles ut"], trim: true },
  latestjob: String,
  latestCompany: String,
  totalExp: String,
  jobStatus: String,
  highestDiploma: String,
  diplomaField: String,
  fylke: String,
  kommune: String,
  discipline: String,
  cv: String,
  industry: String,
  connections: [mongoose.Schema.Types.ObjectId],
  savedjobs: [mongoose.Schema.Types.ObjectId],
  conRequests: [mongoose.Schema.Types.ObjectId],
  blockedUsers: [mongoose.Schema.Types.ObjectId],
  city: String,
  owner: { type: Boolean, default: false },
  profilePic: String,
  createdAt: { type: Date, default: Date.now() },
  emailConfirmed: { type: Boolean, default: false },
  confirmDigest: String,
  rememberDigest: String,
  resetDigest: String,
  resetSentAt: Date,
  pageadminto: {
    companyid: mongoose.Schema.Types.ObjectId,
    comName: String,
  },
});

userSchema.virtual("firstName").get(function () {
  return this.fullName.split(" ")[0];
});

var User = mongoose.model("User", userSchema);
export default User;
