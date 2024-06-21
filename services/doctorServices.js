import Doctor from "../models/docterModel.js";

export async function findDoctorByEmail (email) {
    return await Doctor.findOne({username: email});
};