import Doctor from "../models/docterModel.js";

export async function getDoctorDetails(userId) {
    try {
        const doctor = await Doctor.findById(userId);
        if (!doctor) {
            throw new Error('Doctor not found');
        }
        return doctor;
    } catch (error) {
        console.error('Error fetching user details:', error);
        throw error;
    }
}