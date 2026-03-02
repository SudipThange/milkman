import { motion } from "framer-motion";
import LocationCard from "../components/LocationCard";

const locations = [
  {
    name: "Balewadi",
    opened: "2018",
    description: "Hub serving premium households with early morning chilled dispatch.",
    timing: "6:00 AM - 10:00 PM",
    address: "Near High Street, Balewadi, Pune",
  },
  {
    name: "Pashan",
    opened: "2019",
    description: "Focused on local farm sourcing with daily route optimization.",
    timing: "6:00 AM - 9:30 PM",
    address: "Pashan Gaon Road, Pune",
  },
  {
    name: "Kothrud",
    opened: "2020",
    description: "High-demand fulfillment center for families and retail points.",
    timing: "5:30 AM - 10:30 PM",
    address: "Near Paud Road, Kothrud, Pune",
  },
  {
    name: "Hinjewadi",
    opened: "2022",
    description: "Corporate cluster support with flexible subscription schedules.",
    timing: "6:30 AM - 11:00 PM",
    address: "Phase 1, Hinjewadi IT Park, Pune",
  },
];

export default function About() {
  return (
    <section className="mx-auto max-w-7xl space-y-8 px-4 py-10 md:px-6">
      <motion.header
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.45 }}
        className="rounded-3xl border border-white/45 bg-white/45 p-8 text-center shadow-soft backdrop-blur-md"
      >
        <p className="text-sm uppercase tracking-[0.2em] text-pmDeep/60">About</p>
        <h1 className="mt-3 text-4xl font-bold">About PuneMilkman</h1>
        <p className="mx-auto mt-4 max-w-3xl text-pmDeep/80">
          PuneMilkman partners with nearby dairy farms to deliver fresh, hygienic milk and dairy essentials daily.
          Our sourcing model supports local farmers across Pune while maintaining strict cold-chain handling,
          quality checks, and predictable doorstep deliveries for households.
        </p>
      </motion.header>

      <motion.div
        id="locations"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{ duration: 0.5 }}
        className="rounded-3xl border border-white/45 bg-white/40 p-6 shadow-soft backdrop-blur-md"
      >
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-3xl font-bold">Our Locations</h2>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {locations.map((location, index) => (
            <LocationCard key={location.name} location={location} index={index} />
          ))}
        </div>
      </motion.div>
    </section>
  );
}
