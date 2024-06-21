import mongoose from "mongoose";

const userSchema=new mongoose.Schema({
    username:String,
    password:String,
    fullName:String,
    address: String,
    contactNumber: Number,
    age: Number,
    gender: String,
    weight: Number,
    currentDate:String,
    prescriptionNumber:String,
    diagnosedDisease:String,
    diagnosedMeds:[String],
})

const User=mongoose.model("users", userSchema)
export default User