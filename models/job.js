import mongoose from "mongoose";

var jobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Stillingstittel må fylle ut"],
    trim: true,
  },
  category: {
    type: String,
    required: [true, "jobbkategori må fylle ut"],
    trim: true,
  },
  jtype: {
    type: String,
    required: [true, "Stillingsstype må fylle ut"],
    trim: true,
  },
  fylke: { type: String, required: [true, "Fylke må fylle ut"] },
  kommune: { type: String, required: [true, "kommune må fylle ut"] },
  addr: { type: String, trim: true },
  descr: {
    type: String,
    required: [true, "Stillingsbeskrivelse må fylle ut"],
    trim: true,
  },
  applyMethod: { type: String, required: [true, " velg søknadsmetode"] },
  datePosted: { type: Date, default: Date.now },
  expiryDate: {
    type: Date,
    default: function () {
      return Date.now() + 30 * 24 * 60 * 60 * 1000;
    },
  }, // never use Date.now() as this set a value when schema is created instead of when doc is
  views: { type: Number, default: 0 },
  status: { type: String, default: "Active", enum: ["Expired", "Active"] },
  companyApplyLink: {
    type: String,
    required: [
      function () {
        return this.applymethod === "indirect" && this.companyApplyLink === "";
      },
      "Må fylle ut lenken",
    ],
    trim: true,
  },
  newAppNotifEmail: {
    type: String,
    required: [
      function () {
        return this.applymethod === "direct" && this.newAppNotifEmail === "";
      },
      "e-post for mottak av varsler må fylles ut",
    ],
    trim: true,
  },
  applyDeadline: String,

  applicants: { type: Number, default: 0 },
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },

  // if the user has no company page and fill in company data in the ad, store them here

  comDescr: String,
  comWebsite: String,
  comName: {
    type: String,
    required: [
      function () {
        return this.comName === "" && !this.company;
      },
      "arbeidsgiver må fylles ut",
    ],
    trim: true,
  },
  comlogo: String,
  // if job associated ith a registered company store company id here
  company: { type: mongoose.Schema.Types.ObjectId, ref: "Company" },
});

jobSchema.virtual("expired").get(function () {
  return Date.now() > this.expiryDate;
});

var Job = mongoose.model("Job", jobSchema);
export default Job;
