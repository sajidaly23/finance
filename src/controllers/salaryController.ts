import { Request, Response } from "express";
import xlsx from "xlsx";
import nodemailer from "nodemailer"
// import {sendSalaryEmail} "../utils/sandEmail.js"
import salaryModel from "../models/salaryModel.js";
import salaryFileModel from "../models/salaryFileModel.js";
export interface ISalary extends Document {   //interface is type of typexcript extetends is mongoosdbrecord
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

export const uploadAndSendSalaries = async (req: Request, res: Response) => {
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
    const workbook = xlsx.readFile(file.path);
    console.log("Workbook loaded");

    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    console.log("Selected sheet object");

    const rows = xlsx.utils.sheet_to_json(sheet, { defval: "" });
    console.log("Parsed rows from Excel");

    // Insert rows into DB
    const insertedSalaries = await salaryModel.insertMany(rows);

    // Setup email transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Send email for each salary record
    for (const salary of insertedSalaries) {
      const email = salary.email;
      const subject = `Salary Slip - ${salary.salaryMonth}`;

      if (email) {
        await transporter.sendMail({
          from: `"HR Team" <${process.env.EMAIL_USER}>`,
          to: email,
          subject,
          text: `Dear Employee,\n\nPlease find your salary slip for ${salary.salaryMonth}.\n\nRegards,\nHR Team`,
        });
      }
    }

    return res.status(200).json({
      message: "Salary data uploaded and emails sent successfully",
      count: rows.length,
    });

  } catch (error: any) {
    console.log("Error uploading salary and sending emails:", error);
    return res.status(500).json({
      message: "Failed to upload and send emails",
      success: false,
      error: error.message
    });
  }
};

  
  export const getAllEmpSalaries = async (req: Request, res: Response) => {
    console.log("inside salary model");
    try {
      // Extract query params for filtering
      const { email, salaryMonth, page = "1", limit = "10" } = req.query;

      // Build filter object dynamically
      const filter: any = {};
      if (email) filter.email = { $regex: new RegExp(email as string, "i") }; // case-insensitive search
      if (salaryMonth) filter.salaryMonth = salaryMonth;

      // Convert pagination params
      const pageNum = parseInt(page as string, 10);
      const limitNum = parseInt(limit as string, 10);
      const skip = (pageNum - 1) * limitNum;

      // Get filtered and paginated salaries
      const result = await salaryModel.find(filter).skip(skip).limit(limitNum);

      // Total count for frontend pagination
      const totalCount = await salaryModel.countDocuments(filter);

      if (!result || result.length === 0) {
        return res.status(404).json({
          message: "No result found"
        });
      }

      return res.status(200).json({
        message: "Data retrieved",
        totalCount,
        currentPage: pageNum,
        totalPages: Math.ceil(totalCount / limitNum),
        result
      });


      //hello

    } catch (error) {
      console.error("Internal server error:", error);
      return res.status(500).json({
        message: "Internal Server Error",
        success: false,
        error: error instanceof Error ? error.message : "Unknown error"
      });
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
      console.error("Internal server error:", error);
      return res.status(500).json({
        message: "Internal Server Error",
        success: false,
      });
    }
  }
  //update salary by id
  export const updateSalaryById = async (req: Request, res: Response) => {
    try {
      const salaryId = req.params.id; //  Extract ID from params

      const result = await salaryModel.findById(salaryId); //  Check if record exists
      if (!result) {
        return res.status(400).json({
          message: "salary record not found"
        });
      }

      //  Update the record
      const updateSalary = await salaryModel.findByIdAndUpdate(
        salaryId,
        req.body,
        { new: true } // Return updated doc
      );

      return res.status(200).json({
        message: "salary successfully updated",
        data: updateSalary //  Better to return the updated document
      });
    } catch (error) {
      console.error("Internal server error:", error);
      return res.status(500).json({
        message: "Internal Server Error",
        success: false,
      });
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
        message: "Internal server error",
        success: false,
      });
    }
  };

  // // sand salaries emial to all employee

  export const sendSalariesToAll = async (req: Request, res: Response) => {
    try {
      // No need to populate employeeId since email is in salary directly
      const salaries = await salaryModel.find();
      console.log(salaries);

      for (const salary of salaries) {
        const email = salary.email; //  Direct access from salary doc

        if (!email) {
          console.log(`Skipping email for salary ID: ${salary._id} - no email found`);
        }
        const subject = `Salary Slip - ${salary.salaryMonth}`;
        const message = `Dear employee,\n\nYour salary for ${salary.salaryMonth} that is ${salary.salaryAmount} has been processed.\n\nRegards,\nHR`;

      }

      res.status(200).json({ message: "Emails sent successfully." });
    } catch (err) {
      console.error("Email Error:", err);
      res.status(500).json({
        message: "Failed to send emails.",
        success: false,
      });
    }
  };


  //getFilteredPaginatedSalaries


  // export const getFilteredPaginatedSalaries = async (req: Request, res: Response) => {
  //   try {
  //     //  Step 1: Extract query parameters
  //     const { email, status, page = "1", limit = "10" } = req.query;

  //     // Step 2: Create a filter object
  //     const filter: any = {};
  //     if (email) filter.email = email;
  //     if (status) filter.status = status;

  //     //  Step 3: Calculate skip and limit
  //     const pageNumber = parseInt(page as string, 10);     // convert "1" to 1
  //     const limitNumber = parseInt(limit as string, 10);   // convert "10" to 10
  //     const skip = (pageNumber - 1) * limitNumber;

  //     //  Step 4: Query database with filters and pagination
  //     const salaries = await salaryModel
  //       .find(filter)
  //       .skip(skip)
  //       .limit(limitNumber)
  //       .sort({ dateReceived: -1 }); // optional: sort latest first
  //     //  Step 5: Count total records (for pagination metadata)
  //     const totalCount = await salaryModel.countDocuments(filter);

  //     //  Step 6: Send response
  //     res.status(200).json({
  //       message: "Salaries fetched successfully",
  //       page: pageNumber,
  //       limit: limitNumber,
  //       totalRecords: totalCount,
  //       totalPages: Math.ceil(totalCount / limitNumber),
  //       data: salaries,
  //     });
  //   } catch (error) {
  //     console.error("Fetch error:", error);
  //     res.status(500).json({ message: "Internal server error" });
  //   }
  // };