var mongoose = require("mongoose");

var jobSchema = new mongoose.Schema({
  jobTitle: {
    type: String,
    required: [true, "Stillingstittel må fylle ut"],
    trim: true,
  },
  jobCategory: {
    type: String,
    required: [true, "jobbkategori må fylle ut"],
    trim: true,
  },
  jobType: {
    type: String,
    required: [true, "Stillingsstype må fylle ut"],
    trim: true,
  },
  jobFylke: { type: String, required: [true, "Fylke må fylle ut"] },
  jobKommune: { type: String, required: [true, "kommune må fylle ut"] },
  streetAddr: { type: String, trim: true },
  descr: {
    type: String,
    required: [true, "Stillingsbeskrivelse må fylle ut"],
    trim: true,
  },
  applymethod: { type: String, required: [true, " velg søknadsmetode"] },
  datePosted: { type: Date, default: Date.now },
  expiryDate: {
    type: Date,
    default: function () {
      return Date.now() + 30 * 24 * 60 * 60 * 1000;
    },
  }, // never use Date.now() as this set a value when schema is created instead of when doc is
  views: { type: Number, default: 0 },
  status: { type: String, default: "Active", enum: ["Expired", "Active"] },
  applyLink: {
    type: String,
    required: [
      function () {
        return this.applymethod === "applyLink" && this.applyLink === "";
      },
      "Må fylle ut lenken",
    ],
    trim: true,
  },
  applyEmail: {
    type: String,
    required: [
      function () {
        return this.applymethod === "onsiteapply" && this.applyEmail === "";
      },
      "e-post for mottak av varsler må fylles ut",
    ],
    trim: true,
  },
  applyDeadline: String,
  applicants: { type: Number, default: 0 },
  poster: {
    name: String,
    position: String,
    id: mongoose.Schema.Types.ObjectId,
  },
  hasComPage: String,
  // if the user has no company page and fill in company data in the ad, store them here
  company: {
    comDescr: String,
    comWebsite: String,
    comName: {
      type: String,
      required: [
        function () {
          return this.hasComPage === "No";
        },
        "Arbeidsgiver må fylle ut",
      ],
      trim: true,
    },
    comlogo: String,
  },
  // if the user wants company data taken from his company page to be displayed on job details page
  // store that company id here
  companypage: { type: mongoose.Schema.Types.ObjectId, ref: "Company" },
});

jobSchema.virtual("expired").get(function () {
  return Date.now() > this.expiryDate;
});

var Job = mongoose.model("Job", jobSchema);
export default Job;
