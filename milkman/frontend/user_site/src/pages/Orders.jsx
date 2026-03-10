import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/Button";
import useAuth from "../hooks/useAuth";
import { getOrders } from "../services/order";
import { getApiErrorMessage } from "../utils/apiError";

function formatDate(value) {
  if (!value) return "N/A";
  return new Date(value).toLocaleString();
}

function getStatusStyles(status) {
  const normalized = String(status || "").toLowerCase();

  if (normalized === "completed" || normalized === "success") {
    return "bg-emerald-100 text-emerald-800 border-emerald-300";
  }

  if (normalized === "cancelled" || normalized === "failed") {
    return "bg-red-100 text-red-800 border-red-300";
  }

  if (normalized === "processing") {
    return "bg-blue-100 text-blue-800 border-blue-300";
  }

  return "bg-amber-100 text-amber-900 border-amber-300";
}

export default function Orders() {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadOrders = useCallback(async () => {
    setError("");
    setLoading(true);
    try {
      const response = await getOrders();
      setOrders(Array.isArray(response) ? response : []);
    } catch (err) {
      const statusCode = err?.response?.status;
      setError(getApiErrorMessage(err, "Unable to load your orders right now."));
      if (statusCode === 401) {
        navigate("/login", { state: { from: "/orders" } });
      }
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/login", { state: { from: "/orders" } });
      return;
    }
    loadOrders();
  }, [isLoggedIn, navigate, loadOrders]);

  const hasOrders = useMemo(() => orders.length > 0, [orders.length]);

  return (
    <section className="mx-auto max-w-7xl space-y-6 px-4 py-10 md:px-6">
      <header className="rounded-3xl border border-white/45 bg-white/45 p-6 shadow-soft backdrop-blur-md">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-4xl font-bold text-pmDeep">Your Orders</h1>
            <p className="mt-2 text-pmDeep/75">Track current and past purchases.</p>
          </div>
          <Button
            className="border border-pmDeep/30 bg-white/70 text-pmDeep hover:bg-white"
            onClick={loadOrders}
            disabled={loading}
          >
            {loading ? "Refreshing..." : "Refresh"}
          </Button>
        </div>
      </header>

      {error ? (
        <div className="rounded-2xl border border-red-300 bg-red-100/90 p-4 text-sm text-red-900">
          {error}
        </div>
      ) : null}

      {loading ? (
        <div className="rounded-2xl border border-white/45 bg-white/50 p-8 text-center text-pmDeep/70 shadow-soft backdrop-blur-md">
          Loading your orders...
        </div>
      ) : null}

      {!loading && !hasOrders ? (
        <div className="rounded-2xl border border-white/45 bg-white/50 p-8 text-center text-pmDeep/70 shadow-soft backdrop-blur-md">
          No orders found yet.
        </div>
      ) : null}

      {!loading && hasOrders ? (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {orders.map((order) => (
            <article
              key={order.id}
              className="rounded-2xl border border-white/45 bg-white/60 p-5 shadow-md backdrop-blur-md"
            >
              <div className="flex flex-col justify-between gap-3 border-b border-pmDeep/10 pb-4 sm:flex-row sm:items-start">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-pmDeep/60">Order ID</p>
                  <p className="text-sm font-semibold text-pmDeep">{order.order_id}</p>
                  <p className="mt-2 text-xs text-pmDeep/60">Placed on {formatDate(order.created_at)}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span
                    className={`rounded-full border px-3 py-1 text-xs font-semibold ${getStatusStyles(
                      order.order_status
                    )}`}
                  >
                    {order.order_status || "created"}
                  </span>
                  <span
                    className={`rounded-full border px-3 py-1 text-xs font-semibold ${getStatusStyles(
                      order.payment_status
                    )}`}
                  >
                    payment: {order.payment_status || "pending"}
                  </span>
                </div>
              </div>

              <div className="mt-4 space-y-2">
                {(order.items || []).map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between rounded-xl bg-white/70 px-3 py-2 text-sm"
                  >
                    <div>
                      <p className="font-semibold text-pmDeep">{item.product_name}</p>
                      <p className="text-xs text-pmDeep/60">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-semibold text-pmDeep">Rs {item.total_price}</p>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-pmDeep/10 pt-4">
                <p className="text-sm text-pmDeep/70">Transaction: {order.transaction_id || "N/A"}</p>
                <p className="text-lg font-bold text-pmDeep">Rs {order.total_amount}</p>
              </div>
            </article>
          ))}
        </div>
      ) : null}
    </section>
  );
}
