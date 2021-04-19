import express from "express";
import User from "../models/user.js";
import checkauth from "../middlewares/checkauth.js";
const urlencodedParser = express.urlencoded({ extended: false });
const router = express.Router();

// new company saved
//guard against mongodb injection. clean every input for mongo injection and xss
router.post("/", urlencodedParser, checkauth, async (req, res) => {
  var company = new Company(req.body);
  try {
    const com = await company.save();
    if (com) {
      res.json({ message: "company saved" });
    } else {
      res.json({ message: "server error" });
    }
  } catch (err) {
    res.json({ message: "server error" });
  }
});

// get a comapny by id
router.get("/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const company = await Company.findById(id);
    if (company) {
      res.json({ company });
    } else {
      res.json({ message: "not found" });
    }
  } catch (err) {
    res.json({ message: "server error" });
  }
});

// find company of which you are page admin
router.get('/:id/mycompany', checkauth, (req, res)=>{
    const id = req.params.id;
  try {
    const company = await Company.ind({id: {$in: pageadminids}})
    if (company) {
      res.json({ company });
    } else {
      res.json({ message: "not found" });
    }
  } catch (err) {
    res.json({ message: "server error" });
  }
})

export default router;
