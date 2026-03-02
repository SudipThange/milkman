import api from "./api";

export function buildCheckoutPayload(items) {
  return {
    items: items.map((item) => ({
      product_id: item.id,
      quantity: item.qty,
    })),
  };
}

export async function checkoutOrder(items) {
  const payload = buildCheckoutPayload(items);
  const { data } = await api.post("/order/", payload);
  return data;
}

export async function getOrders() {
  const { data } = await api.get("/order/");
  return data;
}
