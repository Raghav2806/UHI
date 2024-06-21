import Doctor from "../models/docterModel.js";

export async function findUserByEmail (email) {
    return await Doctor.findOne({username: email});
};