import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { connectDB } from "../config/db.js";
import User from "../models/User.js";
import Product from "../models/Product.js";
import Category from "../models/Category.js";
await connectDB();
const email = String(process.env.ADMIN_EMAIL || "").toLowerCase();
const password = process.env.ADMIN_PASSWORD || "";
if (!email || password.length < 12)
  throw new Error(
    "Set ADMIN_EMAIL and ADMIN_PASSWORD (12+ characters) in server/.env before seeding.",
  );
let admin = await User.findOne({ email });
if (!admin) {
  admin = await User.create({
    name: process.env.ADMIN_NAME || "Store Admin",
    email,
    passwordHash: await bcrypt.hash(password, 12),
    role: "admin",
  });
  console.log("Initial admin created:", email);
} else
  console.log(
    "Configured admin already exists; no role or password changes made.",
  );
const category = await Category.findOneAndUpdate(
  { slug: "everyday-essentials" },
  {
    name: "Everyday Essentials",
    slug: "everyday-essentials",
    description: "Useful everyday products",
  },
  { upsert: true, new: true },
);
if ((await Product.countDocuments()) === 0)
  await Product.insertMany([
    {
      name: "Everyday Backpack",
      slug: "everyday-backpack",
      description: "A versatile everyday backpack with practical storage.",
      price: 1899,
      compareAtPrice: 2299,
      stock: 25,
      imageUrl:
        "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=900",
      category: category._id,
    },
    {
      name: "Ceramic Coffee Set",
      slug: "ceramic-coffee-set",
      description: "Minimal ceramic cups for your daily coffee ritual.",
      price: 899,
      stock: 40,
      imageUrl:
        "https://images.unsplash.com/photo-1514228742587-6b1558f 마? w=900".replace(
          " ",
          "",
        ),
      category: category._id,
    },
  ]);
await mongoose.disconnect();
console.log("Seed complete.");
