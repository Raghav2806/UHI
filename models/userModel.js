import mongoose from "mongoose";

const userSchema=new mongoose.Schema({
    username:String, 
    password:String,
    fullName:String,
    address: String,
    contactNumber: String,
    dateOfBirth: {
        type: Date, 
        required: true,
        trim: true,
    }, 
    age: Number,
    gender: String,
    height: Number,
    weight: Number, 
    prescriptionsNumbers:[String], 
    registrationDate:Date,
})

const User=mongoose.model("users", userSchema)
export default User