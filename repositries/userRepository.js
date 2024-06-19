import User from '../models/userModel.js'

export async function createUser (userData, userData1) {
    const user=await User.create({
        fullName:userData["fullName"],
        address:userData["address"], 
        contactNumber:userData["contactNumber"], 
        age:userData["age"], gender:userData["gender"], 
        weight:userData["weight"],
        currentDate:userData["currentDate"],
        prescriptionNumber:userData["prescriptionNumber"],
        diagnosedDisease:userData["disease"],
        diagnosedMeds:userData1,
    });
    console.log(user);
}

export function getIsoDate () {
    const date1=new Date();
    const date2=date1.toISOString();
    return date2;
}

export function getPrescriptionNumber () {
    const reqDate= getIsoDate();
    const month=reqDate.slice(5,7);
    const day=reqDate.slice(8,10);
    const hour=reqDate.slice(11,13);
    const minute=reqDate.slice(14,16)
    const prescriptionNumber=month+day+hour+minute;
    return prescriptionNumber;
}
