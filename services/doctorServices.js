import Doctor from "../models/docterModel.js";

export async function findDoctorByEmail (email) {
    return await Doctor.findOne({username: email});
};

export async function docDom(username) {
    try {
        const doctor = await Doctor.findOne({ username }, 'domain');
        
        if (!doctor) {
            throw new Error('Doctor not found');
        }
        
        return doctor.domain;
    } catch (err) {
        console.error(`Error fetching domain for doctor ${username}:`, err);
        throw err;
    }
}