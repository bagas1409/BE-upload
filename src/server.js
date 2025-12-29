import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import errorHandler from "./middleware/errorHandler.js";
import authRoutes from "./routes/auth.routes.js";
import imageRoutes from "./routes/image.routes.js";

dotenv.config();
connectDB();

const app = express();

const allowedOrigins = [
  "https://fe-web-upload.vercel.app",
  "http://localhost:5173",
  "https://umkm-aren-backend-production.up.railway.app",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
  })
);

app.use(express.json());

app.use("/auth", authRoutes);
app.use("/images", imageRoutes);
app.use(errorHandler);

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
