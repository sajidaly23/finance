import { Request, Response } from "express";
import xlsx from "xlsx";
import nodemailer from "nodemailer"
import salaryModel from "../models/salaryModel.js";
import salaryFileModel from "../models/salaryFileModel.js";
export interface ISalary extends Document {   //interface is tyoeof typexcript extetends is mongoosdbrecord
  employeeId?: string; 
  email: string;
  salaryMonth: string;
  salaryAmount: number;
  dateReceived: Date;
  description: string;
  advances: string;
  netSalary: number;
  status: string;
}

export const uploadSalaryExcel = async (req: Request, res: Response) => {
  try {
    const file = req.file;

    if (!file) {
      return res.status(400).json({
        message: "No file uploaded"
      });
    }

    // Save uploaded file details
    await salaryFileModel.create({
      originalName: file.originalname,
      url: `${req.protocol}://${req.get("host")}/uploads/salary/${file.filename}`,
      uploadedBy: req.body.uploadedBy || null,
    });

    // Read Excel and parse data
    const workbook = xlsx.readFile(file.path);    //read exalfile and convert this workbook
    console.log("Workbook loaded:");

    const sheet = workbook.Sheets[workbook.SheetNames[0]];  //choce the first file name
    console.log("Selected sheet object:");

    const rows = xlsx.utils.sheet_to_json(sheet, { defval: "" });   //convert sheet in to json object and save data and use this data
    console.log("Parsed rows from Excel:");                            //defval use no velue cal


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
      return res.status(404).json({
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

// put method getSalaryById
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
      message: "salary successfully update"
    })
  } catch (error) {
    console.log("server error")
  }

};

//deletesalarybyid
export const deleteSalaryById = async (req: Request, res: Response) => {
  try {
    const salaryId = req.params.id;
    const result = await salaryModel.findByIdAndDelete(salaryId);

    if (!result) {
      return res.status(404).json({
        message: "Salary record not found"
      });
    }

    return res.status(200).json({
      message: "Salary deleted successfully"
    });
  } catch (error) {
    console.error("Server error:", error);
    return res.status(500).json({
      message: "Internal server error"
    });
  }
};

// // sand salaries emial to all employee

export const sendSalariesToAll = async (req: Request, res: Response) => {
  try {
    // No need to populate employeeId since email is in salary directly
    const salaries = await salaryModel.find();
    console.log(salaries);

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "gulbazkachoo3032@gmail.com",  // Your email
        pass: "adxb pqzw xqvo avhz",          // App password (not regular password)
      },
    });

    for (const salary of salaries) {
      const email = salary.email; //  Direct access from salary doc

      if (!email) {
        console.warn(`Skipping email for salary ID: ${salary._id} - no email found`);
        continue;
      }

      const subject = `Salary Slip - ${salary.salaryMonth}`;
      const message = `Dear employee,\n\nYour salary for ${salary.salaryMonth} that is ${salary.salaryAmount} has been processed.\n\nRegards,\nHR`;

      await transporter.sendMail({
        from: '"HR Team" <gulbazkachoo3032@gmail.com>', //  Same as your Gmail
        to: email,
        subject,
        text: message,
      });
    }

    res.status(200).json({ message: "Emails sent successfully." });
  } catch (err) {
    console.error("Email Error:", err);
    res.status(500).json({ message: "Failed to send emails." });
  }
};