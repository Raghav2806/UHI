import Doctor from "../models/docterModel";

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