import express from "express";
import bodyParser from "body-parser";
import { createUser, getIsoDate, getPrescriptionNumber } from "./repositries/userRepository.js";
import { readAllMed , addMeds} from "./repositries/medRepository.js";
import { findUserByEmail } from "./services/doctorServices.js";
import { connectDB } from "./config/db.js";
import * as dotenv from "dotenv";
dotenv.config();

connectDB();
const app = express();
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get("/", async (req, res) => {
  res.render("index.ejs");
})

app.post("/doctor", async (req, res) => {
  res.render("doctorLogin.ejs");
})

app.post("/doctorForm", async (req, res) => {
  const username = req.body.username;
  const loginPassword = req.body.password;
  try {
    const existingUser = await findUserByEmail(username);
    if (existingUser) {
      const storedPassword = existingUser.password;
      if(loginPassword == storedPassword) {
        //get meds only associated to the current doc
        const dt2a = await readAllMed();
        res.render("doctorForm.ejs", {
          input1: dt2a,
        });
      } else {
        res.send("Incorrect Password");
      }
    } else {
      res.send("User not found");
    }
  } catch (err) {
    console.log(err);
  }
});

app.post("/prescription", async(req, res) => {
  //get patient data by patient id and pass it to prescription
  //send doctor info as well according to the doctor using the form
  const data1 = req.body;
  console.log(req.body);
  data1.currentDate=getIsoDate();
  data1.prescriptionNumber=getPrescriptionNumber();
  const medicines=req.body.medicines;
  const customMeds=req.body.customMedicines;
  if (customMeds) {
    customMeds.pop();
    createUser(data1,customMeds);
    addMeds(data1.otherDisease,customMeds);
  } else {
    createUser(data1,medicines);
  }
  res.render("prescription.ejs", {
    input: data1,
    medicines: medicines,
    customMedicines: customMeds,
  });
})

app.get("/doctorForm", async(req, res) => {
  //get meds only associated to the current doc
  const dt2a = await readAllMed();
  res.render("doctorForm.ejs", {
    input1: dt2a,
  });
})

app.post("/", async(req, res) => {
  res.redirect("/doctorForm");
})

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
