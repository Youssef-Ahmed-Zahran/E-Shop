import mongoose from "mongoose";

const brandSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: true,
      maxLength: 30,
    },
  },
  { timestamps: true }
);

export const Brand = mongoose.model("Brand", brandSchema);
