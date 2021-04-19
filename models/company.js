var mongoose = require("mongoose");

var adminSchema = new mongoose.Schema({
  name: { type: String },
  position: { type: String },
  email: String,
  picture: String,
  rights: [String],
  userId: mongoose.Schema.Types.ObjectId,
});

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
  //comStreetNum: {type: String, required: [true, 'Street and Number is required'], trim: true},
  //comPostcode: {type: String, required: [true, 'Postcode is  required'], trim: true},
  //comCity: {type: String, required: [true, 'City is required'], trim: true},
  //comCountry: {type: String, required: [true, 'Country is required'], trim: true},
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
  pageadmins: [adminSchema],
  pageadminids: [mongoose.Schema.Types.ObjectId],
});

var Company = mongoose.model("Company", companySchema);
export default Company;
