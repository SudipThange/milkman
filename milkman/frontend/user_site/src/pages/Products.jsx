import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FiChevronLeft, FiChevronRight, FiRotateCcw } from "react-icons/fi";
import ProductCard from "../components/ProductCard";
import useAuth from "../hooks/useAuth";
import useCart from "../hooks/useCart";
import api from "../services/api";
import logoImage from "../assets/image/logo.png";

const PRODUCTS_PER_PAGE = 9;

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

function shuffleItems(items) {
  const shuffled = [...items];
  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function buildPageItems(currentPage, totalPages) {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const pages = new Set([1, totalPages, currentPage, currentPage - 1, currentPage + 1]);
  if (currentPage <= 3) {
    pages.add(2);
    pages.add(3);
    pages.add(4);
  }
  if (currentPage >= totalPages - 2) {
    pages.add(totalPages - 1);
    pages.add(totalPages - 2);
    pages.add(totalPages - 3);
  }

  const sortedPages = [...pages].filter((page) => page >= 1 && page <= totalPages).sort((a, b) => a - b);
  const items = [];
  let previousPage = null;

  sortedPages.forEach((page) => {
    if (previousPage !== null && page - previousPage > 1) {
      items.push("ellipsis");
    }
    items.push(page);
    previousPage = page;
  });

  return items;
}

export default function Products() {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();
  const { addItem } = useCart();
  const [products, setProducts] = useState([]);
  const [shuffledProducts, setShuffledProducts] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [priceBounds, setPriceBounds] = useState({ min: 0, max: 0 });
  const [priceRange, setPriceRange] = useState({ min: 0, max: 0 });
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [productsRes, categoriesRes] = await Promise.all([
          api.get("/product/"),
          api.get("/category/"),
        ]);

        const categoryMap = {};
        categoriesRes.data.forEach((cat) => {
          categoryMap[cat.id] = cat.name;
        });

        const normalized = productsRes.data.map((product) => ({
          id: product.id,
          name: product.name,
          description: product.description,
          quantity: product.quantity || extractQuantityFromName(product.name),
          price: product.price,
          category: categoryMap[product.category] || "Uncategorized",
          image: resolveImageUrl(product.image_url || product.image),
        }));

        const priceValues = normalized
          .map((item) => Number(item.price))
          .filter((value) => Number.isFinite(value));

        const minPrice = priceValues.length ? Math.floor(Math.min(...priceValues)) : 0;
        const maxPrice = priceValues.length ? Math.ceil(Math.max(...priceValues)) : 0;

        setProducts(normalized);
        setShuffledProducts(shuffleItems(normalized));
        setPriceBounds({ min: minPrice, max: maxPrice });
        setPriceRange({ min: minPrice, max: maxPrice });
      } catch {
        setProducts([]);
        setShuffledProducts([]);
        setSelectedCategories([]);
        setPriceBounds({ min: 0, max: 0 });
        setPriceRange({ min: 0, max: 0 });
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const categoryOptions = useMemo(() => {
    const unique = new Set(products.map((product) => product.category || "Uncategorized"));
    return [...unique].sort((a, b) => a.localeCompare(b));
  }, [products]);

  const priceSpread = useMemo(() => {
    return Math.max(priceBounds.max - priceBounds.min, 1);
  }, [priceBounds.max, priceBounds.min]);

  const selectedMaxPercent = ((priceRange.max - priceBounds.min) / priceSpread) * 100;

  const filteredProducts = useMemo(() => {
    const showShuffled = selectedCategories.length === 0;
    const source = showShuffled ? shuffledProducts : products;

    return source.filter((product) => {
      const productPrice = Number(product.price);
      const withinPrice = Number.isFinite(productPrice)
        ? productPrice >= priceBounds.min && productPrice <= priceRange.max
        : true;
      const categoryMatch = showShuffled || selectedCategories.includes(product.category);
      return withinPrice && categoryMatch;
    });
  }, [products, shuffledProducts, selectedCategories, priceBounds.min, priceRange.max]);

  const totalPages = useMemo(() => {
    if (filteredProducts.length === 0) return 0;
    return Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE);
  }, [filteredProducts.length]);

  const paginatedProducts = useMemo(() => {
    if (filteredProducts.length === 0) return [];
    const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE;
    return filteredProducts.slice(startIndex, startIndex + PRODUCTS_PER_PAGE);
  }, [filteredProducts, currentPage]);

  const pageItems = useMemo(() => {
    if (totalPages <= 1) return [];
    return buildPageItems(currentPage, totalPages);
  }, [currentPage, totalPages]);

  const pageStart = filteredProducts.length === 0 ? 0 : (currentPage - 1) * PRODUCTS_PER_PAGE + 1;
  const pageEnd = Math.min(currentPage * PRODUCTS_PER_PAGE, filteredProducts.length);
  const showingRangeLabel = filteredProducts.length === 0 ? "0" : `${pageStart}-${pageEnd}`;

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategories, priceRange.max]);

  useEffect(() => {
    if (totalPages > 0 && currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const handleCategoryToggle = (categoryName) => {
    setSelectedCategories((previous) =>
      previous.includes(categoryName)
        ? previous.filter((item) => item !== categoryName)
        : [...previous, categoryName]
    );
  };

  const clearCategorySelection = () => {
    setSelectedCategories([]);
  };

  const resetPriceRange = () => {
    setPriceRange({ min: priceBounds.min, max: priceBounds.max });
  };

  const onMaxPriceChange = (event) => {
    const nextMax = Number(event.target.value);
    setPriceRange((previous) => ({
      ...previous,
      max: Math.max(nextMax, priceBounds.min),
    }));
  };

  const handleAddToCart = (product) => {
    if (!isLoggedIn) {
      navigate("/login", { state: { from: "/products" } });
      return;
    }
    addItem(product);
  };

  return (
    <section className="mx-auto max-w-7xl space-y-8 px-4 py-10 md:px-6">
      <motion.header
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.45 }}
        className="pm-shell p-6"
      >
        <h1 className="pm-section-title">Products</h1>
        <p className="pm-section-subtitle">Explore category-wise dairy products.</p>
      </motion.header>

      {loading ? (
        <div className="pm-shell p-8 text-center text-pmDeep/70">
          Loading products...
        </div>
      ) : null}

      {!loading && products.length === 0 ? (
        <div className="pm-shell p-8 text-center text-pmDeep/70">
          No products available right now.
        </div>
      ) : null}

      {!loading && products.length > 0 ? (
        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          <aside className="pm-shell h-fit p-5 lg:sticky lg:top-24">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-pmDeep">Filters</h2>
              <button
                type="button"
                onClick={() => {
                  clearCategorySelection();
                  resetPriceRange();
                }}
                className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-pmViolet hover:text-pmDeep"
              >
                <FiRotateCcw className="text-sm" aria-hidden="true" />
                Clear All
              </button>
            </div>

            <div className="border-b border-pmDeep/15 pb-6">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-bold uppercase tracking-wide text-pmDeep">Category</h3>
                <span className="text-xs font-semibold text-pmDeep/70">{selectedCategories.length} selected</span>
              </div>

              <div className="max-h-64 space-y-2 overflow-y-auto pr-1">
                {categoryOptions.map((categoryName) => {
                  const checked = selectedCategories.includes(categoryName);
                  return (
                    <label
                      key={categoryName}
                      className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-1.5 text-sm text-pmDeep transition hover:bg-white/45"
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => handleCategoryToggle(categoryName)}
                        className="peer sr-only"
                      />
                      <span className="inline-flex h-6 w-6 items-center justify-center rounded-lg border border-pmViolet/35 bg-white/80 text-sm font-bold leading-none text-transparent transition peer-checked:border-pmViolet peer-checked:bg-pmViolet peer-checked:text-white peer-focus-visible:ring-2 peer-focus-visible:ring-pmViolet/35 peer-focus-visible:ring-offset-1">
                        &#10003;
                      </span>
                      <span className="font-medium">{categoryName}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="pt-6">
              <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-pmDeep">Price</h3>
              <p className="mb-4 text-xs text-pmDeep/70">
                Start: Rs {priceBounds.min} | End: Rs {priceBounds.max}
              </p>

              <div className="relative mb-5 h-2 rounded-full bg-pmDeep/15">
                <div
                  className="absolute h-2 rounded-full bg-pmViolet"
                  style={{
                    left: "0%",
                    width: `${Math.max(selectedMaxPercent, 0)}%`,
                  }}
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-pmDeep/75">Price Limit</label>
                <input
                  type="range"
                  min={priceBounds.min}
                  max={priceBounds.max}
                  value={priceRange.max}
                  onChange={onMaxPriceChange}
                  className="w-full accent-pmViolet"
                />
              </div>

              <div className="mt-4 rounded-xl border border-pmDeep/15 bg-white/65 p-3 text-sm text-pmDeep/80">
                <p>
                  Rs {priceBounds.min} - Rs {priceRange.max}
                </p>
              </div>
            </div>
          </aside>

          <div className="space-y-4">
            <div className="pm-shell flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm font-semibold text-pmDeep/75">
                Showing{" "}
                <span className="text-pmDeep">
                  {showingRangeLabel}
                </span>{" "}
                of <span className="text-pmDeep">{filteredProducts.length}</span> products
              </p>
              <p className="text-xs font-semibold uppercase tracking-wide text-pmViolet">
                {selectedCategories.length === 0 ? "All categories shuffled" : "Filtered by category"}
              </p>
            </div>

            {filteredProducts.length === 0 ? (
              <div className="pm-shell p-8 text-center text-pmDeep/70">
                No products found for the selected filters.
              </div>
            ) : (
              <div className="grid items-start gap-4 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
                {paginatedProducts.map((product) => (
                  <div key={product.id}>
                    <ProductCard product={product} onAddToCart={handleAddToCart} />
                  </div>
                ))}
              </div>
            )}

            {totalPages > 1 ? (
              <div className="pm-shell flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm font-semibold text-pmDeep/80">
                  Page <span className="text-pmDeep">{currentPage}</span> of{" "}
                  <span className="text-pmDeep">{totalPages}</span>
                </p>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setCurrentPage((previous) => Math.max(previous - 1, 1))}
                    disabled={currentPage === 1}
                    className="inline-flex h-10 items-center gap-1 rounded-xl border border-pmDeep/20 bg-white/70 px-3 text-sm font-semibold text-pmDeep transition hover:border-pmViolet/60 hover:bg-white disabled:cursor-not-allowed disabled:opacity-45"
                  >
                    <FiChevronLeft className="text-base" aria-hidden="true" />
                    Prev
                  </button>

                  {pageItems.map((item, index) =>
                    item === "ellipsis" ? (
                      <span key={`ellipsis-${index}`} className="px-1 text-sm font-semibold text-pmDeep/55">
                        ...
                      </span>
                    ) : (
                      <button
                        key={`page-${item}`}
                        type="button"
                        onClick={() => setCurrentPage(item)}
                        className={`inline-flex h-10 min-w-10 items-center justify-center rounded-xl border text-sm font-semibold transition ${
                          item === currentPage
                            ? "border-pmViolet bg-pmViolet text-white shadow-soft"
                            : "border-pmDeep/20 bg-white/70 text-pmDeep hover:border-pmViolet/60 hover:bg-white"
                        }`}
                        aria-current={item === currentPage ? "page" : undefined}
                      >
                        {item}
                      </button>
                    )
                  )}

                  <button
                    type="button"
                    onClick={() => setCurrentPage((previous) => Math.min(previous + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="inline-flex h-10 items-center gap-1 rounded-xl border border-pmDeep/20 bg-white/70 px-3 text-sm font-semibold text-pmDeep transition hover:border-pmViolet/60 hover:bg-white disabled:cursor-not-allowed disabled:opacity-45"
                  >
                    Next
                    <FiChevronRight className="text-base" aria-hidden="true" />
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </section>
  );
}
