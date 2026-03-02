import { useEffect, useMemo, useState } from "react";
import { HiPlus } from "react-icons/hi2";
import { createResource, deleteResource, fetchResource, updateResource } from "../api";

const RESOURCE_CONFIG = {
  users: { title: "Users", path: "/user/" },
  users_admin: { title: "Users", path: "/user/admin-users/" },
  category: { title: "Category", path: "/category/" },
  products: { title: "Products", path: "/product/" },
  subscription: { title: "Subscription", path: "/subscription/" },
  subscribers: { title: "Subscribers", path: "/subscribers/" },
  orders: { title: "Orders", path: "/order/" },
  order_items: { title: "Orders Item", path: "/order_item/" },
};

const HIDDEN_FIELDS = ["password"];
const HIDDEN_FIELDS_BY_RESOURCE = {
  orders: ["items"],
};
const COLUMN_ORDER_BY_RESOURCE = {
  users: ["id", "username", "email", "age", "gender", "phone", "address", "created_at", "modified_at"],
  users_admin: [
    "id",
    "username",
    "email",
    "first_name",
    "last_name",
    "is_staff",
    "is_superuser",
    "is_active",
    "last_login",
    "date_joined",
  ],
  category: ["id", "name", "description"],
  products: ["id", "name", "description", "price", "category", "created_at", "updated_at"],
  subscription: ["id", "title", "desc", "quantity", "duration", "price", "created_at", "modified_at"],
  subscribers: ["user_name", "subscription_title", "subscription_date", "due_date"],
  orders: [
    "id",
    "order_id",
    "user",
    "total_amount",
    "payment_status",
    "order_status",
    "payment_method",
    "transaction_id",
    "created_at",
    "modified_at",
  ],
  order_items: ["id", "order", "product", "quantity", "price", "total_price", "created_at", "modified_at"],
};
const STRICT_COLUMNS_BY_RESOURCE = {
  category: true,
  products: true,
  subscribers: true,
};
const ADDABLE_RESOURCE_KEYS = ["category", "products"];

function isEditableField(key) {
  const blocked = ["id", "created_at", "modified_at", "order_id", "total_price", "price", "user", "password"];
  return !blocked.includes(key);
}

function toTitleCase(text) {
  return text
    .replace(/_/g, " ")
    .replace(/\b\w/g, (ch) => ch.toUpperCase());
}

