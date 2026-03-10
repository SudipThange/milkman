import { Link } from "react-router-dom";
import Button from "../components/Button";
import heroBackground from "../assets/bg_images/1751455.jpg";

export default function Home() {
  return (
    <section className="relative h-full overflow-hidden">
      <div
        className="absolute inset-0 scale-105 bg-cover bg-center"
        style={{
          backgroundImage: `url(${heroBackground})`,
          filter: "blur(2px) brightness(0.76) saturate(0.95)",
        }}
      />

      <div className="absolute inset-0 bg-gradient-to-br from-milkBlueLight/58 via-pastelCream/42 to-paperWhite/34" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/76 via-black/42 to-black/8" />
      <div className="absolute inset-0 bg-gradient-to-r from-deepDairyBlue/60 via-deepDairyBlue/24 to-transparent" />

      <div className="relative mx-auto flex h-full max-w-7xl items-center px-4 md:px-6">
        <div className="max-w-2xl text-white [text-shadow:0_2px_14px_rgba(0,0,0,0.5)]">
          <p className="mb-3 inline-block rounded-full bg-white/20 px-3 py-1 text-sm">Farm Fresh | Pune</p>
          <h1 className="text-4xl font-bold leading-tight md:text-6xl">Fresh Milk Delivered Daily in Pune</h1>
          <p className="mt-5 text-lg text-white md:text-xl">
            Local farms, trusted quality, doorstep delivery every morning.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/products">
              <Button className="bg-freshCoral text-white shadow-soft">Explore Products</Button>
            </Link>
            <Link to="/subscription">
              <Button className="border border-milkBlue bg-milkBlue text-white">Explore Subscriptions</Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
