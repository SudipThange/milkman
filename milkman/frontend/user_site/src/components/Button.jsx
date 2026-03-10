import { Children, isValidElement } from "react";
import { motion } from "framer-motion";
import {
  FiArrowRight,
  FiBox,
  FiCheckCircle,
  FiCreditCard,
  FiLogIn,
  FiLogOut,
  FiPackage,
  FiRefreshCw,
  FiShoppingBag,
  FiShoppingCart,
  FiTrash2,
  FiUserPlus,
} from "react-icons/fi";

function extractText(node) {
  if (typeof node === "string" || typeof node === "number") {
    return String(node);
  }

  if (Array.isArray(node)) {
    return node.map(extractText).join(" ");
  }

  if (isValidElement(node)) {
    return extractText(node.props?.children);
  }

  return "";
}

function resolveAutoIcon(label) {
  const normalized = label.trim().toLowerCase();
  if (!normalized) return null;

  if (normalized.includes("login")) return FiLogIn;
  if (normalized.includes("logout")) return FiLogOut;
  if (normalized.includes("register")) return FiUserPlus;
  if (normalized.includes("add to cart") || normalized.includes("checkout") || normalized.startsWith("cart")) return FiShoppingCart;
  if (normalized.includes("order")) return FiShoppingBag;
  if (normalized.includes("subscribe") || normalized.includes("subscription")) return FiPackage;
  if (normalized.includes("refresh") || normalized.includes("please wait") || normalized.includes("processing")) return FiRefreshCw;
  if (normalized.includes("payment")) return FiCreditCard;
  if (normalized.includes("remove") || normalized.includes("clear")) return FiTrash2;
  if (normalized.includes("product")) return FiBox;
  if (normalized.includes("confirm")) return FiCheckCircle;
  if (normalized.includes("explore")) return FiArrowRight;

  return null;
}

export default function Button({ children, className = "", icon, iconPosition = "left", ...props }) {
  const label = extractText(Children.toArray(children)).replace(/\s+/g, " ").trim();
  const Icon = icon === undefined ? resolveAutoIcon(label) : icon;

  return (
    <motion.button
      whileHover={{ y: -2, scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
      className={`inline-flex h-11 items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pmGold/70 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent ${className}`}
      {...props}
    >
      {Icon && iconPosition === "left" ? <Icon className="shrink-0 text-[1.05em]" aria-hidden="true" /> : null}
      {children}
      {Icon && iconPosition === "right" ? <Icon className="shrink-0 text-[1.05em]" aria-hidden="true" /> : null}
    </motion.button>
  );
}
