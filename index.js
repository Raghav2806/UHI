import express from "express";
import session from "express-session";
import bodyParser from "body-parser";
import bcrypt from "bcrypt";
import { createUser, getIsoDate, getPrescriptionNumber, updatePresUser } from "./repositries/userRepository.js";
import { updatePresDoc } from "./repositries/docRepository.js";
import { addMeds} from "./repositries/medRepository.js";
import { createPrescription } from "./repositries/presRepository.js";
import { findDoctorByEmail, docDom, domMed} from "./services/doctorServices.js";
import { findPatientByContactNumber, findPatientByUsername } from "./services/patientServices.js";
import { connectDB } from "./config/db.js";
import { getDocUser, getDomainDoctorMap, getPrescriptionData } from "./services/jungle.js";
import * as dotenv from "dotenv";
dotenv.config();

connectDB();
const app = express();
app.set("view engine", "ejs");
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(session({
  secret: 'iLoveLily', // replace with a strong secret key
  resave: false,
  saveUninitialized: true,
  cookie: {secure: false},// set secure to true if using HTTPS.
}));
let sharedConstMeds;
let sharedConstUser;

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
        sharedConstMeds=docMeds;
        req.session.username=username;
        res.render("doctorForm.ejs", {
          input1: docMeds,
          username: username,
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
  const medData = req.body;
  const userData = await findPatientByUsername(medData.patientID);
  const doctorUsername = req.session.username
  const doctorData = await findDoctorByEmail(doctorUsername);
  medData.currentDate=getIsoDate();
  medData.prescriptionNumber=getPrescriptionNumber(doctorUsername);
  const medicines=req.body.medicines;
  const customMeds=req.body.customMedicines;
  if (customMeds) {
    customMeds.pop();
    createPrescription(medData, customMeds, doctorUsername, doctorData.domain);
    addMeds(medData.otherDisease,customMeds,doctorData.domain);
  } else {
    createPrescription(medData, medicines, doctorUsername, doctorData.domain);
  }
  updatePresUser(medData.patientID, medData.prescriptionNumber);
  updatePresDoc(doctorUsername, medData.prescriptionNumber);
  res.render("prescription.ejs", {
    input: medData,
    doctor: doctorData,
    user: userData,
    medicines: medicines,
    customMedicines: customMeds,
  });
})

app.get("/doctorForm", async(req, res) => {
  res.render("doctorForm.ejs", {
    input1: sharedConstMeds,
  });
})

app.post("/", async(req, res) => {
  res.redirect("/doctorForm");
})

app.post('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.status(500).send('Could not log out');
    }
    res.redirect("/");
  });
});

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
    const existingUser = await findPatientByUsername(userData.username);
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
        createUser(userData);
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
    const existingUser = await findPatientByUsername(userData.username);
    sharedConstUser=userData.username;
    if (existingUser) {
      const storedHashedPassword = existingUser.password;
      const result = await bcrypt.compare(userData.password, storedHashedPassword);
      
      if (result) {
        const reqDoc=await getDomainDoctorMap(userData.username);
        res.render("patientHome.ejs",{
          input2:reqDoc,
        });
      } else {
        res.send("Incorrect Password");
      }
    } else {
      res.send("User not found");
    }
  } catch (err) {
    console.log(err);
    res.status(500).send("An error occurred");
  }
});

app.post('/get-third-dropdown-options', async(req, res) => {
    const { firstValue, secondValue } = req.body;
    const modSecondValue=secondValue.substring(0,6);
    const reqArray=await getDocUser(sharedConstUser, modSecondValue);
    console.log(reqArray);
    
    // This is where you would typically fetch data from a database
    // For this example, we'll just return some dummy data
    const dummyOptions = reqArray;
    
    // You could use the firstValue and secondValue to determine what options to return
    console.log(`Received: firstValue=${firstValue}, secondValue=${secondValue}`);
    
    // Simulate a delay to mimic a database query
    setTimeout(() => {
      res.json(dummyOptions);
  }, 500);
});

app.get('/prescription/:prescriptionNumber', async(req, res) => {
  const prescriptionNumber = req.params.prescriptionNumber;
  const prescriptionData = await getPrescriptionData(prescriptionNumber);
  console.log(prescriptionData);
  const userData = await findPatientByUsername(prescriptionData.patientID);
  const doctorID = prescriptionData.doctorID;
  const doctorData = await findDoctorByEmail(doctorID);
  const medicines = prescriptionData.diagnosedMeds;
  const otherData = req.body;
  
  otherData.currentDate = prescriptionData.diagnosedDate 
    ? prescriptionData.diagnosedDate.toISOString() 
    : 'Date not available';

  console.log(typeof(otherData.currentDate));
  otherData.prescriptionNumber = prescriptionNumber;
  otherData.disease = prescriptionData.diagnosedDisease;
  otherData.notes = prescriptionData.additionalNotes;
  
  res.render('prescription.ejs', {
     input: otherData,
     doctor: doctorData,
     user: userData, 
     medicines: medicines,
  });
});

app.get('/welcomeUser', (req, res) => {
  const { username, fullName, address, dob, gender, weight, height } = req.query;
  res.render('welcomeUser', { username, fullName, address, dob, gender, weight, height });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
