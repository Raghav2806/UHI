import User from '../models/userModel.js'

export async function createUser (userData) {
    if(userData.disease === "Other") {
        const user=await User.create({
            username:userData["username"],
            password:userData["password"],
            fullName:userData["fullName"],
            address:userData["address"], 
            contactNumber:userData["contactNumber"], 
            dateOfBirth:userData["dateOfBirth"],
            gender:userData["gender"], 
            weight:userData["weight"],
            height:userData["height"],
            registrationDate:userData["currentDate"],
            prescriptionNumbers:[],
        });
        console.log(user);
    } else {
    const user=await User.create({
        username:userData["username"],
        password:userData["password"],
        fullName:userData["fullName"],
        address:userData["address"], 
        contactNumber:userData["contactNumber"], 
        dateOfBirth:userData["dateOfBirth"],
        gender:userData["gender"], 
        weight:userData["weight"],
        height:userData["height"],
        registrationDate:userData["currentDate"],
        prescriptionNumbers:[],
    });
    console.log(user);
}
}

export function getIsoDate () {
    const date1=new Date();
    const date2=date1.toISOString();
    return date2;
}

export function getPrescriptionNumber (username) {
    const reqDate= getIsoDate();
    const month=reqDate.slice(5,7);
    const day=reqDate.slice(8,10);
    const hour=reqDate.slice(11,13);
    const minute=reqDate.slice(14,16)
    const prescriptionNumber=username+month+day+hour+minute;
    return prescriptionNumber;
}

export async function updatePresUser(patient, prescriptionNumber) {
    try {
        const updatedPatient = await User.findByIdAndUpdate(
            patient._id,
            { $push: { prescriptionNumbers: prescriptionNumber } },
            { new: true }
        );
        return updatedPatient;
    } catch (error) {
        console.error('Error updating patient prescription:', error);
        throw error;
    }
}