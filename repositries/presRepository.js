import Prescription from "../models/presModel";

export async function createPrescription (data, meds) {
    if(data.disease === "Other") {
        const prescription=await Prescription.create({
            prescriptionNumber:data["prescriptionNumber"],
            diagnosedDisease:data["otherDisease"],
            diagnosedMeds:meds,
            additionalNotes:data["additionalNotes"],
        });
        console.log(prescription);
    } else {
    const prescription=await Prescription.create({
        prescriptionNumber:data["prescriptionNumber"],
        diagnosedDisease:data["otherDisease"],
        diagnosedMeds:meds,
        additionalNotes:data["additionalNotes"],
    });
    console.log(prescription);
}
}