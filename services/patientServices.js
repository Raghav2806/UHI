import User from "../models/userModel.js";

export async function findPatientByContactNumber (contactNumber) {
    return await User.findOne({contactNumber: contactNumber});
};

export async function findPatientByUsername (username) {
    return await User.findOne({username: username});
};