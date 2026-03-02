import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { motion } from "framer-motion";
import ProductCard from "../components/ProductCard";
import useAuth from "../hooks/useAuth";
import useCart from "../hooks/useCart";
import api from "../services/api";
import logoImage from "../assets/image/logo.png";

function extractQuantityFromName(name) {
  if (!name) return "";
  const match = name.match(/(\d+(?:\.\d+)?)\s*(ml|l|kg|g|gm|ltr|litre|litres)\b/i);
  return match ? match[0].replace(/\s+/g, "") : "";
}

function CategoryProductRow({ category, items, onAddToCart }) {
  const trackRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollState = () => {
    if (!trackRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = trackRef.current;
    const maxLeft = scrollWidth - clientWidth - 1;
    setCanScrollLeft(scrollLeft > 1);
    setCanScrollRight(scrollLeft < maxLeft);
  };

  const getSlideAmount = () => {
    if (!trackRef.current) return 320;
    return trackRef.current.clientWidth * 0.75;
  };

  const slideLeft = () => {
    if (!trackRef.current) return;
    trackRef.current.scrollBy({ left: -getSlideAmount(), behavior: "smooth" });
  };

  const slideRight = () => {
    if (!trackRef.current) return;
    trackRef.current.scrollBy({ left: getSlideAmount(), behavior: "smooth" });
  };

  const blockCategoryWheelScroll = (event) => {
    event.preventDefault();
    event.stopPropagation();
  };

  useEffect(() => {
    updateScrollState();
    const track = trackRef.current;
    if (!track) return;

    const onScroll = () => updateScrollState();
    const onResize = () => updateScrollState();

    track.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);

    return () => {
      track.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, [items.length]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className="rounded-3xl border border-white/45 bg-white/35 p-6 shadow-soft backdrop-blur-md"
    >
      <h2 className="mb-5 text-2xl font-bold text-white">{category}</h2>
      <div className="relative overflow-visible">
        <button
          type="button"
          onClick={slideLeft}
          disabled={!canScrollLeft}
          className={`absolute -left-4 top-1/2 z-10 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border shadow-lg backdrop-blur transition duration-300 ${
            canScrollLeft
              ? "border-pmGold/60 bg-pmDeep/95 text-white hover:scale-105 hover:bg-pmViolet"
              : "cursor-not-allowed border-white/20 bg-pmDeep/45 text-white/40"
          }`}
          aria-label={`scroll ${category} left`}
        >
          <FiChevronLeft className="text-lg" />
        </button>

        <button
          type="button"
          onClick={slideRight}
          disabled={!canScrollRight}
          className={`absolute right-1 top-1/2 z-10 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border shadow-lg backdrop-blur transition duration-300 ${
            canScrollRight
              ? "border-pmGold/60 bg-pmDeep/95 text-white hover:scale-105 hover:bg-pmViolet"
              : "cursor-not-allowed border-white/20 bg-pmDeep/45 text-white/40"
          }`}
          aria-label={`scroll ${category} right`}
        >
          <FiChevronRight className="text-lg" />
        </button>

        <motion.div
          ref={trackRef}
          onWheelCapture={blockCategoryWheelScroll}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.45, delay: 0.08 }}
          className="flex snap-x snap-mandatory items-stretch gap-5 overflow-x-hidden overflow-y-visible px-12 pb-2 scrollbar-hide"
        >
          {items.map((product) => (
            <motion.div
              key={`${category}-${product.id}`}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="snap-start h-full shrink-0 basis-[85%] sm:basis-[48%] lg:basis-[34%] xl:basis-[24%]"
            >
              <ProductCard product={product} onAddToCart={onAddToCart} />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.div>
  );
}

export default function Products() {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();
  const { addItem } = useCart();
  const [products, setProducts] = useState([]);
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
          quantity: extractQuantityFromName(product.name),
          price: product.price,
          category: categoryMap[product.category] || "Uncategorized",
          image: logoImage,
        }));

        setProducts(normalized);
      } catch {
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const groupedProducts = useMemo(() => {
    return products.reduce((acc, product) => {
      const categoryName = product.category || "Uncategorized";
      if (!acc[categoryName]) acc[categoryName] = [];
      acc[categoryName].push(product);
      return acc;
    }, {});
  }, [products]);

  const handleAddToCart = (product) => {
    if (!isLoggedIn) {
      navigate("/login", { state: { from: "/products" } });
      return;
    }
    addItem(product);
  };

  return (
    <section className="mx-auto max-w-7xl space-y-10 px-4 py-10 md:px-6">
      <motion.header
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.45 }}
        className="rounded-3xl border border-white/45 bg-white/45 p-6 shadow-soft backdrop-blur-md"
      >
        <h1 className="text-4xl font-bold text-pmDeep">Products</h1>
        <p className="mt-2 text-pmDeep/75">Explore category-wise dairy products.</p>
      </motion.header>

      {loading ? (
        <div className="rounded-2xl border border-white/45 bg-white/45 p-8 text-center text-pmDeep/70 shadow-soft backdrop-blur-md">
          Loading products...
        </div>
      ) : null}

      {!loading && Object.keys(groupedProducts).length === 0 ? (
        <div className="rounded-2xl border border-white/45 bg-white/45 p-8 text-center text-pmDeep/70 shadow-soft backdrop-blur-md">
          No products available right now.
        </div>
      ) : null}

      {Object.entries(groupedProducts).map(([category, items]) => (
        <CategoryProductRow
          key={category}
          category={category}
          items={items}
          onAddToCart={handleAddToCart}
        />
      ))}
    </section>
  );
}
