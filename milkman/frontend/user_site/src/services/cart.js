import api from "./api";

export async function addProductToCart(productId, quantity = 1) {
    const payload = { product_id: productId, quantity };

    try {
        const { data } = await api.post("/cart/add/", payload);
        return data;
    } catch (error) {
        if (error && error.response && error.response.status === 404) {
            const fallbackPayload = { product: productId, quantity };
            const { data } = await api.post("/order_item/", fallbackPayload);
            return data;
        }
        throw error;
    }
}