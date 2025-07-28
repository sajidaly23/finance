import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";

const DbURI = process.env.MONGODB_URI as string;

export const connectDB = async () => {
  try {
    await mongoose.connect("mongodb+srv://raeessajidali10:raees111@cluster0.eqsrxxa.mongodb.net/BACKEND-02");
    console.log("Connected to database");
  } catch (error) {
    console.log("Error connecting to database", error);
  }
};
