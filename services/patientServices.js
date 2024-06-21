import User from "../models/userModel.js";

export async function findPatientByEmail (email) {
    return await User.findOne({username: email});
};