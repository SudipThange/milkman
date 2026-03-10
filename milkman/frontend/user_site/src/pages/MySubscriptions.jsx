import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/Button";
import useAuth from "../hooks/useAuth";
import {
  checkoutMySubscriptions,
  getMySubscriptions,
  toDurationLabel,
  toQuantityLabel,
} from "../services/subscription";
import { getApiErrorMessage } from "../utils/apiError";

function getPaymentBadgeClass(status) {
  const normalized = String(status || "pending").toLowerCase();
  if (normalized === "success") {
    return "border-emerald-300 bg-emerald-100 text-emerald-900";
  }
  if (normalized === "failed") {
    return "border-red-300 bg-red-100 text-red-900";
  }
  return "border-amber-300 bg-amber-100 text-amber-900";
}

export default function MySubscriptions() {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();

  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);

  const [paymentMethod, setPaymentMethod] = useState("upi");
  const [paymentReference, setPaymentReference] = useState("");
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);

  const loadSubscriptions = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const data = await getMySubscriptions();
      setSubscriptions(Array.isArray(data) ? data : []);
    } catch (err) {
      const statusCode = err?.response?.status;
      setError(getApiErrorMessage(err, "Unable to load your subscriptions."));
      if (statusCode === 401) {
        navigate("/login", { state: { from: "/your-subscriptions" } });
      }
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/login", { state: { from: "/your-subscriptions" } });
      return;
    }

    loadSubscriptions();
  }, [isLoggedIn, loadSubscriptions, navigate]);

  const unpaidIds = useMemo(
    () => subscriptions.filter((item) => item.payment_status !== "success").map((item) => item.id),
    [subscriptions]
  );

  useEffect(() => {
    setSelectedIds((previous) => previous.filter((id) => unpaidIds.includes(id)));
  }, [unpaidIds]);

  const selectedPlans = useMemo(
    () => subscriptions.filter((item) => selectedIds.includes(item.id)),
    [subscriptions, selectedIds]
  );

  const selectedAmount = useMemo(
    () => selectedPlans.reduce((sum, item) => sum + Number(item.subscription_price || 0), 0),
    [selectedPlans]
  );

  const toggleSelection = (subscriptionId) => {
    setSelectedIds((previous) => {
      if (previous.includes(subscriptionId)) {
        return previous.filter((id) => id !== subscriptionId);
      }
      return [...previous, subscriptionId];
    });
  };

  const handleCheckout = async () => {
    setError("");
    setSuccess("");

    if (selectedIds.length === 0) {
      setError("Select at least one subscription to continue.");
      return;
    }

    if (!paymentReference.trim()) {
      setError("Enter dummy payment reference.");
      return;
    }

    if (!isConfirmed) {
      setError("Please confirm the dummy payment details.");
      return;
    }

    setProcessingPayment(true);
    try {
      const response = await checkoutMySubscriptions(selectedIds, {
        payment_method: paymentMethod,
        payment_reference: paymentReference.trim(),
      });
      setSuccess(response?.message || "Payment recorded successfully.");
      setSelectedIds([]);
      setPaymentReference("");
      setIsConfirmed(false);
      await loadSubscriptions();
    } catch (err) {
      const statusCode = err?.response?.status;
      setError(getApiErrorMessage(err, "Unable to record payment right now."));
      if (statusCode === 401) {
        navigate("/login", { state: { from: "/your-subscriptions" } });
      }
    } finally {
      setProcessingPayment(false);
    }
  };

  return (
    <section className="mx-auto max-w-7xl space-y-6 px-4 py-10 md:px-6">
      <header className="rounded-3xl border border-white/45 bg-white/45 p-6 shadow-soft backdrop-blur-md">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-4xl font-bold text-pmDeep">Your Subscriptions</h1>
            <p className="mt-2 text-pmDeep/75">Select subscriptions and confirm dummy payment to complete activation.</p>
          </div>
          <Button
            className="border border-pmDeep/30 bg-white/70 text-pmDeep hover:bg-white"
            onClick={loadSubscriptions}
            disabled={loading}
          >
            {loading ? "Refreshing..." : "Refresh"}
          </Button>
        </div>
      </header>

      {error ? (
        <div className="rounded-2xl border border-red-300 bg-red-100/90 px-4 py-3 text-sm text-red-900">{error}</div>
      ) : null}

      {success ? (
        <div className="rounded-2xl border border-emerald-300 bg-emerald-100/90 px-4 py-3 text-sm text-emerald-900">{success}</div>
      ) : null}

      {loading ? (
        <div className="rounded-2xl border border-white/45 bg-white/50 p-8 text-center text-pmDeep/70 shadow-soft backdrop-blur-md">
          Loading your subscriptions...
        </div>
      ) : null}

      {!loading && subscriptions.length === 0 ? (
        <div className="rounded-2xl border border-white/45 bg-white/50 p-8 text-center text-pmDeep/70 shadow-soft backdrop-blur-md">
          You have not subscribed to any plan yet.
        </div>
      ) : null}

      {!loading && subscriptions.length > 0 ? (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {subscriptions.map((item) => {
            const isPaid = item.payment_status === "success";
            return (
              <article key={item.id} className="rounded-2xl border border-white/45 bg-white/60 p-5 shadow-md backdrop-blur-md">
                <div className="flex items-start justify-between gap-3 border-b border-pmDeep/10 pb-4">
                  <div>
                    <h3 className="text-2xl font-bold text-pmDeep">{item.subscription_title}</h3>
                    <p className="mt-1 text-sm text-pmDeep/70">Subscribed on {item.subscription_date}</p>
                    <p className="text-sm text-pmDeep/70">Due date: {item.due_date || "N/A"}</p>
                  </div>
                  <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${getPaymentBadgeClass(item.payment_status)}`}>
                    {isPaid ? "Paid" : "Pending"}
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2 rounded-xl bg-white/70 p-3 text-sm text-pmDeep">
                  <p><span className="font-semibold">Qty:</span> {toQuantityLabel(item.subscription_quantity) || "N/A"}</p>
                  <p><span className="font-semibold">Duration:</span> {toDurationLabel(item.subscription_duration)}</p>
                </div>

                <div className="mt-3 flex items-center justify-between rounded-xl bg-white/70 p-3">
                  <p className="text-lg font-bold text-pmDeep">Rs {item.subscription_price}</p>
                  <label className="inline-flex items-center gap-2 text-sm text-pmDeep">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(item.id)}
                      onChange={() => toggleSelection(item.id)}
                      disabled={isPaid || processingPayment}
                      className="h-4 w-4 accent-pmDeep"
                    />
                    Select
                  </label>
                </div>

                {isPaid ? (
                  <p className="mt-3 text-xs text-pmDeep/70">Transaction: {item.transaction_id || "N/A"}</p>
                ) : null}
              </article>
            );
          })}
        </div>
      ) : null}

      {!loading && subscriptions.length > 0 ? (
        <section className="rounded-2xl border border-white/45 bg-white/55 p-5 shadow-soft backdrop-blur-md">
          <h2 className="text-2xl font-bold text-pmDeep">Confirmation</h2>
          <p className="mt-1 text-sm text-pmDeep/70">Selected plans: {selectedIds.length} • Total: Rs {selectedAmount}</p>

          <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
            <select
              value={paymentMethod}
              onChange={(event) => setPaymentMethod(event.target.value)}
              className="rounded-xl border border-pmDeep/20 bg-white/80 px-4 py-3 outline-none transition focus:border-pmViolet focus:ring-4 focus:ring-pmViolet/20"
              disabled={processingPayment}
            >
              <option value="upi">UPI</option>
              <option value="card">Card</option>
              <option value="netbanking">Net Banking</option>
            </select>

            <input
              value={paymentReference}
              onChange={(event) => setPaymentReference(event.target.value)}
              placeholder="Dummy payment reference"
              className="rounded-xl border border-pmDeep/20 bg-white/80 px-4 py-3 outline-none transition focus:border-pmViolet focus:ring-4 focus:ring-pmViolet/20"
              disabled={processingPayment}
            />
          </div>

          <label className="mt-4 inline-flex items-center gap-2 text-sm text-pmDeep">
            <input
              type="checkbox"
              checked={isConfirmed}
              onChange={(event) => setIsConfirmed(event.target.checked)}
              disabled={processingPayment}
              className="h-4 w-4 accent-pmDeep"
            />
            I confirm these are dummy payment details.
          </label>

          <div className="mt-4">
            <Button
              className="border border-pmDeep bg-pmDeep text-white hover:bg-pmViolet disabled:cursor-not-allowed disabled:opacity-60"
              onClick={handleCheckout}
              disabled={processingPayment}
            >
              {processingPayment ? "Processing..." : "Confirm Payment"}
            </Button>
          </div>
        </section>
      ) : null}
    </section>
  );
}
