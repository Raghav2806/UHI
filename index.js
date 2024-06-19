import express from "express";
import bodyParser from "body-parser";
import { createUser, getIsoDate, getPrescriptionNumber } from "./repositries/userRepository.js";
import { readAllMed } from "./repositries/medRepository.js";
import { connectDB } from "./config/db.js";
import * as dotenv from "dotenv";
dotenv.config();

connectDB();
const app = express();
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get("/", async (req, res) => {
  try {
    const dt2a = await readAllMed();
    res.render("index.ejs", {
      input1: dt2a,
    });
  } catch (error) {
    console.error("Error reading med data:", error);
    // Handle the error appropriately, e.g., render an error page
    res.status(500).send("Internal Server Error");
  }
});

app.post("/prescription", async(req, res) => {
  const data1 = req.body;
  console.log(req.body);
  data1.currentDate=getIsoDate();
  data1.prescriptionNumber=getPrescriptionNumber();
  const medicines=req.body.medicines;
  const customMeds=req.body.customMedicines;
  if (customMeds) {
    customMeds.pop();
  }
  console.log(customMeds);
  createUser(data1,medicines);
  res.render("prescription.ejs", {
    input: data1,
    medicines: medicines,
    customMedicines: customMeds,
  });
})

app.post("/", async(req, res) => {
  res.redirect("/");
})

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
