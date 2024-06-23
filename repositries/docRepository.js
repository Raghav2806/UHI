import Doctor from "../models/docterModel.js";

export async function updatePresDoc(username, prescriptionNumber) {
    try {
        const updatedPatient = await Doctor.findOneAndUpdate(
            { username: username },
            { $push: { prescriptions: prescriptionNumber } },
            { new: true }
        );
        
        if (!updatedPatient) {
            throw new Error('User not found');
        }
        
        return updatedPatient;
    } catch (error) {
        console.error('Error updating patient prescription:', error);
        throw error;
    }
}