function renderCellValue(value) {
  if (value === null || value === undefined || value === "") return "-";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

function getInitialCreatePayload(resourceKey) {
  if (resourceKey === "products") {
    return { name: "", description: "", price: "", category: "" };
  }
  if (resourceKey === "category") {
    return { name: "", description: "" };
  }
  return {};
}

export default function ResourcePanel({ selected, token }) {
  const [userMode, setUserMode] = useState("users");
  const effectiveResourceKey = selected === "users" ? (userMode === "admin" ? "users_admin" : "users") : selected;
  const config = useMemo(() => RESOURCE_CONFIG[effectiveResourceKey], [effectiveResourceKey]);
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [editPayload, setEditPayload] = useState({});
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createPayload, setCreatePayload] = useState({});
  const [createError, setCreateError] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [categoryOptions, setCategoryOptions] = useState([]);
  const categoryNameById = useMemo(() => {
    const lookup = {};
    categoryOptions.forEach((category) => {
      lookup[String(category.id)] = category.name;
    });
    return lookup;
  }, [categoryOptions]);
  const columns = useMemo(() => {
    const fieldSet = new Set();
    const resourceHiddenFields = HIDDEN_FIELDS_BY_RESOURCE[effectiveResourceKey] || [];
    items.forEach((item) => {
      Object.keys(item || {}).forEach((key) => {
        if (!HIDDEN_FIELDS.includes(key) && !resourceHiddenFields.includes(key)) fieldSet.add(key);
      });
    });

    const preferredOrder = COLUMN_ORDER_BY_RESOURCE[effectiveResourceKey] || [];
    if (STRICT_COLUMNS_BY_RESOURCE[effectiveResourceKey]) {
      return preferredOrder;
    }

    const allColumns = Array.from(fieldSet);
    const sorted = [
      ...preferredOrder.filter((field) => allColumns.includes(field)),
      ...allColumns.filter((field) => !preferredOrder.includes(field)).sort(),
    ];

    return sorted;
  }, [items, effectiveResourceKey]);

  const canMutateRows = effectiveResourceKey !== "users_admin";
  const canAddResource = ADDABLE_RESOURCE_KEYS.includes(effectiveResourceKey);

  const loadItems = async () => {
    if (!config) return;
    setLoading(true);
    setError("");
    try {
      const data = await fetchResource(config.path, token);
      setItems(data);
    } catch (err) {
      setItems([]);
      setError(err.message || "Unable to fetch data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selected !== "users") {
      setUserMode("users");
    }
  }, [selected]);

  useEffect(() => {
    loadItems();
  }, [selected, userMode]);

  useEffect(() => {
    setIsCreateModalOpen(false);
    setCreateError("");
    setCreatePayload(getInitialCreatePayload(effectiveResourceKey));
  }, [effectiveResourceKey]);

  const loadCategoryOptions = async () => {
    try {
      const data = await fetchResource("/category/", token);
      setCategoryOptions(data);
    } catch {
      setCategoryOptions([]);
    }
  };

  useEffect(() => {
    if (effectiveResourceKey === "products") {
      loadCategoryOptions();
    }
  }, [effectiveResourceKey]);

  const getDisplayCellValue = (item, column) => {
    if (effectiveResourceKey === "products" && column === "category") {
      return categoryNameById[String(item[column])] || item[column];
    }
    if (effectiveResourceKey === "orders" && column === "user") {
      const rawUser = item[column];
      if (typeof rawUser === "string") {
        return rawUser.split(",")[0].trim();
      }
      if (rawUser && typeof rawUser === "object") {
        return rawUser.username || rawUser.name || "-";
      }
    }
    return item[column];
  };

  const onEdit = (item) => {
    if (!canMutateRows) return;
    setEditingItem(item);
    setEditPayload(item);
  };

  const onEditChange = (key, value) => {
    setEditPayload((prev) => ({ ...prev, [key]: value }));
  };

  const onSaveEdit = async () => {
    if (!editingItem) return;
    try {
      await updateResource(config.path, editingItem.id, token, editPayload);
      setEditingItem(null);
      await loadItems();
    } catch (err) {
      setError(err.message || "Failed to update");
    }
  };

  const onDelete = async (id) => {
    if (!canMutateRows) return;
    if (!window.confirm("Delete this record?")) return;
    try {
      await deleteResource(config.path, id, token);
      await loadItems();
    } catch (err) {
      setError(err.message || "Failed to delete");
    }
  };

  const onOpenCreate = async () => {
    if (!canAddResource) return;
    setCreateError("");
    setCreatePayload(getInitialCreatePayload(effectiveResourceKey));
    setIsCreateModalOpen(true);

    if (effectiveResourceKey === "products") {
      await loadCategoryOptions();
    }
  };

  const onChangeCreateField = (key, value) => {
    setCreatePayload((prev) => ({ ...prev, [key]: value }));
  };

  const onCreate = async () => {
    if (!canAddResource) return;
    setCreateError("");

    if (!createPayload.name?.trim() || !createPayload.description?.trim()) {
      setCreateError("Name and description are required.");
      return;
    }

    if (effectiveResourceKey === "products") {
      if (createPayload.price === "" || !createPayload.category) {
        setCreateError("Price and category are required.");
        return;
      }
    }

    setIsCreating(true);
    try {
      if (effectiveResourceKey === "products") {
        await createResource(config.path, token, {
          name: createPayload.name.trim(),
          description: createPayload.description.trim(),
          price: createPayload.price,
          category: Number(createPayload.category),
        });
      } else {
        await createResource(config.path, token, {
          name: createPayload.name.trim(),
          description: createPayload.description.trim(),
        });
      }

      setIsCreateModalOpen(false);
      await loadItems();
    } catch (err) {
      setCreateError(err.message || "Failed to create");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <section className="content-panel p-3 p-lg-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div className="d-flex align-items-center gap-2">
          <h3 className="fw-bold text-pmBlue900 m-0 resource-title">{config?.title}</h3>
        </div>
        <div className="d-flex align-items-center gap-2">
          {canAddResource ? (
            <button type="button" className="btn btn-pm-outline" onClick={onOpenCreate}>
              <span className="d-inline-flex align-items-center gap-1">
                <HiPlus />
                <span>Add</span>
              </span>
            </button>
          ) : null}
          <button type="button" className="btn btn-pm-outline" onClick={loadItems}>
            Refresh
          </button>
        </div>
      </div>

      {error ? <div className="alert alert-danger">{error}</div> : null}
      {loading ? <p className="text-secondary">Loading...</p> : null}

      <div className="resource-table-wrap">
        {selected === "users" ? (
          <div className="users-source-tabs-connected">
            <button
              type="button"
              className={`btn btn-sm btn-pm-tab ${userMode === "admin" ? "active" : ""}`}
              onClick={() => setUserMode("admin")}
            >
              Admin
            </button>
            <button
              type="button"
              className={`btn btn-sm btn-pm-tab ${userMode === "users" ? "active" : ""}`}
              onClick={() => setUserMode("users")}
            >
              Users
            </button>
          </div>
        ) : null}
      <div className="table-responsive rounded-3 border bg-white resource-table-surface">
        <div className="table-scroll">
          <table className="table modern-table table-hover align-middle mb-0">
          <thead>
            <tr>
              {columns.map((column) => (
                <th key={column}>{toTitleCase(column)}</th>
              ))}
              {canMutateRows ? <th className="text-end">Actions</th> : null}
            </tr>
          </thead>
          <tbody>
            {items.length === 0 && !loading ? (
              <tr>
                <td colSpan={columns.length + (canMutateRows ? 1 : 0)} className="text-center text-secondary py-4">
                  No records available.
                </td>
              </tr>
            ) : (
              items.map((item, index) => (
                <tr key={item.id || `${selected}-${index}`}>
                  {columns.map((column) => {
                    const displayValue = getDisplayCellValue(item, column);
                    return (
                      <td key={`${item.id || index}-${column}`}>
                        <div className="cell-text" title={renderCellValue(displayValue)}>
                          {renderCellValue(displayValue)}
                        </div>
                      </td>
                    );
                  })}
                  {canMutateRows ? (
                    <td className="text-end">
                      <div className="d-inline-flex gap-2">
                        <button className="btn btn-sm btn-pm-edit" onClick={() => onEdit(item)}>
                          Edit
                        </button>
                        <button className="btn btn-sm btn-pm-delete" onClick={() => onDelete(item.id)}>
                          Delete
                        </button>
                      </div>
                    </td>
                  ) : null}
                </tr>
              ))
            )}
          </tbody>
        </table>
        </div>
      </div>
      </div>

      {isCreateModalOpen ? (
        <div className="modal-backdrop-custom">
          <div className="edit-modal">
            <h5 className="fw-bold mb-3">
              Add {effectiveResourceKey === "products" ? "Product" : "Category"}
            </h5>
            <div className="d-flex flex-column gap-2 modal-form-scroll">
              <div>
                <label className="form-label small text-uppercase fw-semibold">Name</label>
                <input
                  className="form-control"
                  value={createPayload.name ?? ""}
                  onChange={(e) => onChangeCreateField("name", e.target.value)}
                />
              </div>
              <div>
                <label className="form-label small text-uppercase fw-semibold">Description</label>
                <textarea
                  className="form-control"
                  rows={3}
                  value={createPayload.description ?? ""}
                  onChange={(e) => onChangeCreateField("description", e.target.value)}
                />
              </div>

              {effectiveResourceKey === "products" ? (
                <>
                  <div>
                    <label className="form-label small text-uppercase fw-semibold">Price</label>
                    <input
                      className="form-control"
                      type="number"
                      min="0"
                      step="0.01"
                      value={createPayload.price ?? ""}
                      onChange={(e) => onChangeCreateField("price", e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="form-label small text-uppercase fw-semibold">Category</label>
                    <select
                      className="form-select"
                      value={createPayload.category ?? ""}
                      onChange={(e) => onChangeCreateField("category", e.target.value)}
                    >
                      <option value="">Select category</option>
                      {categoryOptions.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                    {categoryOptions.length === 0 ? (
                      <small className="text-secondary">No categories available. Add a category first.</small>
                    ) : null}
                  </div>
                </>
              ) : null}
            </div>

            {createError ? <div className="alert alert-danger mt-3 mb-0">{createError}</div> : null}

            <div className="d-flex justify-content-end gap-2 mt-3">
              <button className="btn btn-pm-outline" onClick={() => setIsCreateModalOpen(false)} disabled={isCreating}>
                Cancel
              </button>
              <button className="btn btn-pm-solid" onClick={onCreate} disabled={isCreating}>
                {isCreating ? "Saving..." : "Create"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {editingItem ? (
        <div className="modal-backdrop-custom">
          <div className="edit-modal">
            <h5 className="fw-bold mb-3">Edit Record #{editingItem.id}</h5>
            <div className="d-flex flex-column gap-2 modal-form-scroll">
              {Object.entries(editPayload).map(([key, value]) => (
                <div key={key}>
                  <label className="form-label small text-uppercase fw-semibold">{key}</label>
                  <input
                    className="form-control"
                    value={value ?? ""}
                    disabled={!isEditableField(key)}
                    onChange={(e) => onEditChange(key, e.target.value)}
                  />
                </div>
              ))}
            </div>
            <div className="d-flex justify-content-end gap-2 mt-3">
              <button className="btn btn-pm-outline" onClick={() => setEditingItem(null)}>
                Cancel
              </button>
              <button className="btn btn-pm-solid" onClick={onSaveEdit}>
                Save
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
