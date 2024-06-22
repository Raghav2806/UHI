import Doctor from "../models/docterModel.js";
import Med from "../models/medModel.js";

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

export async function domMed(doctorDomain) {
    try {
        // Find medications related to the doctor's domain
        const domainMeds = await Med.find({ domain: doctorDomain }, 'medicines');

        // Extract and flatten the medicines array
        const medicinesList = domainMeds.reduce((acc, med) => {
            const medicines = Array.isArray(med.medicines) ? med.medicines : [];
            return [...acc, ...medicines];
        }, []);

        // Remove duplicates
        const uniqueMedicines = [...new Set(medicinesList)];

        return uniqueMedicines;
    } catch (err) {
        console.error(`Error fetching medicines for domain ${doctorDomain}:`, err);
        throw err;
    }
}