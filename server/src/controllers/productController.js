import Product from "../models/Product.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const listProducts = asyncHandler(async (req, res) => {
  const { q, category, sort = "newest", page = 1, limit = 12 } = req.query;
  const filter = { isPublished: true };
  if (category) filter.category = category;
  const search = String(q || "").trim();
  if (search) {
    const pattern = new RegExp(escapeRegExp(search), "i");
    filter.$or = [
      { name: pattern },
      { description: pattern },
      { tags: pattern },
    ];
  }
  const sortMap = {
    newest: { createdAt: -1 },
    price_asc: { price: 1 },
    price_desc: { price: -1 },
  };
  const p = Math.max(1, Number(page) || 1),
    l = Math.min(48, Math.max(1, Number(limit) || 12));
  const [products, total] = await Promise.all([
    Product.find(filter)
      .populate("category", "name slug")
      .sort(sortMap[sort] || sortMap.newest)
      .skip((p - 1) * l)
      .limit(l),
    Product.countDocuments(filter),
  ]);
  res.json({
    products,
    pagination: { page: p, limit: l, total, pages: Math.ceil(total / l) },
  });
});
export const getProduct = asyncHandler(async (req, res) => {
  const p = await Product.findOne({
    $or: [
      { _id: req.params.id.match(/^[0-9a-f]{24}$/i) ? req.params.id : null },
      { slug: req.params.id },
    ],
    isPublished: true,
  }).populate("category", "name slug");
  if (!p) return res.status(404).json({ message: "Product not found." });
  res.json({ product: p });
});
