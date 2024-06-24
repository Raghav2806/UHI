import Prescription from "../models/presModel.js";

export async function createPrescription (data, meds, docID, domain) {
    if(data.disease === "Other") {
        const prescription=await Prescription.create({
            prescriptionNumber:data["prescriptionNumber"],
            patientID:data["patientID"],
            doctorID:docID,
            diagnosedDomain:domain,
            diagnosedDisease:data["otherDisease"],
            diagnosedMeds:meds,
            additionalNotes:data["notes"],
            prescriptionDate:data["currentDate"],
            age:data["age"],
        });
    } else {
    const prescription=await Prescription.create({
        prescriptionNumber:data["prescriptionNumber"],
        patientID:data["patientID"],
        doctorID:docID,
        diagnosedDomain:domain,
        diagnosedDisease:data["disease"],
        diagnosedMeds:meds,
        additionalNotes:data["notes"],
        prescriptionDate:data["currentDate"],
        age:data["age"],
    });
}
}