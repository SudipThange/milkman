import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import Button from "../components/Button";

const slides = [
  "https://images.unsplash.com/photo-1606791405792-1004f1718d0c?auto=format&fit=crop&w=2600&q=90",
  "https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&w=2600&q=90",
  "https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=2600&q=90",
];

export default function Home() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setActive((p) => (p + 1) % slides.length), 7000);
    return () => clearInterval(t);
  }, []);

  const current = useMemo(() => slides[active], [active]);

  return (
    <section className="relative min-h-screen overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          className="absolute inset-0 scale-105 bg-cover bg-center"
          style={{
            backgroundImage: `url(${current})`,
            filter: "blur(4px) brightness(0.55) saturate(0.9)",
          }}
          initial={{ opacity: 0.2 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0.2 }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
        />
      </AnimatePresence>

      <div className="absolute inset-0 bg-gradient-to-r from-pmDeep/95 via-pmViolet/82 to-pmDeep/78" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/45 to-black/60" />
      <div className="absolute inset-0 bg-black/30" />

      <div className="relative mx-auto flex min-h-screen max-w-7xl items-center px-4 md:px-6">
        <div className="max-w-2xl text-white [text-shadow:0_2px_14px_rgba(0,0,0,0.65)]">
          <p className="mb-3 inline-block rounded-full bg-white/20 px-3 py-1 text-sm">Farm Fresh | Pune</p>
          <h1 className="text-4xl font-bold leading-tight md:text-6xl">Fresh Milk Delivered Daily in Pune</h1>
          <p className="mt-5 text-lg text-white md:text-xl">
            Local farms, trusted quality, doorstep delivery every morning.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/products">
              <Button className="bg-pmAccent text-pmDeep shadow-soft">Explore Products</Button>
            </Link>
            <Link to="/subscription">
              <Button className="border border-pmGold bg-pmDeep/35 text-white backdrop-blur">Explore Subscriptions</Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
