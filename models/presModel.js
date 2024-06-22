import mongoose, { mongo } from "mongoose";

const prescriptionSchema= new mongoose.Schema({
    prescriptionNumber: String,
    patientID:String,
    doctorID:String,
    diagnosedDisease: String,
    diagnosedMeds:[String],
    additionalNotes:String,
})
const Prescription=mongoose.model("prescriptions", prescriptionSchema)
export default Prescription