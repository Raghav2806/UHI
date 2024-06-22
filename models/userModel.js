import mongoose from "mongoose";

const userSchema=new mongoose.Schema({
    username:String, 
    password:String,
    fullName:String,
    address: String,
    contactNumber: Number,
    dateOfBirth: {
        type: Date, 
        required: true,
        trim: true,
    }, 
    gender: String,
    weight: Number, 
    prescriptions:[String], 
})

const User=mongoose.model("users", userSchema)
export default User