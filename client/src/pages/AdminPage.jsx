import { useEffect, useState } from "react";
import { http } from "../api/http";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Tags,
  Plus,
  Trash2,
} from "lucide-react";
const blank = {
  name: "",
  description: "",
  price: "",
  compareAtPrice: "",
  sku: "",
  imageUrl: "",
  stock: "0",
  isPublished: true,
};
export default function AdminPage() {
  const [tab, setTab] = useState("overview"),
    [overview, setOverview] = useState(null),
    [products, setProducts] = useState([]),
    [orders, setOrders] = useState([]),
    [customers, setCustomers] = useState([]),
    [categories, setCategories] = useState([]),
    [form, setForm] = useState(blank),
    [editing, setEditing] = useState(null),
    [message, setMessage] = useState("");
  const load = async () => {
    const [o, p, ord, c, cat] = await Promise.all([
      http.get("/admin/overview"),
      http.get("/admin/products"),
      http.get("/admin/orders"),
      http.get("/admin/customers"),
      http.get("/admin/categories"),
    ]);
    setOverview(o.data);
    setProducts(p.data.products);
    setOrders(ord.data.orders);
    setCustomers(c.data.customers);
    setCategories(cat.data.categories);
  };
  useEffect(() => {
    load().catch((e) =>
      setMessage(e.response?.data?.message || "Unable to load admin data."),
    );
  }, []);
  const saveProduct = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...form,
        price: Number(form.price),
        stock: Number(form.stock),
        compareAtPrice: form.compareAtPrice
          ? Number(form.compareAtPrice)
          : undefined,
      };
      if (editing) await http.patch(`/admin/products/${editing}`, payload);
      else await http.post("/admin/products", payload);
      setForm(blank);
      setEditing(null);
      setMessage("Product saved.");
      await load();
    } catch (e) {
      setMessage(e.response?.data?.message || "Could not save product.");
    }
  };
  const editProduct = (p) => {
    setEditing(p._id);
    setForm({
      name: p.name,
      description: p.description,
      price: p.price,
      compareAtPrice: p.compareAtPrice || "",
      sku: p.sku || "",
      imageUrl: p.imageUrl || "",
      stock: p.stock,
      isPublished: p.isPublished,
    });
    setTab("products");
  };
  const deleteProduct = async (id) => {
    if (!confirm("Delete this product?")) return;
    await http.delete(`/admin/products/${id}`);
    await load();
  };
  const status = async (id, value) => {
    await http.patch(`/admin/orders/${id}/status`, { status: value });
    await load();
  };
  const customerStatus = async (u) => {
    await http.patch(`/admin/customers/${u._id}/status`, {
      isActive: !u.isActive,
    });
    await load();
  };
  return (
    <main className="container page admin-page">
      <div className="admin-heading">
        <div>
          <p className="eyebrow">SHOPSPHERE CONTROL ROOM</p>
          <h1>Admin dashboard</h1>
          <p className="muted">Manage your store, catalogue and customers.</p>
        </div>
      </div>
      {message && <p className="notice">{message}</p>}
      <div className="admin-shell">
        <aside className="admin-sidebar">
          {[
            ["overview", "Overview", LayoutDashboard],
            ["products", "Products", Package],
            ["orders", "Orders", ShoppingCart],
            ["customers", "Customers", Users],
            ["categories", "Categories", Tags],
          ].map(([id, label, Icon]) => (
            <button
              key={id}
              className={tab === id ? "active" : ""}
              onClick={() => setTab(id)}
            >
              <Icon size={17} />
              {label}
            </button>
          ))}
        </aside>
        <section className="admin-content">
          {tab === "overview" && (
            <>
              <h2>Store overview</h2>
              <div className="stats-grid">
                {[
                  ["Products", overview?.stats.products],
                  ["Orders", overview?.stats.orders],
                  ["Customers", overview?.stats.customers],
                  [
                    "Revenue",
                    `₹${(overview?.stats.revenue || 0).toLocaleString("en-IN")}`,
                  ],
                  ["Low stock", overview?.stats.lowStock],
                ].map(([label, value]) => (
                  <div className="stat" key={label}>
                    <span>{label}</span>
                    <strong>{value ?? "—"}</strong>
                  </div>
                ))}
              </div>
              <h3>Recent orders</h3>
              <OrderTable
                orders={overview?.recentOrders || []}
                onStatus={status}
              />
            </>
          )}
          {tab === "products" && (
            <>
              <h2>{editing ? "Edit product" : "Product management"}</h2>
              <form className="product-form" onSubmit={saveProduct}>
                <label>
                  Product name
                  <input
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </label>
                <label>
                  Description
                  <textarea
                    required
                    rows="3"
                    value={form.description}
                    onChange={(e) =>
                      setForm({ ...form, description: e.target.value })
                    }
                  />
                </label>
                <div className="form-grid">
                  <label>
                    Price (₹)
                    <input
                      required
                      type="number"
                      min="0"
                      step="0.01"
                      value={form.price}
                      onChange={(e) =>
                        setForm({ ...form, price: e.target.value })
                      }
                    />
                  </label>
                  <label>
                    Compare at price
                    <input
                      type="number"
                      min="0"
                      value={form.compareAtPrice}
                      onChange={(e) =>
                        setForm({ ...form, compareAtPrice: e.target.value })
                      }
                    />
                  </label>
                  <label>
                    SKU
                    <input
                      value={form.sku}
                      onChange={(e) =>
                        setForm({ ...form, sku: e.target.value })
                      }
                    />
                  </label>
                  <label>
                    Stock
                    <input
                      type="number"
                      min="0"
                      value={form.stock}
                      onChange={(e) =>
                        setForm({ ...form, stock: e.target.value })
                      }
                    />
                  </label>
                </div>
                <label>
                  Image URL
                  <input
                    type="url"
                    placeholder="https://…"
                    value={form.imageUrl}
                    onChange={(e) =>
                      setForm({ ...form, imageUrl: e.target.value })
                    }
                  />
                </label>
                <label>
                  Category
                  <select
                    value={form.category || ""}
                    onChange={(e) =>
                      setForm({ ...form, category: e.target.value })
                    }
                  >
                    <option value="">Uncategorised</option>
                    {categories.map((c) => (
                      <option value={c._id} key={c._id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="check">
                  <input
                    type="checkbox"
                    checked={form.isPublished}
                    onChange={(e) =>
                      setForm({ ...form, isPublished: e.target.checked })
                    }
                  />{" "}
                  Published in storefront
                </label>
                <div className="row-actions">
                  <button className="btn btn-dark">
                    <Plus size={16} />
                    {editing ? "Save changes" : "Add product"}
                  </button>
                  {editing && (
                    <button
                      type="button"
                      className="btn btn-light"
                      onClick={() => {
                        setEditing(null);
                        setForm(blank);
                      }}
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
              <h3>All products ({products.length})</h3>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Price</th>
                      <th>Stock</th>
                      <th>Visibility</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((p) => (
                      <tr key={p._id}>
                        <td>{p.name}</td>
                        <td>₹{p.price}</td>
                        <td>{p.stock}</td>
                        <td>{p.isPublished ? "Published" : "Draft"}</td>
                        <td>
                          <button
                            className="text-button"
                            onClick={() => editProduct(p)}
                          >
                            Edit
                          </button>{" "}
                          ·{" "}
                          <button
                            className="text-button danger"
                            onClick={() => deleteProduct(p._id)}
                          >
                            <Trash2 size={14} /> Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
          {tab === "orders" && (
            <>
              <h2>Order management</h2>
              <OrderTable orders={orders} onStatus={status} />
            </>
          )}
          {tab === "customers" && (
            <>
              <h2>Customer management</h2>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Joined</th>
                      <th>Account</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customers.map((u) => (
                      <tr key={u._id}>
                        <td>{u.name}</td>
                        <td>{u.email}</td>
                        <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                        <td>{u.isActive ? "Active" : "Disabled"}</td>
                        <td>
                          <button
                            className="text-button"
                            onClick={() => customerStatus(u)}
                          >
                            {u.isActive ? "Disable" : "Enable"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
          {tab === "categories" && (
            <CategoryManager categories={categories} reload={load} />
          )}
        </section>
      </div>
    </main>
  );
}
function OrderTable({ orders, onStatus }) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Order</th>
            <th>Customer</th>
            <th>Total</th>
            <th>Status</th>
            <th>Update</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o._id}>
              <td>#{o._id.slice(-7).toUpperCase()}</td>
              <td>{o.user?.name || "Customer"}</td>
              <td>₹{o.total}</td>
              <td>{o.status}</td>
              <td>
                <select
                  value={o.status}
                  disabled={["delivered", "cancelled"].includes(o.status)}
                  onChange={(e) => onStatus(o._id, e.target.value)}
                >
                  <option value="placed">Placed</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {!orders.length && <p className="muted">No orders yet.</p>}
    </div>
  );
}
function CategoryManager({ categories, reload }) {
  const [name, setName] = useState(""),
    [description, setDescription] = useState("");
  const add = async (e) => {
    e.preventDefault();
    await http.post("/admin/categories", { name, description });
    setName("");
    setDescription("");
    reload();
  };
  const remove = async (id) => {
    try {
      await http.delete(`/admin/categories/${id}`);
      reload();
    } catch (e) {
      alert(e.response?.data?.message || "Unable to delete category.");
    }
  };
  return (
    <>
      <h2>Category management</h2>
      <form className="product-form" onSubmit={add}>
        <label>
          Category name
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </label>
        <label>
          Description
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </label>
        <button className="btn btn-dark">Add category</button>
      </form>
      {categories.map((c) => (
        <div className="category-row" key={c._id}>
          <span>{c.name}</span>
          <button className="text-button danger" onClick={() => remove(c._id)}>
            Delete
          </button>
        </div>
      ))}
    </>
  );
}
