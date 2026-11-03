import Product from "../models/Product.js";
import Category from "../models/Category.js";
import Order from "../models/Order.js";
import User from "../models/User.js";
import { asyncHandler } from "../utils/asyncHandler.js";
const slugify = (s) =>
  String(s)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
export const overview = asyncHandler(async (_req, res) => {
  const [products, customers, orders, revenue, lowStock, recentOrders] =
    await Promise.all([
      Product.countDocuments(),
      User.countDocuments({ role: "customer" }),
      Order.countDocuments(),
      Order.aggregate([
        {
          $match: {
            status: { $ne: "cancelled" },
            paymentStatus: { $in: ["paid", "pending"] },
          },
        },
        { $group: { _id: null, total: { $sum: "$total" } } },
      ]),
      Product.countDocuments({ stock: { $lte: 5 } }),
      Order.find()
        .populate("user", "name email")
        .sort({ createdAt: -1 })
        .limit(8),
    ]);
  res.json({
    stats: {
      products,
      customers,
      orders,
      revenue: revenue[0]?.total || 0,
      lowStock,
    },
    recentOrders,
  });
});
export const adminProducts = asyncHandler(async (_req, res) =>
  res.json({
    products: await Product.find()
      .populate("category", "name")
      .sort({ createdAt: -1 }),
  }),
);
export const createProduct = asyncHandler(async (req, res) => {
  const {
    name,
    description,
    price,
    compareAtPrice,
    sku,
    category,
    imageUrl,
    stock,
    isPublished,
    tags,
  } = req.body;
  if (
    !name ||
    !description ||
    !Number.isFinite(Number(price)) ||
    Number(price) < 0
  )
    return res
      .status(400)
      .json({ message: "Name, description and valid price are required." });
  const product = await Product.create({
    name,
    slug: slugify(name) + "-" + Date.now().toString(36),
    description,
    price: Number(price),
    compareAtPrice: compareAtPrice ? Number(compareAtPrice) : undefined,
    sku,
    category: category || undefined,
    imageUrl: imageUrl || "",
    stock: Math.max(0, Number(stock) || 0),
    isPublished: isPublished !== false,
    tags: Array.isArray(tags) ? tags : [],
  });
  res.status(201).json({ product });
});
export const updateProduct = asyncHandler(async (req, res) => {
  const body = { ...req.body };
  delete body.role;
  if (body.name) body.slug = slugify(body.name) + "-" + Date.now().toString(36);
  if (body.price !== undefined) body.price = Number(body.price);
  if (body.stock !== undefined) body.stock = Number(body.stock);
  const product = await Product.findByIdAndUpdate(req.params.id, body, {
    new: true,
    runValidators: true,
  });
  if (!product) return res.status(404).json({ message: "Product not found." });
  res.json({ product });
});
export const deleteProduct = asyncHandler(async (req, res) => {
  const p = await Product.findByIdAndDelete(req.params.id);
  if (!p) return res.status(404).json({ message: "Product not found." });
  res.json({ message: "Product deleted." });
});
export const categories = asyncHandler(async (_req, res) =>
  res.json({ categories: await Category.find().sort({ name: 1 }) }),
);
export const createCategory = asyncHandler(async (req, res) => {
  if (!req.body.name)
    return res.status(400).json({ message: "Category name is required." });
  const category = await Category.create({
    name: req.body.name,
    slug: slugify(req.body.name),
    description: req.body.description || "",
  });
  res.status(201).json({ category });
});
export const updateCategory = asyncHandler(async (req, res) => {
  const category = await Category.findByIdAndUpdate(
    req.params.id,
    { ...req.body, slug: req.body.name ? slugify(req.body.name) : undefined },
    { new: true, runValidators: true },
  );
  if (!category)
    return res.status(404).json({ message: "Category not found." });
  res.json({ category });
});
export const deleteCategory = asyncHandler(async (req, res) => {
  const used = await Product.exists({ category: req.params.id });
  if (used)
    return res
      .status(409)
      .json({ message: "Move products to another category before deleting." });
  await Category.findByIdAndDelete(req.params.id);
  res.json({ message: "Category deleted." });
});
export const customers = asyncHandler(async (_req, res) =>
  res.json({
    customers: await User.find({ role: "customer" })
      .select("name email isActive createdAt")
      .sort({ createdAt: -1 }),
  }),
);
export const setCustomerStatus = asyncHandler(async (req, res) => {
  const user = await User.findOneAndUpdate(
    { _id: req.params.id, role: "customer" },
    { isActive: Boolean(req.body.isActive) },
    { new: true },
  ).select("name email isActive");
  if (!user) return res.status(404).json({ message: "Customer not found." });
  res.json({ user });
});
export const allOrders = asyncHandler(async (_req, res) =>
  res.json({
    orders: await Order.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 })
      .limit(200),
  }),
);
export const updateOrderStatus = asyncHandler(async (req, res) => {
  const allowed = ["processing", "shipped", "delivered", "cancelled"];
  if (!allowed.includes(req.body.status))
    return res.status(400).json({ message: "Invalid order status." });
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ message: "Order not found." });
  if (order.status === "delivered" || order.status === "cancelled")
    return res
      .status(409)
      .json({ message: "This order is already finalized." });
  order.status = req.body.status;
  await order.save();
  res.json({ order });
});
