import api from "./api";

const QUANTITY_LABELS = {
    "250ml": "250ml",
    "500ml": "500ml",
    "750ml": "750ml",
    "1l": "1L",
    "1L": "1L",
    "2l": "2L",
    "2L": "2L",
};

const DURATION_LABELS = {
    "7d": "7 Days",
    "15d": "15 Days",
    "1m": "1 Month",
    "2m": "2 Months",
    "3m": "3 Months",
    "6m": "6 Months",
    "1y": "1 Year",
};

export function toQuantityLabel(value) {
    return QUANTITY_LABELS[value] || value || "N/A";
}

export function toDurationLabel(value) {
    return DURATION_LABELS[value] || value || "N/A";
}

export async function getSubscriptionPlans() {
    const { data } = await api.get("/subscription/");
    return Array.isArray(data) ? data : [];
}

export async function subscribeToPlan(subscriptionId) {
    const { data } = await api.post("/subscribers/", { subscription: subscriptionId });
    return data;
}

export async function getMySubscriptions() {
    const { data } = await api.get("/subscribers/");
    return Array.isArray(data) ? data : [];
}

export async function checkoutMySubscriptions(subscriberIds, paymentData = {}) {
    const { data } = await api.post("/subscribers/checkout/", {
        subscriber_ids: subscriberIds,
        ...paymentData,
    });
    return data;
}