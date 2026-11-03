import mongoose from "mongoose";
const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 160 },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true,
    },
    description: { type: String, required: true, maxlength: 5000 },
    price: { type: Number, required: true, min: 0 },
    compareAtPrice: { type: Number, min: 0 },
    sku: { type: String, trim: true, unique: true, sparse: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
    imageUrl: { type: String, default: "" },
    stock: { type: Number, default: 0, min: 0 },
    isPublished: { type: Boolean, default: true },
    tags: [String],
  },
  { timestamps: true },
);
productSchema.index({ name: "text", description: "text", tags: "text" });
export default mongoose.model("Product", productSchema);
