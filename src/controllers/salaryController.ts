import { Request, Response } from "express";
import xlsx from "xlsx";
import salaryModel from "../models/salaryModel.js";
import salaryFileModel from "../models/salaryFileModel.js";

export const uploadSalaryExcel = async (req: Request, res: Response) => {
  try {
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Save uploaded file details
    await salaryFileModel.create({
      originalName: file.originalname,
      url: `${req.protocol}://${req.get("host")}/uploads/salary/${file.filename}`,
      uploadedBy: req.body.uploadedBy || null,
    });

    // Read Excel and parse data
    const workbook = xlsx.readFile(file.path);
    console.log("Workbook loaded:");

    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    console.log("Selected sheet object:");

    const rows = xlsx.utils.sheet_to_json(sheet, { defval: "" });
    console.log("Parsed rows from Excel:");


    // Insert all rows directly into salaryModel
    await salaryModel.insertMany(rows);

    return res.status(200).json({
      message: "Salary data uploaded and saved successfully",
      count: rows.length,
    });
  } catch (error) {
    console.error("Error uploading salary Excel:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getAllEmpSalaries = async (req: Request, res: Response) => {
  console.log("inside salary model")
  try {
    const result = await salaryModel.find();
    if (!result) {
      return res.status(200).json({
        message: "No reslt found"
      })
    }
    return res.status(200).json({
      message: "Data retrieved",
      result
    })
  } catch (error) {
    console.log("Inetrnal server error", error)
  }

};

// put method
export const getSalaryById = async (req: Request, res: Response) => {
  try {
    const salaryId = req.params.id;
    const result = await salaryModel.findById(salaryId);
    if (!result) {
      return res.status(404).json({
        message: "Not found"
      })
    }
    return res.status(200).json({
      success: true,
      result
    })


  } catch (error) {
    console.log("server error")
  }
}
//update salary by id
export const updateSalaryById = async (req: Request, res: Response) => {
  try {
    const salaryId = req.params.id;
    const result = await salaryModel.findByIdAndUpdate(salaryId);
    if (!result) {
      return res.status(400).json({
        message: "salary record not found"
      })
    }
    return res.status(200).json({
      message: "update"
    })
  } catch(error){
    console.log("server error")
  }
  
}