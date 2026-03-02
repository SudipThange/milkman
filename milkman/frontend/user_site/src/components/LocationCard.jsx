import { motion } from "framer-motion";

export default function LocationCard({ location, index = 0 }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 26 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.42, delay: index * 0.07 }}
      className="rounded-2xl border border-white/45 bg-white/58 p-5 shadow-md backdrop-blur transition hover:-translate-y-1 hover:shadow-lg"
    >
      <h3 className="text-xl font-bold text-pmDeep">{location.name}</h3>
      <p className="mt-1 text-sm text-pmDeep/60">Opened: {location.opened}</p>
      <p className="mt-3 text-sm text-pmDeep/80">{location.description}</p>
      <p className="mt-2 text-sm"><span className="font-semibold">Timing:</span> {location.timing}</p>
      <p className="mt-2 text-sm"><span className="font-semibold">Address:</span> {location.address}</p>
    </motion.article>
  );
}
