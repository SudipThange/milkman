import { useCallback, useEffect, useRef, useState } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import SubscriptionCard from "../components/SubscriptionCard";
import useAuth from "../hooks/useAuth";
import {
  getMySubscriptions,
  getSubscriptionPlans,
  subscribeToPlan,
  toDurationLabel,
  toQuantityLabel,
} from "../services/subscription";
import { getApiErrorMessage } from "../utils/apiError";

export default function Subscription() {
  const trackRef = useRef(null);
  const wheelLockRef = useRef(false);
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionError, setActionError] = useState("");
  const [actionSuccess, setActionSuccess] = useState("");
  const [submittingPlanId, setSubmittingPlanId] = useState(null);
  const [subscribedPlanIds, setSubscribedPlanIds] = useState([]);
  const [pendingPlanIds, setPendingPlanIds] = useState([]);

  const subscribedPlanIdSet = new Set(subscribedPlanIds);
  const pendingPlanIdSet = new Set(pendingPlanIds);

  const getSlideAmount = () => {
    if (!trackRef.current) return 0;
    return trackRef.current.clientWidth * 0.42;
  };

  const updateScrollState = () => {
    if (!trackRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = trackRef.current;
    const maxLeft = scrollWidth - clientWidth - 1;
    setCanScrollLeft(scrollLeft > 1);
    setCanScrollRight(scrollLeft < maxLeft);
  };

  const slideRight = () => {
    if (!trackRef.current) return;
    trackRef.current.scrollBy({ left: getSlideAmount(), behavior: "smooth" });
  };

  const slideLeft = () => {
    if (!trackRef.current) return;
    trackRef.current.scrollBy({ left: -getSlideAmount(), behavior: "smooth" });
  };

  const handleWheel = (event) => {
    if (!trackRef.current) return;

    const horizontalIntent = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
    if (Math.abs(horizontalIntent) < 5) return;

    event.preventDefault();
    if (wheelLockRef.current) return;

    wheelLockRef.current = true;
    const direction = horizontalIntent > 0 ? 1 : -1;
    trackRef.current.scrollBy({ left: getSlideAmount() * direction, behavior: "smooth" });

    window.setTimeout(() => {
      wheelLockRef.current = false;
    }, 380);
  };

  useEffect(() => {
    updateScrollState();
    const el = trackRef.current;
    if (!el) return;

    const onScroll = () => updateScrollState();
    const onResize = () => updateScrollState();

    el.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);

    return () => {
      el.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  useEffect(() => {
    const loadPlans = async () => {
      setLoading(true);
      setActionError("");
      try {
        const data = await getSubscriptionPlans();
        const normalized = data.map((item, index) => ({
          ...item,
          description: item.desc,
          quantity: toQuantityLabel(item.quantity),
          duration: toDurationLabel(item.duration),
          recommended: index === 1,
        }));
        setPlans(normalized);
      } catch (err) {
        setActionError(getApiErrorMessage(err, "Unable to load subscription plans."));
      } finally {
        setLoading(false);
      }
    };

    loadPlans();
  }, []);

  const syncMySubscriptionState = useCallback(async () => {
    if (!isLoggedIn) {
      setSubscribedPlanIds([]);
      setPendingPlanIds([]);
      return;
    }

    try {
      const response = await getMySubscriptions();
      const records = Array.isArray(response) ? response : [];

      const paidIds = [...new Set(
        records
          .filter((item) => String(item.payment_status || "").toLowerCase() === "success")
          .map((item) => Number(item.subscription))
          .filter((id) => Number.isFinite(id) && id > 0)
      )];

      const allIds = [...new Set(
        records
          .map((item) => Number(item.subscription))
          .filter((id) => Number.isFinite(id) && id > 0)
      )];

      const pendingIds = allIds.filter((id) => !paidIds.includes(id));

      setSubscribedPlanIds(paidIds);
      setPendingPlanIds(pendingIds);
    } catch {
      setSubscribedPlanIds([]);
      setPendingPlanIds([]);
    }
  }, [isLoggedIn]);

  useEffect(() => {
    syncMySubscriptionState();
  }, [syncMySubscriptionState]);

  const handleSubscribe = async (plan) => {
    setActionError("");
    setActionSuccess("");

    if (subscribedPlanIdSet.has(plan.id)) {
      setActionSuccess(`${plan.title} is already in your subscriptions.`);
      return;
    }

    if (pendingPlanIdSet.has(plan.id)) {
      setActionSuccess(`${plan.title} is pending payment confirmation.`);
      return;
    }

    if (!isLoggedIn) {
      navigate("/login", { state: { from: "/subscription" } });
      return;
    }

    setSubmittingPlanId(plan.id);
    try {
      await subscribeToPlan(plan.id);
      setActionSuccess(`${plan.title} added. Complete payment in Your Subscriptions to activate.`);
      setPendingPlanIds((previous) => (previous.includes(plan.id) ? previous : [...previous, plan.id]));
    } catch (err) {
      const statusCode = err?.response?.status;
      const nonFieldErrors = err?.response?.data?.non_field_errors;
      const detailText = Array.isArray(nonFieldErrors) ? nonFieldErrors[0] : "";

      if (statusCode === 400 && /already have this subscription/i.test(String(detailText))) {
        await syncMySubscriptionState();
        setActionSuccess(`${plan.title} already exists in your subscriptions.`);
        return;
      }

      setActionError(getApiErrorMessage(err, "Unable to subscribe right now."));
      if (statusCode === 401) {
        navigate("/login", { state: { from: "/subscription" } });
      }
    } finally {
      setSubmittingPlanId(null);
    }
  };

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 md:px-6">
      <header className="pm-shell mb-6 p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="pm-section-title">Subscriptions</h1>
            <p className="pm-section-subtitle">Choose a plan that fits your routine.</p>
          </div>
        </div>
      </header>

      {actionError ? (
        <div className="mb-4 rounded-2xl border border-red-300 bg-red-100/90 px-4 py-3 text-sm text-red-900">
          {actionError}
        </div>
      ) : null}

      {actionSuccess ? (
        <div className="mb-4 rounded-2xl border border-emerald-300 bg-emerald-100/90 px-4 py-3 text-sm text-emerald-900">
          {actionSuccess}
        </div>
      ) : null}

      <div className="pm-carousel-wrap">
        <button
          onClick={slideLeft}
          disabled={!canScrollLeft}
          className={`pm-carousel-arrow left-3 ${
            canScrollLeft
              ? "border-white/90 bg-pmDeep text-white hover:scale-105 hover:bg-pmViolet"
              : "cursor-not-allowed border-white/50 bg-pmDeep/50 text-white/50"
          }`}
          aria-label="previous subscriptions"
        >
          <FiChevronLeft className="text-lg" />
        </button>

        <button
          onClick={slideRight}
          disabled={!canScrollRight}
          className={`pm-carousel-arrow right-3 ${
            canScrollRight
              ? "border-white/90 bg-pmDeep text-white hover:scale-105 hover:bg-pmViolet"
              : "cursor-not-allowed border-white/50 bg-pmDeep/50 text-white/50"
          }`}
          aria-label="next subscriptions"
        >
          <FiChevronRight className="text-lg" />
        </button>

        <div
          ref={trackRef}
          onWheel={handleWheel}
          className="flex snap-x snap-mandatory gap-5 overflow-x-auto overflow-y-visible px-9 py-3 scrollbar-hide"
        >
          {loading ? (
            <div className="w-full rounded-2xl border border-white/45 bg-white/65 p-8 text-center text-pmDeep/70">
              Loading plans...
            </div>
          ) : null}

          {!loading && plans.map((item) => (
            <div
              key={item.id}
              className="snap-start basis-[85%] sm:basis-[48%] lg:basis-[39%] shrink-0"
            >
              <SubscriptionCard
                item={item}
                onSubscribe={subscribedPlanIdSet.has(item.id) || pendingPlanIdSet.has(item.id) ? undefined : handleSubscribe}
                isSubmitting={submittingPlanId === item.id}
                isSubscribed={subscribedPlanIdSet.has(item.id)}
                isPending={pendingPlanIdSet.has(item.id)}
              />
            </div>
          ))}
        </div>

        <div
          className={`pm-carousel-edge-shadow ${canScrollRight ? "opacity-100" : "opacity-0"}`}
          aria-hidden="true"
        />
      </div>
    </section>
  );
}
