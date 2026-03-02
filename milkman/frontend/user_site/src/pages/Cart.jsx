import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import CartItem from "../components/CartItem";
import Button from "../components/Button";
import useAuth from "../hooks/useAuth";
import useCart from "../hooks/useCart";
import { checkoutOrder } from "../services/order";
import { getApiErrorMessage } from "../utils/apiError";

export default function Cart() {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();
  const {
    items,
    selectedItems,
    selectedSubtotal,
    selectedCount,
    changeQty,
    removeItem,
    clear,
    isItemSelected,
    setItemSelected,
    clearSelection,
    removeItemsByIds,
  } = useCart();

  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutMessage, setCheckoutMessage] = useState("");
  const [checkoutError, setCheckoutError] = useState("");

  const delivery = useMemo(() => (selectedItems.length > 0 ? 20 : 0), [selectedItems.length]);
  const checkoutTotal = selectedSubtotal + delivery;

  const handleCheckout = async () => {
    setCheckoutMessage("");
    setCheckoutError("");

    if (!isLoggedIn) {
      navigate("/login", { state: { from: "/cart" } });
      return;
    }

    if (selectedItems.length === 0) {
      setCheckoutError("Select at least one item to checkout.");
      return;
    }

    setIsCheckingOut(true);

    try {
      const response = await checkoutOrder(selectedItems);
      const purchasedItemIds = selectedItems.map((item) => item.id);

      removeItemsByIds(purchasedItemIds);
      clearSelection();
      setCheckoutMessage(
        `Order placed successfully. Order ID: ${response?.order?.order_id || response?.order?.id || "N/A"}`
      );
    } catch (error) {
      const statusCode = error?.response?.status;
      setCheckoutError(getApiErrorMessage(error, "Checkout failed. Please try again."));

      if (statusCode === 401) {
        navigate("/login", { state: { from: "/cart" } });
      }
    } finally {
      setIsCheckingOut(false);
    }
  };

  return (
    <section className="mx-auto grid max-w-7xl gap-6 px-4 py-10 md:grid-cols-3 md:px-6">
      <div className="space-y-4 md:col-span-2">
        <h1 className="text-4xl font-bold text-white">Your Cart</h1>

        {checkoutMessage ? (
          <div className="rounded-2xl border border-emerald-300 bg-emerald-100/90 p-4 text-sm text-emerald-900">
            {checkoutMessage}{" "}
            <Link to="/orders" className="font-semibold underline">
              View Orders
            </Link>
          </div>
        ) : null}

        {checkoutError ? (
          <div className="rounded-2xl border border-red-300 bg-red-100/90 p-4 text-sm text-red-900">
            {checkoutError}
          </div>
        ) : null}

        {items.length === 0 ? (
          <div className="rounded-2xl border border-white/45 bg-white/50 p-10 text-center text-pmDeep/75 shadow-soft backdrop-blur-md">
            Your cart is empty. Add products to continue.
          </div>
        ) : (
          items.map((item) => (
            <CartItem
              key={item.id}
              item={item}
              checked={isItemSelected(item.id)}
              onToggleSelection={setItemSelected}
              onIncrease={() => changeQty(item.id, 1)}
              onDecrease={() => changeQty(item.id, -1)}
              onRemove={() => removeItem(item.id)}
            />
          ))
        )}
      </div>

      <aside className="rounded-2xl border border-white/45 bg-white/50 p-5 shadow-md backdrop-blur-md md:sticky md:top-24 md:h-fit">
        <h2 className="text-2xl font-bold">Order Summary</h2>
        <div className="mt-4 space-y-2 text-sm text-pmDeep/70">
          <div className="flex justify-between">
            <span>Cart Items</span>
            <span>{items.length}</span>
          </div>
          <div className="flex justify-between">
            <span>Selected Qty</span>
            <span>{selectedCount}</span>
          </div>
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>INR {selectedSubtotal}</span>
          </div>
          <div className="flex justify-between">
            <span>Delivery</span>
            <span>INR {delivery}</span>
          </div>
        </div>
        <div className="mt-4 border-t pt-4">
          <p className="flex justify-between text-lg font-bold">
            <span>Total</span>
            <span>INR {checkoutTotal}</span>
          </p>
        </div>

        <Button
          className="mt-5 w-full bg-pmDeep text-white hover:bg-pmViolet disabled:cursor-not-allowed disabled:opacity-60"
          onClick={handleCheckout}
          disabled={isCheckingOut || selectedItems.length === 0}
        >
          {isCheckingOut ? "Processing..." : "Checkout Selected"}
        </Button>

        {items.length > 0 ? (
          <Button
            className="mt-3 w-full bg-pmAccent/30 text-pmDeep hover:bg-pmAccent/50"
            onClick={clear}
            disabled={isCheckingOut}
          >
            Clear Cart
          </Button>
        ) : null}
      </aside>
    </section>
  );
}
