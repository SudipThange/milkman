import { motion } from "framer-motion";

export default function Button({ children, className = "", ...props }) {
  return (
    <motion.button
      whileHover={{ y: -2, scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
      className={`rounded-full px-5 py-2.5 font-semibold transition ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  );
}
