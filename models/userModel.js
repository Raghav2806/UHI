import mongoose from "mongoose";

const userSchema=new mongoose.Schema({
    firstName:String,
    lastName: String,
    addressL1: String,
    addressL2: String,
    city: String,
    contactNumber: Number,
    age: Number,
    gender: String,
    weight: Number,
    currentDate:String,
    prescriptionNumber:String,
})

const User=mongoose.model("users", userSchema)
export default User