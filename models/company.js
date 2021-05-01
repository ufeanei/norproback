import mongoose from "mongoose";

var companySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Company name is required"],
    trim: true,
  },
  descr: {
    type: String,
    required: [true, "Description is required"],
    trim: true,
  },
  sector: { type: String, required: [true, "Select Category"], trim: true },
  comProducts: [String],
  addr: {
    type: String,
    required: [true, "Company name is required"],
    trim: true,
  },
  website: { type: String, required: true, trim: true },
  size: { type: String, required: [true, "Size is required"], trim: true },
  logo: { type: String },

  followers: { type: Number, default: 0 },
  datePosted: { type: Date, default: Date.now },

  pageAdminIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
});

var Company = mongoose.model("Company", companySchema);
export default Company;
