import express from "express";
import { getAllEmpSalaries, getSalaryById, uploadSalaryExcel } from "../controllers/salaryController.js";
import { salaryUpload } from "../middlewares/salaryUploadMiddleware.js";

const router = express.Router();

router.post("/upload", salaryUpload.single("file"), uploadSalaryExcel);

router.get("/",getAllEmpSalaries);
router.get("/:id",getSalaryById);


export default router;

//update salary by id
