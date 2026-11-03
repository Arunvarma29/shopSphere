import "dotenv/config";
import app from "./app.js";
import { connectDB } from "./config/db.js";
const port = process.env.PORT || 5000;
connectDB()
  .then(() =>
    app.listen(port, () => console.log(`ShopSphere API listening on ${port}`)),
  )
  .catch((err) => {
    console.error("Startup failed:", err);
    process.exit(1);
  });
