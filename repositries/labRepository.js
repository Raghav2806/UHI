import labModel from "../models/labModel.js";

export async function findLabByEmail (email) {
    return await labModel.findOne({username: email});
};