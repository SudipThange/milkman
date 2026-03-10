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
    <section className="mx-auto max-w-7xl space-y-5 px-4 py-10 md:px-6">
      <header className="rounded-3xl border border-white/45 bg-white/45 p-6 shadow-soft backdrop-blur-md">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-4xl font-bold text-pmDeep">Your Cart</h1>
            <p className="mt-2 text-pmDeep/75">Review your selected products and checkout in one click.</p>
          </div>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_350px]">
      <div className="space-y-4">

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
          <div className="pm-shell p-10 text-center text-pmDeep/75">
            Your cart is empty. Add products to continue.
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <CartItem
                key={item.id}
                item={item}
                checked={isItemSelected(item.id)}
                onToggleSelection={setItemSelected}
                onIncrease={() => changeQty(item.id, 1)}
                onDecrease={() => changeQty(item.id, -1)}
                onRemove={() => removeItem(item.id)}
              />
            ))}
          </div>
        )}
      </div>

      <aside className="pm-shell p-5 md:sticky md:top-24 md:h-fit lg:p-6">
        <h2 className="text-4xl font-bold text-pmDeep">Order Summary</h2>
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
            <span>Rs {selectedSubtotal}</span>
          </div>
          <div className="flex justify-between">
            <span>Delivery</span>
            <span>Rs {delivery}</span>
          </div>
        </div>
        <div className="mt-4 border-t pt-4">
          <p className="flex justify-between text-3xl font-bold text-pmDeep">
            <span>Total</span>
            <span>Rs {checkoutTotal}</span>
          </p>
        </div>

        <Button
          className="pm-btn-primary mt-5 w-full disabled:cursor-not-allowed disabled:opacity-60"
          onClick={handleCheckout}
          disabled={isCheckingOut || selectedItems.length === 0}
        >
          {isCheckingOut ? "Processing..." : "Checkout Selected"}
        </Button>

        {items.length > 0 ? (
          <Button
            className="mt-3 w-full border border-pmAccent/45 bg-pmAccent/28 text-pmDeep hover:bg-pmAccent/45"
            onClick={clear}
            disabled={isCheckingOut}
          >
            Clear Cart
          </Button>
        ) : null}
      </aside>
      </div>
    </section>
  );
}
