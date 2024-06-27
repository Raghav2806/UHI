import mongoose from "mongoose";

const labSchema=new mongoose.Schema({
    username:String,
    password:String,
});

const labModel = mongoose.model("labs", labSchema);

export default labModel;