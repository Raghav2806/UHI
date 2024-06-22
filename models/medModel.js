import mongoose from "mongoose";

const medSchema = new mongoose.Schema({
    domain:String,
    primaryComplaint: String,
    medicines: [String],
});

const Med = mongoose.model("meds", medSchema);
export default Med