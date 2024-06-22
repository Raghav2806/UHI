import express from "express";
import bodyParser from "body-parser";
import bcrypt from "bcrypt";
import { createUser, getIsoDate, getPrescriptionNumber } from "./repositries/userRepository.js";
import { addMeds} from "./repositries/medRepository.js";
import { createPrescription } from "./repositries/presRepository.js";
import { findDoctorByEmail, docDom, domMed} from "./services/doctorServices.js";
import { findPatientByEmail } from "./services/patientServices.js";
import { connectDB } from "./config/db.js";
import * as dotenv from "dotenv";
dotenv.config();

connectDB();
const app = express();
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
let sharedConst;

const saltRounds = 10;

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
    const existingUser = await findDoctorByEmail(username);
    if (existingUser) {
      const storedPassword = existingUser.password;
      if(loginPassword == storedPassword) {
        const docDomain=await docDom(username);
        const docMeds=await domMed(docDomain);
        sharedConst=docMeds;
        res.render("doctorForm.ejs", {
          input1: docMeds,
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
  data1.currentDate=getIsoDate();
  data1.prescriptionNumber=getPrescriptionNumber();
  const medicines=req.body.medicines;
  const customMeds=req.body.customMedicines;
  if (customMeds) {
    customMeds.pop();
    createPrescription(data1, customMeds);
    addMeds(data1.otherDisease,customMeds);
  } else {
    createPrescription(data1, medicines);
  }
  res.render("prescription.ejs", {
    input: data1,
    medicines: medicines,
    customMedicines: customMeds,
  });
})

app.get("/doctorForm", async(req, res) => {
  res.render("doctorForm.ejs", {
    input1: sharedConst,
  });
})

app.post("/", async(req, res) => {
  res.redirect("/doctorForm");
})

app.post("/patient", async (req, res) => {
  res.render("patientLanding.ejs");
})

app.post("/patientRegister", async(req, res) => {
  res.render("patientForm.ejs");
})

app.post("/patientHome", async (req, res) => {
  const userData = req.body;
  userData.username = `${userData.contactNumber}@abc`;
  console.log(userData.username);
  
  try {
    const existingUser = await findPatientByEmail(userData.contactNumber);
    if (existingUser) {
      res.send("Email already exists. Try logging in.");
      return;
    } else {
      //Hashing
      bcrypt.hash(userData.password, saltRounds, async(err, hash) => {
        if (err) {
          console.log(err);
        } else {
        userData.password = hash;  
        createUser(userData,[]);
        // update createUser
        res.render("patientHome.ejs");
        }
      })
    }
  } catch (err) {
    console.log(err);
  }
  res.redirect(`/welcomeUser?username=${userData.username}&fullName=${userData.fullName}&address=${userData.address}&dob=${userData.dateOfBirth}&gender=${userData.gender}&weight=${userData.weight}&height=${userData.height}`);
});

app.get("/patientLogin", async(req, res) => {
  res.render("patientLogin.ejs");
})

app.post("/patientLogin", async(req, res) => {
  res.render("patientLogin.ejs");
})

app.post("/patientHomeLog", async (req, res) => {
  const userData = req.body;
  try {
    const existingUser = await findPatientByEmail(userData.username);
    if (existingUser) {
      const storedHashedPassword = existingUser.password;
      bcrypt.compare(userData.password,storedHashedPassword,(err, result) => {
        if (err) {
          console.log(err);
        } else {
          console.log(result);
          if(result) {
            res.render("patientHome.ejs");
          } else {
            res.send("Incorrect Password");
          }
        }
      })
    } else {
      res.send("User not found");
    }
  } catch (err) {
    console.log(err);
  }
});

app.get('/welcomeUser', (req, res) => {
  const { username, fullName, address, dob, gender, weight, height } = req.query;
  res.render('welcomeUser', { username, fullName, address, dob, gender, weight, height });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
