import Med from '../models/medModel.js';

// export async function readAllMed() {
//     try {
//         const allMeds = await Med.find({}, 'primaryComplaint medicines');
//         const allMedNames = allMeds.reduce((acc, med) => {
//             const complaint = med.primaryComplaint;
//             const medicines = Array.isArray(med.medicines) ? med.medicines : [];
//             if (acc[complaint]) {
//                 acc[complaint] = [...acc[complaint], ...medicines];
//             } else {
//                 acc[complaint] = [...medicines];
//             }
//             return acc;
//         }, {});
//         return allMedNames;
//     } catch (err) {
//         console.error('Error fetching all med data:', err);
//     }
// }

export async function addMeds (disease,customMeds) {
        const meds = await Med.create({
            primaryComplaint: disease,
            medicines: customMeds,
        })
        console.log(meds);
}
