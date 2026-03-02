import { motion } from "framer-motion";
import Button from "./Button";

export default function ProductCard({ product, onAddToCart }) {
  return (
    <motion.article
      whileHover={{ y: -8 }}
      transition={{ duration: 0.22 }}
      className="relative flex h-full min-h-[350px] cursor-pointer flex-col rounded-3xl border border-white/45 bg-white/60 p-6 shadow-md backdrop-blur-md transition duration-300"
    >
      <img
        src={product.image}
        alt={product.name}
        className="h-36 w-full rounded-xl bg-white/85 object-cover"
      />
      <h3 className="mt-4 min-h-[64px] text-2xl font-bold leading-tight text-pmDeep">{product.name}</h3>
      <p className="mt-2 min-h-[64px] overflow-hidden text-sm text-pmDeep/70">
        {product.description || "Fresh dairy product from trusted local farms."}
      </p>
      <p className="mt-2 text-sm text-pmDeep/80">
        <span className="font-semibold">Quantity:</span> {product.quantity || "N/A"}
      </p>

      <div className="mt-auto pt-5">
        <p className="text-3xl font-bold text-pmViolet">INR {product.price}</p>
        <Button
          className="mt-5 w-full border border-pmDeep bg-pmDeep text-white shadow-md hover:bg-pmViolet"
          onClick={() => onAddToCart?.(product)}
        >
          Add to Cart
        </Button>
      </div>
    </motion.article>
  );
}
