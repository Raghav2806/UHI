import mongoose from "mongoose";

const userSchema=new mongoose.Schema({
    fullName:String,
    address: String,
    contactNumber: Number,
    age: Number,
    gender: String,
    weight: Number,
    currentDate:String,
    prescriptionNumber:String,
})

const User=mongoose.model("users", userSchema)
export default User