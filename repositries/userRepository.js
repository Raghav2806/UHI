import User from '../models/userModel.js'

export async function createUser (userData) {
    const user=await User.create({
        firstName:userData["firstName"],
        lastName:userData["lastName"], 
        addressL1:userData["addressOne"], 
        addressL2:userData["addressTwo"], 
        city:userData["city"], 
        contactNumber:userData["contactNumber"], 
        age:userData["age"], gender:userData["gender"], 
        weight:userData["weight"],
        currentDate:userData["currentDate"],
        prescriptionNumber:userData["prescriptionNumber"]
    });
    console.log(user);
}
