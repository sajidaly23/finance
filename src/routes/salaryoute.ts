import express from "express";
import { getAllEmpSalaries, getSalaryById, uploadSalaryExcel, updateSalaryById } from "../controllers/salaryController.js";
import { salaryUpload } from "../middlewares/salaryUploadMiddleware.js";

const router = express.Router();

router.post("/upload", salaryUpload.single("file"), uploadSalaryExcel);

router.get("/",getAllEmpSalaries);
router.get("/:id",getSalaryById);
router.put("/update/:id", updateSalaryById);
router.delete("/deleteSalary/:id");
// router.put


export default router;

