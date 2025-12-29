import express from "express";
import multer from "multer";
import auth from "../middleware/auth.js";
import Image from "../models/Image.js";
import { supabase } from "../config/supabase.js";

const router = express.Router();
const upload = multer();

// UPLOAD
router.post("/upload", auth, upload.single("file"), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "File wajib diupload" });
    }

    const file = req.file;
    const allowed = ["image/png", "image/jpeg", "image/jpg"];

    if (!allowed.includes(file.mimetype)) {
      return res.status(400).json({ message: "Format file tidak didukung" });
    }

    const fileName = `${req.user.id}-${Date.now()}-${file.originalname}`;

    const { error } = await supabase.storage
      .from("testing")
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
      });

    if (error) {
      throw new Error("Gagal upload ke storage");
    }

    const { data } = supabase.storage.from("testing").getPublicUrl(fileName);

    const image = await Image.create({
      userId: req.user.id,
      fileName,
      url: data.publicUrl,
    });

    res.status(201).json(image);
  } catch (err) {
    next(err);
  }
});

// GET ALL USER IMAGES
router.get("/", auth, async (req, res, next) => {
  try {
    const images = await Image.find({ userId: req.user.id });
    res.json(images);
  } catch (err) {
    next(err);
  }
});

// DELETE
router.delete("/:id", auth, async (req, res, next) => {
  try {
    const image = await Image.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!image) {
      return res.status(404).json({ message: "Image tidak ditemukan" });
    }

    await supabase.storage.from("testing").remove([image.fileName]);

    await image.deleteOne();

    res.json({ message: "Image berhasil dihapus" });
  } catch (err) {
    next(err);
  }
});

export default router;
