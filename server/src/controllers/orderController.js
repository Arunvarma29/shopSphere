import Order from "../models/Order.js";
import Product from "../models/Product.js";
import { asyncHandler } from "../utils/asyncHandler.js";
export const createOrder = asyncHandler(async (req, res) => {
  const { items, shippingAddress } = req.body;
  if (!Array.isArray(items) || !items.length || !shippingAddress?.line1)
    return res
      .status(400)
      .json({ message: "Cart and shipping address are required." });
  const ids = [...new Set(items.map((i) => String(i.productId)))];
  const products = await Product.find({ _id: { $in: ids }, isPublished: true });
  const map = new Map(products.map((p) => [p._id.toString(), p]));
  let subtotal = 0;
  const orderItems = [];
  for (const item of items) {
    const p = map.get(String(item.productId));
    const qty = Math.floor(Number(item.quantity));
    if (!p || !Number.isInteger(qty) || qty < 1 || p.stock < qty)
      return res
        .status(400)
        .json({
          message: `Product unavailable or insufficient stock: ${p?.name || "unknown item"}`,
        });
    subtotal += p.price * qty;
    orderItems.push({
      product: p._id,
      name: p.name,
      imageUrl: p.imageUrl,
      quantity: qty,
      unitPrice: p.price,
    });
  }
  // Stock is rechecked on the server; use transactions/atomic reservations before real production traffic.
  for (const item of orderItems) {
    const updated = await Product.findOneAndUpdate(
      { _id: item.product, stock: { $gte: item.quantity } },
      { $inc: { stock: -item.quantity } },
    );
    if (!updated)
      return res
        .status(409)
        .json({ message: "Stock changed during checkout. Please retry." });
  }
  const order = await Order.create({
    user: req.user._id,
    items: orderItems,
    shippingAddress,
    subtotal,
    shipping: 0,
    total: subtotal,
    paymentMethod: "cod",
  });
  res.status(201).json({ order });
});
export const myOrders = asyncHandler(async (req, res) =>
  res.json({
    orders: await Order.find({ user: req.user._id }).sort({ createdAt: -1 }),
  }),
);
