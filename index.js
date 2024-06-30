import express from "express";
import { MongoClient, GridFSBucket, ObjectId } from "mongodb";
import multer from "multer";
import stream from 'stream';
import session from "express-session";
import bodyParser from "body-parser";
import bcrypt from "bcrypt";
import { createUser, getIsoDate, getPrescriptionNumber, updatePresUser } from "./repositries/userRepository.js";
import { updatePresDoc } from "./repositries/docRepository.js";
import { addMeds} from "./repositries/medRepository.js";
import { createPrescription } from "./repositries/presRepository.js";
import { findDoctorByEmail, docDom, domMed} from "./services/doctorServices.js";
import { findPatientByContactNumber, findPatientByUsername, getAge } from "./services/patientServices.js";
import { findLabByEmail } from "./repositries/labRepository.js";
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
const port = process.env.PORT || 3000;
const mongoURL = process.env.URL || 'mongodb://localhost:27017/your_database';
let client, db, bucket;

const connectToMongo = async () => {
  try {
    client = await MongoClient.connect(mongoURL);
    console.log('Connected to MongoDB');
    db = client.db();
    bucket = new GridFSBucket(db, { bucketName: 'pdfs' });
  } catch (err) {
    console.error('Error connecting to MongoDB:', err);
  }
};

const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'), false);
    }
  }
}).single('pdf');

app.post('/upload', (req, res) => {
  upload(req, res, async (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ error: `Multer error: ${err.message}` });
    } else if (err) {
      return res.status(400).json({ error: err.message });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded.' });
    }

    const username = req.body.username;
    if (!username) {
      return res.status(400).json({ error: 'Username is required.' });
    }

    try {
      const readableStream = new stream.PassThrough();
      readableStream.end(req.file.buffer);

      const uploadStream = bucket.openUploadStream(req.file.originalname, {
        contentType: req.file.mimetype,
        metadata: { username: username }  // Add username as metadata
      });

      await new Promise((resolve, reject) => {
        readableStream.pipe(uploadStream)
          .on('finish', resolve)
          .on('error', reject);
      });

      res.status(200).json({ message: 'File uploaded successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Error uploading file' });
    }
  });
});

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
  const prescriptionData = req.body;
  const userData = await findPatientByUsername(prescriptionData.patientID);
  const doctorUsername = req.session.username
  const doctorData = await findDoctorByEmail(doctorUsername);
  prescriptionData.currentDate=getIsoDate();
  prescriptionData.prescriptionNumber=getPrescriptionNumber(doctorUsername);
  userData.age = getAge(userData.dateOfBirth);
  prescriptionData.age = userData.age;
  const medicines=req.body.medicines;
  const customMeds=req.body.customMedicines;
  if (customMeds) {
    customMeds.pop();
    createPrescription(prescriptionData, customMeds, doctorUsername, doctorData.domain);
    addMeds(prescriptionData.otherDisease,customMeds,doctorData.domain);
  } else {
    createPrescription(prescriptionData, medicines, doctorUsername, doctorData.domain);
  }
  updatePresUser(prescriptionData.patientID, prescriptionData.prescriptionNumber);
  updatePresDoc(doctorUsername, prescriptionData.prescriptionNumber);
  res.render("prescription.ejs", {
    input: prescriptionData,
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
  res.render("patientFormOne.ejs");
})

app.post("/patientFormTwo", async(req, res) => {
  const userData = req.body;
  try {
    const existingUser = await findPatientByContactNumber(userData.contactNumber);
    if(existingUser) {
      res.send("Account with this contact number already exists. Try logging in.");
      return;
    } else {
      res.render("patientFormTwo.ejs",{
        contactNumber: userData.contactNumber,
      });
    }
  } catch (err) {
    console.log(err);
  }
})

app.post("/patientHome", async (req, res) => {
  const userData = req.body;
  userData.username = `${userData.contactNumber}@abc`;
  try {
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
        req.session.username=userData.username;
        res.render("patientHomeLog.ejs",);
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

app.get("/patientPrescriptions", async(req, res) => {
  const username = req.session.username;
  const reqDoc=await getDomainDoctorMap(username);
  res.render("patientHome.ejs",{
    input2:reqDoc,
  });
})

app.get("/patientLab", async(req, res)=>{
  res.render("patientLab.ejs");
})

app.post('/get-third-dropdown-options', async(req, res) => {
    const { firstValue, secondValue } = req.body;
    const modSecondValue=secondValue.substring(0,6);
    const reqArray=await getDocUser(sharedConstUser, modSecondValue);
    console.log(reqArray);
    const dummyOptions = reqArray;
    
    setTimeout(() => {
      res.json(dummyOptions);
  }, 500);
});

app.get('/prescription/:prescriptionNumber', async(req, res) => {
  const prescriptionNumber = req.params.prescriptionNumber;
  const prescriptionData = await getPrescriptionData(prescriptionNumber);
  const userData = await findPatientByUsername(prescriptionData.patientID);
  userData.age = prescriptionData.age;
  const doctorID = prescriptionData.doctorID;
  const doctorData = await findDoctorByEmail(doctorID);
  const medicines = prescriptionData.diagnosedMeds;
  const otherData = req.body;
  
  otherData.currentDate = prescriptionData.diagnosedDate 
    ? prescriptionData.diagnosedDate.toISOString() 
    : 'Date not available';

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

app.post("/lab", async (req, res) => {
  res.render("labLogin.ejs");
});

app.post("/labHome", async (req, res) => {
  const username = req.body.username;
  const loginPassword = req.body.password;
  try {
    const existingUser = await findLabByEmail(username);
    if (existingUser) {
      const storedPassword = existingUser.password;
      if(loginPassword == storedPassword) {
        req.session.username=username;
        res.render("labHome.ejs", {
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

app.get('/pdfs', async (req, res) => {
  const username=sharedConstUser;
  try {
    // Use the find method with a filter
    const files = await bucket.find({ 'metadata.username': username }).toArray();
    
    if (files.length === 0) {
      return res.status(404).json({ message: 'No PDFs found for this user' });
    }

    res.json(files.map(file => ({
      id: file._id,
      filename: file.filename,
      uploadDate: file.uploadDate,
      username: file.metadata.username
    })));
  } catch (error) {
    console.error('Error retrieving PDF list:', error);
    res.status(500).json({ error: 'Error retrieving PDF list' });
  }
});

app.get('/pdf/:id', async (req, res) => {
  try {
    const id = new ObjectId(req.params.id);
    const [file] = await bucket.find({ _id: id }).toArray();
    
    if (!file) {
      return res.status(404).json({ error: 'PDF not found' });
    }

    res.set('Content-Type', 'application/pdf');
    res.set('Content-Disposition', `inline; filename="${file.filename}"`);

    bucket.openDownloadStream(id).pipe(res);
  } catch (error) {
    res.status(500).json({ error: 'Error retrieving PDF' });
  }
});

const startServer = async () => {
  await connectToMongo();
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
};

startServer().catch(console.error);