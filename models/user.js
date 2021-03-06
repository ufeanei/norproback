import mongoose from "mongoose";

var expSchema = new mongoose.Schema({
  toMonth: String,
  toYear: String,
  fromMonth: String,
  fromYear: String,
  fromDate: Date,
  toDate: Date,
  company: String,
  jobTitle: String,
  area: String,
  descr: String,
});

var eduSchema = new mongoose.Schema({
  school: String,
  diplom: String,
  studyField: String,
  fromYear: String,
  toYear: String,
});

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
  latestJob: String,
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
  conRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // store here ids of users who sent con request to you
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
  conRequestsSent: [mongoose.Schema.Types.ObjectId], // store here id of people you sent request to
  pageadminof: [{ type: mongoose.Schema.Types.ObjectId, ref: "Company" }],

  experiences: [expSchema],
  educations: [eduSchema],
  companyFollowed: [{ type: mongoose.Schema.Types.ObjectId, ref: "Company" }],
});

userSchema.virtual("firstName").get(function () {
  return this.fullName.split(" ")[0];
});

var User = mongoose.model("User", userSchema);
export default User;
