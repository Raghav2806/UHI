import User from "../models/userModel.js";
import Prescription from "../models/presModel.js";
import Doctor from "../models/docterModel.js";

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

export async function getDoctorsByDomain(username, domain) {
    const user = await User.findOne({ username: username });
    const doctors = new Set();

    if (user && user.prescriptionsNumbers) {
        for (const prescriptionNumber of user.prescriptionsNumbers) {
            const prescription = await Prescription.findOne({ 
                prescriptionNumber: prescriptionNumber,
                diagnosedDomain: domain
            });

            if (prescription && prescription.doctorID) {
                const doctor = await Doctor.findOne({ 
                    username: prescription.doctorID,
                    domain: domain
                });
                if (doctor) {
                    doctors.add(doctor);
                }
            }
        }
    }

    return Array.from(doctors);
}

export function uniqy(array, key) {
    if (!key) {
        // For primitive values
        return [...new Set(array)];
    }

    // For objects
    const seen = new Set();
    return array.filter(item => {
        const k = item[key];
        return seen.has(k) ? false : seen.add(k);
    });
}
//
export async function getDomainDoctorMap(username) {
    // Get unique diagnosis domains for the user
    const diagnosisDomains = await getDomains(username);
    const uniqueDiagnosisDomains = uniqy(diagnosisDomains);

    // Create an object to store domain-doctor pairs
    const domainDoctorMap = {};

    // Iterate through each unique domain
    for (const domain of uniqueDiagnosisDomains) {
        // Get doctors for this domain
        const doctors = await getDoctorsByDomain(username, domain);
        
        // Get unique doctors by username and create concatenated strings
        const uniqueDoctors = uniqy(doctors, "username").map(doctor => 
            `${doctor.username}${doctor.docName}`
        );

        // Add the domain-doctor pair to the map
        domainDoctorMap[domain] = uniqueDoctors;
    }

    return domainDoctorMap;
}
//