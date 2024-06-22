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
        const domainMeds = await Med.find({ domain: doctorDomain }, 'primaryComplaint medicines');

        const medicinesByComplaint = domainMeds.reduce((acc, med) => {
            const complaint = med.primaryComplaint;
            const medicines = Array.isArray(med.medicines) ? med.medicines : [];
            
            if (acc[complaint]) {
                acc[complaint] = [...new Set([...acc[complaint], ...medicines])];
            } else {
                acc[complaint] = [...new Set(medicines)];
            }
            
            return acc;
        }, {});

        return medicinesByComplaint;
    } catch (err) {
        console.error(`Error fetching medicines for domain ${doctorDomain}:`, err);
        throw err;
    }
}