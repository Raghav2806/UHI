import User from '../models/userModel.js'

export async function createUser (userData, meds) {
    if(userData.disease === "Other") {
        const user=await User.create({
            username:userData["username"],
            password:userData["password"],
            fullName:userData["fullName"],
            address:userData["address"], 
            contactNumber:userData["contactNumber"], 
            age:userData["age"], gender:userData["gender"], 
            weight:userData["weight"],
            currentDate:userData["currentDate"],
            prescriptionNumber:userData["prescriptionNumber"],
            diagnosedDisease:userData["otherDisease"],
            diagnosedMeds:meds,
        });
        console.log(user);
    } else {
    const user=await User.create({
        username:userData["username"],
        password:userData["password"],
        fullName:userData["fullName"],
        address:userData["address"], 
        contactNumber:userData["contactNumber"], 
        age:userData["age"], gender:userData["gender"], 
        weight:userData["weight"],
        currentDate:userData["currentDate"],
        prescriptionNumber:userData["prescriptionNumber"],
        diagnosedDisease:userData["disease"],
        diagnosedMeds:meds,
    });
    console.log(user);
}
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
