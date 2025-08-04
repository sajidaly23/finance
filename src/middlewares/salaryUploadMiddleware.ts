import multer from "multer";
import path from "path";
import { createUser } from "../controllers/userController.js"

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/salary");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});


export const salaryUpload = multer({ storage });
 