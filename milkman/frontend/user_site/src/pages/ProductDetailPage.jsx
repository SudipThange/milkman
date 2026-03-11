import { useEffect, useMemo, useRef, useState } from "react";
import { FiArrowLeft } from "react-icons/fi";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import Button from "../components/Button";
import useAuth from "../hooks/useAuth";
import useCart from "../hooks/useCart";
import logoImage from "../assets/image/logo.png";
import api from "../services/api";
import { addProductToCart } from "../services/cart";
import { getApiErrorMessage } from "../utils/apiError";

function resolveImageUrl(imagePath) {
  if (!imagePath) return logoImage;
  if (/^https?:\/\//i.test(imagePath)) return imagePath;

  const apiBase = api.defaults.baseURL || "";
  if (!apiBase) return imagePath;

  const normalizedBase = apiBase.endsWith("/") ? apiBase.slice(0, -1) : apiBase;
  const normalizedPath = imagePath.startsWith("/") ? imagePath : `/${imagePath}`;
  return `${normalizedBase}${normalizedPath}`;
}

function extractQuantityFromName(name) {
  if (!name) return "";
  const match = name.match(/(\d+(?:\.\d+)?)\s*(ml|l|kg|g|gm|ltr|litre|litres)\b/i);
  return match ? match[0].replace(/\s+/g, "") : "";
}

export default function ProductDetailPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { productId } = useParams();
  const { isLoggedIn } = useAuth();
  const { addItem } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [addToCartMessage, setAddToCartMessage] = useState("");
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const autoAddAttemptedRef = useRef(false);

  const searchParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const shouldAutoAdd = searchParams.get("addToCart") === "true";

  const previousPage = useMemo(() => {
    const statePage = Number(location.state?.page);
    if (Number.isInteger(statePage) && statePage > 0) return statePage;

    const queryPage = Number(searchParams.get("page"));
    if (Number.isInteger(queryPage) && queryPage > 0) return queryPage;

    return 1;
  }, [location.state, searchParams]);

  useEffect(() => {
    const loadProduct = async () => {
      setLoading(true);
      setError("");

      try {
        const [productsRes, categoriesRes] = await Promise.all([
          api.get("/product/"),
          api.get("/category/"),
        ]);

        const categoryMap = {};
        categoriesRes.data.forEach((cat) => {
          categoryMap[cat.id] = cat.name;
        });

        const idAsNumber = Number(productId);
        const productRecord = productsRes.data.find((item) => Number(item.id) === idAsNumber);

        if (!productRecord) {
          setProduct(null);
          setError("Product not found.");
          return;
        }

        setProduct({
          id: productRecord.id,
          name: productRecord.name,
          description: productRecord.description,
          quantity: productRecord.quantity || extractQuantityFromName(productRecord.name),
          price: productRecord.price,
          category: categoryMap[productRecord.category] || "Uncategorized",
          image: resolveImageUrl(productRecord.image_url || productRecord.image),
        });
      } catch {
        setProduct(null);
        setError("Unable to load product details right now.");
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [productId]);

  const navigateToLoginForResume = () => {
    const redirectPath = `/product/${productId}`;
    const query = `redirect=${encodeURIComponent(redirectPath)}&addToCart=true&page=${previousPage}`;
    navigate(`/login?${query}`);
  };

  const handleAddToCart = async () => {
    if (!product) return false;

    setError("");
    setAddToCartMessage("");

    if (!isLoggedIn) {
      navigateToLoginForResume();
      return false;
    }

    setIsAddingToCart(true);

    try {
      await addProductToCart(product.id, 1);
      addItem(product);
      setAddToCartMessage("Product added to cart successfully.");
      return true;
    } catch (apiError) {
      setError(getApiErrorMessage(apiError, "Failed to add product to cart."));
      return false;
    } finally {
      setIsAddingToCart(false);
    }
  };

  useEffect(() => {
    if (!shouldAutoAdd || !isLoggedIn || !product || autoAddAttemptedRef.current) {
      return;
    }

    autoAddAttemptedRef.current = true;

    const runAutoAdd = async () => {
      const added = await handleAddToCart();
      if (added) {
        navigate(`/product/${product.id}?page=${previousPage}`, {
          replace: true,
          state: { page: previousPage },
        });
      }
    };

    runAutoAdd();
  }, [shouldAutoAdd, isLoggedIn, product, navigate, previousPage]);

  return (
    <section className="mx-auto max-w-7xl space-y-6 px-4 py-10 md:px-6">
      <div className="pdp-back-button-wrap">
        <button
          type="button"
          onClick={() => navigate("/products", { state: { page: previousPage } })}
          className="pdp-back-button"
        >
          <FiArrowLeft className="text-lg" aria-hidden="true" />
          Back
        </button>
      </div>

      {loading ? <div className="pm-shell p-8 text-center text-pmDeep/70">Loading product details...</div> : null}

      {!loading && error ? <div className="pm-shell p-6 text-sm text-red-800">{error}</div> : null}

      {!loading && product ? (
        <div className="pm-shell pdp-layout-shell">
          <div className="pdp-layout-grid">
            <div className="pdp-image-section">
              <div className="pdp-image-container">
                <div className="pdp-image-surface">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="pdp-product-image"
                    onError={(event) => {
                      event.currentTarget.src = logoImage;
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="pdp-details-section">
              <span className="pdp-category-badge">{product.category}</span>
              <h1 className="pdp-product-title">{product.name}</h1>
              <p className="pdp-product-price">Rs {product.price}</p>
              <p className="pdp-product-quantity">Quantity: {product.quantity || "N/A"}</p>

              <div className="pdp-description-box">
                {product.description || "No description available."}
              </div>

              {addToCartMessage ? (
                <p className="pdp-success-message">
                  {addToCartMessage}
                </p>
              ) : null}

              <Button
                className="pm-btn-primary pdp-add-to-cart-button disabled:cursor-not-allowed disabled:opacity-60"
                onClick={handleAddToCart}
                disabled={isAddingToCart}
              >
                {isAddingToCart ? "Adding..." : "Add to Cart"}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
