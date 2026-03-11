import Button from "./Button";
import { FiEye } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import logoImage from "../assets/image/logo.png";

export default function ProductCard({ product, onAddToCart, currentPage = 1 }) {
  const navigate = useNavigate();
  const quantityLabel = (product.quantity || "").trim() || "N/A";
  const categoryLabel = (product.category || "").trim() || "Uncategorized";

  const openProductDetail = () => {
    navigate(`/product/${product.id}`, { state: { page: currentPage } });
  };

  return (
    <article className="pm-card-base pm-product-card relative flex h-fit flex-col self-start p-3">
      <div className="mb-2.5 flex items-start justify-between gap-2">
        <span className="rounded-full border border-pmDeep/30 bg-pmDeep/10 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-pmDeep/90">
          {categoryLabel}
        </span>
        <div className="flex items-center gap-2">
          <span className="rounded-full border border-pmDeep/30 bg-white/90 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-pmDeep/90">
            {quantityLabel}
          </span>
          <button
            type="button"
            onClick={openProductDetail}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-pmViolet/40 bg-white/90 text-pmDeep transition hover:border-pmViolet hover:bg-pmViolet hover:text-white"
            aria-label={`View details for ${product.name}`}
          >
            <FiEye className="text-sm" aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="h-[210px] w-full overflow-hidden rounded-2xl border border-white/70 bg-white/85">
        <img
          src={product.image}
          alt={product.name}
          className="h-full w-full object-fill"
          loading="lazy"
          decoding="async"
          onError={(event) => {
            event.currentTarget.src = logoImage;
          }}
        />
      </div>

      <h3
        className="mt-2 text-lg font-bold leading-tight text-pmDeep"
        style={{
          minHeight: "28px",
          display: "-webkit-box",
          WebkitLineClamp: 1,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}
      >
        {product.name}
      </h3>

      <div className="mt-2 grid grid-cols-2 gap-2 rounded-xl bg-white/65 p-2 text-[11px] text-pmDeep/90">
        <p className="truncate whitespace-nowrap">
          <span className="font-semibold">Category:</span> {categoryLabel}
        </p>
        <p className="truncate whitespace-nowrap">
          <span className="font-semibold">Qty:</span> {quantityLabel}
        </p>
      </div>

      <div className="mt-2">
        <p className="mt-2.5 text-xl font-bold text-pmViolet">Rs {product.price}</p>
        <Button
          className="pm-btn-primary mt-2.5 w-full"
          onClick={() => onAddToCart?.(product)}
        >
          Add to Cart
        </Button>
      </div>
    </article>
  );
}
