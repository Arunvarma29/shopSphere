import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { API_URL, currency, getErrorMessage } from "../config";
import { useAuth } from "../context/AuthContext";
import Loader from "../components/Loader";
import {
  LayoutDashboard,
  Boxes,
  ClipboardList,
  Users,
  Tag,
  Plus,
  Pencil,
  Trash2,
  X,
  RefreshCw,
  UserRound,
  LogOut,
} from "../components/Icons";

const tabs = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "products", label: "Products", icon: Boxes },
  { id: "orders", label: "Orders", icon: ClipboardList },
  { id: "customers", label: "Customers", icon: Users },
  { id: "categories", label: "Categories", icon: Tag },
];
const emptyProduct = {
  name: "",
  description: "",
  price: "",
  compareAtPrice: "",
  sku: "",
  category: "",
  imageUrl: "",
  stock: "0",
  isPublished: true,
  tags: "",
};

export default function Admin() {
  const { accessToken, user, logout } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState("overview");
  const [data, setData] = useState({
    overview: null,
    products: [],
    orders: [],
    customers: [],
    categories: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [productForm, setProductForm] = useState(emptyProduct);
  const [categoryForm, setCategoryForm] = useState({
    name: "",
    description: "",
  });
  const [saving, setSaving] = useState(false);
  const headers = { Authorization: `Bearer ${accessToken}` };

  const signOut = async () => {
    await logout();
    navigate("/");
  };
  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [overview, products, orders, customers, categories] =
        await Promise.all([
          axios.get(`${API_URL}/admin/overview`, { headers }),
          axios.get(`${API_URL}/admin/products`, { headers }),
          axios.get(`${API_URL}/admin/orders`, { headers }),
          axios.get(`${API_URL}/admin/customers`, { headers }),
          axios.get(`${API_URL}/admin/categories`, { headers }),
        ]);
      setData({
        overview: overview.data,
        products: products.data.products || [],
        orders: orders.data.orders || [],
        customers: customers.data.customers || [],
        categories: categories.data.categories || [],
      });
    } catch (err) {
      setError(getErrorMessage(err, "Could not load the admin dashboard."));
    } finally {
      setLoading(false);
    }
  }, [accessToken]);
  useEffect(() => {
    load();
  }, [load]);

  const openCreate = () => {
    setEditing(null);
    setProductForm(emptyProduct);
    setModal(true);
  };
  const openEdit = (p) => {
    setEditing(p._id);
    setProductForm({
      name: p.name || "",
      description: p.description || "",
      price: String(p.price ?? ""),
      compareAtPrice: String(p.compareAtPrice ?? ""),
      sku: p.sku || "",
      category: p.category?._id || p.category || "",
      imageUrl: p.imageUrl || "",
      stock: String(p.stock ?? 0),
      isPublished: p.isPublished !== false,
      tags: (p.tags || []).join(", "),
    });
    setModal(true);
  };
  const saveProduct = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    const payload = {
      ...productForm,
      sku: productForm.sku.trim() || undefined,
      price: Number(productForm.price),
      compareAtPrice: productForm.compareAtPrice
        ? Number(productForm.compareAtPrice)
        : undefined,
      stock: Number(productForm.stock),
      category: productForm.category || undefined,
      tags: productForm.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
    };
    try {
      if (editing)
        await axios.patch(`${API_URL}/admin/products/${editing}`, payload, {
          headers,
        });
      else await axios.post(`${API_URL}/admin/products`, payload, { headers });
      setModal(false);
      await load();
    } catch (err) {
      setError(getErrorMessage(err, "Could not save product."));
    } finally {
      setSaving(false);
    }
  };
  const deleteProduct = async (id) => {
    if (!window.confirm("Delete this product? This cannot be undone.")) return;
    try {
      await axios.delete(`${API_URL}/admin/products/${id}`, { headers });
      await load();
    } catch (err) {
      setError(getErrorMessage(err, "Could not delete product."));
    }
  };
  const addCategory = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await axios.post(`${API_URL}/admin/categories`, categoryForm, {
        headers,
      });
      setCategoryForm({ name: "", description: "" });
      await load();
    } catch (err) {
      setError(getErrorMessage(err, "Could not create category."));
    } finally {
      setSaving(false);
    }
  };
  const deleteCategory = async (id) => {
    if (!window.confirm("Delete this category?")) return;
    try {
      await axios.delete(`${API_URL}/admin/categories/${id}`, { headers });
      await load();
    } catch (err) {
      setError(getErrorMessage(err, "Could not delete category."));
    }
  };
  const updateOrder = async (id, status) => {
    try {
      await axios.patch(
        `${API_URL}/admin/orders/${id}/status`,
        { status },
        { headers },
      );
      await load();
    } catch (err) {
      setError(getErrorMessage(err, "Could not update order."));
    }
  };
  const updateCustomer = async (id, isActive) => {
    try {
      await axios.patch(
        `${API_URL}/admin/customers/${id}/status`,
        { isActive },
        { headers },
      );
      await load();
    } catch (err) {
      setError(getErrorMessage(err, "Could not update customer."));
    }
  };

  return (
    <main className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-brand">
          <span className="admin-mark">S.</span>
          <div>
            <strong>ShopSphere</strong>
            <small>STORE MANAGEMENT</small>
          </div>
        </div>
        <nav>
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              className={tab === id ? "active" : ""}
              onClick={() => setTab(id)}
            >
              <Icon size={18} />
              {label}
            </button>
          ))}
        </nav>
        <Link to="/account" className="admin-profile-link">
          <UserRound size={17} /> My profile
        </Link>
        <div className="admin-sidebar-bottom">
          <span className="admin-avatar">
            {user?.name?.charAt(0)?.toUpperCase() || "A"}
          </span>
          <div>
            <strong>{user?.name || "Store admin"}</strong>
            <small>Administrator</small>
          </div>
          <button className="admin-logout" onClick={signOut}>
            <LogOut size={15} /> Log out
          </button>
        </div>
      </aside>
      <section className="admin-main">
        <div className="admin-topbar">
          <div>
            <p className="eyebrow">SHOPSPHERE / ADMIN</p>
            <h1>{tabs.find((t) => t.id === tab)?.label}</h1>
          </div>
          <button
            className="button button-outline"
            onClick={load}
            disabled={loading}
          >
            <RefreshCw size={15} /> Refresh
          </button>
        </div>
        {error && <div className="notice error-notice">{error}</div>}
        {loading ? (
          <Loader label="Loading store data..." />
        ) : (
          <>
            {tab === "overview" && (
              <Overview overview={data.overview} orders={data.orders} />
            )}
            {tab === "products" && (
              <div className="admin-panel">
                <div className="panel-heading">
                  <div>
                    <h2>Product catalogue</h2>
                    <p>Manage the things your customers see.</p>
                  </div>
                  <button className="button button-dark" onClick={openCreate}>
                    <Plus size={16} /> Add product
                  </button>
                </div>
                <div className="admin-table-wrap">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>Price</th>
                        <th>Stock</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.products.map((p) => (
                        <tr key={p._id}>
                          <td>
                            <div className="table-product">
                              {p.imageUrl ? (
                                <img src={p.imageUrl} alt="" />
                              ) : (
                                <span className="table-placeholder">S</span>
                              )}
                              <div>
                                <strong>{p.name}</strong>
                                <small>{p.sku || p.slug}</small>
                              </div>
                            </div>
                          </td>
                          <td>{currency(p.price)}</td>
                          <td>{p.stock}</td>
                          <td>
                            <span
                              className={`status-pill ${p.isPublished ? "status-delivered" : "status-cancelled"}`}
                            >
                              {p.isPublished ? "Published" : "Draft"}
                            </span>
                          </td>
                          <td>
                            <div className="table-actions">
                              <button
                                onClick={() => openEdit(p)}
                                aria-label="Edit product"
                              >
                                <Pencil size={16} />
                              </button>
                              <button
                                onClick={() => deleteProduct(p._id)}
                                aria-label="Delete product"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {!data.products.length && (
                    <p className="table-empty">
                      No products have been added yet.
                    </p>
                  )}
                </div>
              </div>
            )}
            {tab === "orders" && (
              <div className="admin-panel">
                <div className="panel-heading">
                  <div>
                    <h2>All orders</h2>
                    <p>Latest customer orders and fulfilment status.</p>
                  </div>
                </div>
                <div className="admin-table-wrap">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Order</th>
                        <th>Customer</th>
                        <th>Date</th>
                        <th>Total</th>
                        <th>Status</th>
                        <th>Update</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.orders.map((o) => (
                        <tr key={o._id}>
                          <td>#{o._id.slice(-7).toUpperCase()}</td>
                          <td>
                            {o.user?.name || "Customer"}
                            <small className="table-subline">
                              {o.user?.email}
                            </small>
                          </td>
                          <td>
                            {new Date(o.createdAt).toLocaleDateString("en-IN")}
                          </td>
                          <td>{currency(o.total)}</td>
                          <td>
                            <span className={`status-pill status-${o.status}`}>
                              {o.status}
                            </span>
                          </td>
                          <td>
                            <select
                              className="status-select"
                              value={o.status}
                              disabled={["delivered", "cancelled"].includes(
                                o.status,
                              )}
                              onChange={(e) =>
                                updateOrder(o._id, e.target.value)
                              }
                            >
                              <option value={o.status}>{o.status}</option>
                              {[
                                "processing",
                                "shipped",
                                "delivered",
                                "cancelled",
                              ]
                                .filter((s) => s !== o.status)
                                .map((s) => (
                                  <option key={s} value={s}>
                                    {s}
                                  </option>
                                ))}
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {!data.orders.length && (
                    <p className="table-empty">No orders yet.</p>
                  )}
                </div>
              </div>
            )}
            {tab === "customers" && (
              <div className="admin-panel">
                <div className="panel-heading">
                  <div>
                    <h2>Your customers</h2>
                    <p>Customer accounts registered with ShopSphere.</p>
                  </div>
                </div>
                <div className="admin-table-wrap">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Customer</th>
                        <th>Joined</th>
                        <th>Account</th>
                        <th>Access</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.customers.map((c) => (
                        <tr key={c._id}>
                          <td>
                            <strong>{c.name}</strong>
                            <small className="table-subline">{c.email}</small>
                          </td>
                          <td>
                            {new Date(c.createdAt).toLocaleDateString("en-IN")}
                          </td>
                          <td>
                            <span
                              className={`status-pill ${c.isActive ? "status-delivered" : "status-cancelled"}`}
                            >
                              {c.isActive ? "Active" : "Disabled"}
                            </span>
                          </td>
                          <td>
                            <button
                              className="text-action"
                              onClick={() => updateCustomer(c._id, !c.isActive)}
                            >
                              {c.isActive ? "Disable" : "Enable"} account
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {!data.customers.length && (
                    <p className="table-empty">No customers yet.</p>
                  )}
                </div>
              </div>
            )}
            {tab === "categories" && (
              <div className="admin-panel">
                <div className="panel-heading">
                  <div>
                    <h2>Categories</h2>
                    <p>Keep the catalogue organised.</p>
                  </div>
                </div>
                <form className="category-create" onSubmit={addCategory}>
                  <input
                    required
                    placeholder="Category name"
                    value={categoryForm.name}
                    onChange={(e) =>
                      setCategoryForm({ ...categoryForm, name: e.target.value })
                    }
                  />
                  <input
                    placeholder="Short description (optional)"
                    value={categoryForm.description}
                    onChange={(e) =>
                      setCategoryForm({
                        ...categoryForm,
                        description: e.target.value,
                      })
                    }
                  />
                  <button className="button button-dark" disabled={saving}>
                    <Plus size={16} /> Add category
                  </button>
                </form>
                <div className="category-list">
                  {data.categories.map((c) => (
                    <div key={c._id}>
                      <div>
                        <strong>{c.name}</strong>
                        <small>{c.description || c.slug}</small>
                      </div>
                      <button
                        onClick={() => deleteCategory(c._id)}
                        aria-label={`Delete ${c.name}`}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                  {!data.categories.length && (
                    <p className="table-empty">No categories created yet.</p>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </section>
      {modal && (
        <div
          className="modal-backdrop"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setModal(false);
          }}
        >
          <form className="product-modal" onSubmit={saveProduct}>
            <div className="modal-heading">
              <div>
                <p className="eyebrow">CATALOGUE</p>
                <h2>{editing ? "Edit product" : "Add a product"}</h2>
              </div>
              <button
                type="button"
                className="icon-btn"
                onClick={() => setModal(false)}
              >
                <X />
              </button>
            </div>
            <div className="form-grid">
              <label className="span-two">
                Product name
                <input
                  required
                  value={productForm.name}
                  onChange={(e) =>
                    setProductForm({ ...productForm, name: e.target.value })
                  }
                />
              </label>
              <label className="span-two">
                Description
                <textarea
                  required
                  rows="3"
                  value={productForm.description}
                  onChange={(e) =>
                    setProductForm({
                      ...productForm,
                      description: e.target.value,
                    })
                  }
                />
              </label>
              <label>
                Price (₹)
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  required
                  value={productForm.price}
                  onChange={(e) =>
                    setProductForm({ ...productForm, price: e.target.value })
                  }
                />
              </label>
              <label>
                Compare at (₹)
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={productForm.compareAtPrice}
                  onChange={(e) =>
                    setProductForm({
                      ...productForm,
                      compareAtPrice: e.target.value,
                    })
                  }
                />
              </label>
              <label>
                SKU
                <input
                  value={productForm.sku}
                  onChange={(e) =>
                    setProductForm({ ...productForm, sku: e.target.value })
                  }
                />
              </label>
              <label>
                Stock
                <input
                  type="number"
                  min="0"
                  value={productForm.stock}
                  onChange={(e) =>
                    setProductForm({ ...productForm, stock: e.target.value })
                  }
                />
              </label>
              <label className="span-two">
                Category
                <select
                  value={productForm.category}
                  onChange={(e) =>
                    setProductForm({ ...productForm, category: e.target.value })
                  }
                >
                  <option value="">No category</option>
                  {data.categories.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="span-two">
                Image URL
                <input
                  type="url"
                  placeholder="https://..."
                  value={productForm.imageUrl}
                  onChange={(e) =>
                    setProductForm({ ...productForm, imageUrl: e.target.value })
                  }
                />
              </label>
              <label className="span-two">
                Tags <small>Comma separated</small>
                <input
                  value={productForm.tags}
                  onChange={(e) =>
                    setProductForm({ ...productForm, tags: e.target.value })
                  }
                  placeholder="home, useful, gift"
                />
              </label>
              <label className="checkbox-label span-two">
                <input
                  type="checkbox"
                  checked={productForm.isPublished}
                  onChange={(e) =>
                    setProductForm({
                      ...productForm,
                      isPublished: e.target.checked,
                    })
                  }
                />{" "}
                Publish product on storefront
              </label>
            </div>
            <div className="modal-actions">
              <button
                type="button"
                className="button button-outline"
                onClick={() => setModal(false)}
              >
                Cancel
              </button>
              <button className="button button-dark" disabled={saving}>
                {saving
                  ? "Saving..."
                  : editing
                    ? "Save changes"
                    : "Create product"}
              </button>
            </div>
          </form>
        </div>
      )}
    </main>
  );
}

function Overview({ overview, orders }) {
  const stats = overview?.stats || {};
  return (
    <>
      <div className="stats-grid">
        {[
          ["Products", stats.products ?? 0],
          ["Customers", stats.customers ?? 0],
          ["Orders", stats.orders ?? 0],
          ["Revenue", currency(stats.revenue ?? 0)],
          ["Low stock", stats.lowStock ?? 0],
        ].map(([label, value]) => (
          <div className="stat-card" key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
            <small>Store overview</small>
          </div>
        ))}
      </div>
      <div className="admin-panel recent-panel">
        <div className="panel-heading">
          <div>
            <h2>Recent orders</h2>
            <p>A quick look at what is happening.</p>
          </div>
        </div>
        {orders.slice(0, 6).map((o) => (
          <div className="recent-order" key={o._id}>
            <div>
              <strong>{o.user?.name || "Customer"}</strong>
              <small>
                #{o._id.slice(-7).toUpperCase()} ·{" "}
                {new Date(o.createdAt).toLocaleDateString("en-IN")}
              </small>
            </div>
            <span className={`status-pill status-${o.status}`}>{o.status}</span>
            <strong>{currency(o.total)}</strong>
          </div>
        ))}
        {!orders.length && (
          <p className="table-empty">Your first order will appear here.</p>
        )}
      </div>
    </>
  );
}
