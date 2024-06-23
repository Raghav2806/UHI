import User from "../models/userModel.js";
import Prescription from "../models/presModel.js";

export async function getDomains(username) {
    const user = await User.findOne({ username: username });
    console.log(user);
    const domains = [];
    if (user && user.prescriptionsNumbers) {
        for (const prescriptionNumber of user.prescriptionsNumbers) {
            const prescription = await Prescription.findOne({ prescriptionNumber: prescriptionNumber });
            if (prescription && prescription.diagnosedDomain) {
                domains.push(prescription.diagnosedDomain);
            }
        }
    }
    return domains;
};

export function getUniqueDomains(array){
    return [...new Set(array)];
}