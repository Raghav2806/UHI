import Prescription from "../models/presModel.js";

export async function createPrescription (data, meds) {
    if(data.disease === "Other") {
        const prescription=await Prescription.create({
            prescriptionNumber:data["prescriptionNumber"],
            patientID:data["patientID"],
            diagnosedDisease:data["otherDisease"],
            diagnosedMeds:meds,
            additionalNotes:data["notes"],
        });
    } else {
    const prescription=await Prescription.create({
        prescriptionNumber:data["prescriptionNumber"],
        patientID:data["patientID"],
        diagnosedDisease:data["disease"],
        diagnosedMeds:meds,
        additionalNotes:data["notes"],
    });
}
}