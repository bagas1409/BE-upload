import mongoose from "mongoose";

const imageSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  fileName: String,
  url: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("Image", imageSchema);
