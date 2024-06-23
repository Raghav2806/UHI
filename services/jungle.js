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
            `${doctor.username}-${doctor.docName}`
        );

        // Add the domain-doctor pair to the map
        domainDoctorMap[domain] = uniqueDoctors;
    }

    return domainDoctorMap;
}

export async function getDocUser(username, doctorID) {
    try {
        // Find the user by username
        const user = await User.findOne({ username });

        if (!user) {
            throw new Error('User not found');
        }

        // Get the first 6 characters of the doctorID
        const doctorPrefix = doctorID.substring(0, 6);

        // Filter the prescriptionsNumbers array
        const matchingPrescriptions = user.prescriptionsNumbers.filter(prescriptionNumber => 
            prescriptionNumber.substring(0, 6) === doctorPrefix
        );

        return matchingPrescriptions;

    } catch (error) {
        console.error('Error in getDocUser:', error);
        throw error;
    }
}

export async function getPrescriptionData(prescriptionNumber) {
    return await Prescription.findOne({prescriptionNumber: prescriptionNumber});
}