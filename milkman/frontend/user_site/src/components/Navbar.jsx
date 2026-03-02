import { useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { FiLogOut, FiMenu, FiShoppingCart, FiX } from "react-icons/fi";
import Button from "./Button";
import useAuth from "../hooks/useAuth";
import api from "../services/api";
import { logoutRequest } from "../services/auth";
import useCart from "../hooks/useCart";
import logoImage from "../assets/image/logo.png";

const baseNavItems = [
  { label: "Home", to: "/" },
  { label: "About Us", to: "/about" },
  { label: "Products", to: "/products" },
  { label: "Subscription", to: "/subscription" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [useFallbackLogo, setUseFallbackLogo] = useState(false);
  const { isLoggedIn, logout } = useAuth();
  const { count } = useCart();
  const location = useLocation();
  const navigate = useNavigate();
  const navItems = baseNavItems;

  const headerClasses =
    "bg-gradient-to-r from-pmDeep/96 via-[#5a248f]/95 to-[#7f5a7a]/95 border-b border-pmGold/30 shadow-[0_8px_24px_rgba(28,6,58,0.45)] backdrop-blur-xl";
  const brandText = "text-white";
  const subtitleText = "text-white/80";
  const navText = "text-white/85";
  const navActiveText = "text-white";
  const underlineColor = "bg-pmGold";
  const actionBtn = "border border-white/45 bg-white/10 text-white backdrop-blur hover:bg-white/20";
  const ordersBtn = "border border-white/45 bg-white/10 text-white backdrop-blur hover:bg-white/20";
  const cartBtn = "relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/50 bg-white/10 text-white hover:bg-white/20";

  const handleLogout = async () => {
    try {
      await logoutRequest(api);
    } finally {
      logout();
      setOpen(false);
      navigate("/", { replace: true });
    }
  };

  return (
    <header className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${headerClasses}`}>
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-6">
        <Link to="/" className="flex items-center gap-3">
          {useFallbackLogo ? (
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-pmDeep to-pmViolet ring-2 ring-pmGold/45">
              <span className="text-xs font-extrabold text-white">PM</span>
            </div>
          ) : (
            <img
              src={logoImage}
              alt="PuneMilkman logo"
              className="h-11 w-11 rounded-full bg-white/95 object-cover ring-2 ring-pmGold/45"
              onError={() => setUseFallbackLogo(true)}
            />
          )}
          <div>
            <p className={`text-lg font-bold ${brandText}`}>PuneMilkman</p>
            <p className={`text-xs ${subtitleText}`}>Pune, Maharashtra</p>
          </div>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {navItems.map((item) => {
            const isHashLocation = item.to.includes("#");
            const isActive = isHashLocation
              ? location.pathname === item.to.split("#")[0]
              : undefined;

            return (
              <NavLink
                key={item.label}
                to={item.to}
                className={({ isActive: activeFlag }) =>
                  `group relative font-medium ${navText} ${activeFlag || isActive ? navActiveText : ""}`
                }
              >
                {item.label}
                <span className={`absolute -bottom-1 left-0 h-0.5 w-0 ${underlineColor} transition-all group-hover:w-full`} />
              </NavLink>
            );
          })}
        </div>

        <div className="hidden md:block">
          {!isLoggedIn ? (
            <Link to="/login">
              <Button className={actionBtn}>Login</Button>
            </Link>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/your-subscriptions">
                <Button className={ordersBtn}>Your Subscription</Button>
              </Link>
              <Link to="/orders">
                <Button className={ordersBtn}>Your Orders</Button>
              </Link>
              <Link to="/cart" className={cartBtn}>
                <FiShoppingCart />
                {count > 0 ? (
                  <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-pmAccent px-1 text-xs font-bold text-pmDeep">
                    {count}
                  </span>
                ) : null}
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/45 bg-white/10 text-white transition hover:bg-white/20"
                aria-label="logout"
              >
                <FiLogOut />
              </button>
            </div>
          )}
        </div>

        <button className="md:hidden" onClick={() => setOpen((v) => !v)} aria-label="menu toggle">
          {open ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>
      </nav>

      {open ? (
        <div className="border-t border-white/20 bg-pmDeep/85 px-4 pb-4 pt-2 backdrop-blur-md md:hidden">
          <div className="flex flex-col gap-3">
            {navItems.map((item) => (
              <Link
                key={item.label}
                to={item.to}
                onClick={() => setOpen(false)}
                className="font-medium text-white/90"
              >
                {item.label}
              </Link>
            ))}
            {!isLoggedIn ? (
              <Link to="/login" onClick={() => setOpen(false)}>
                <Button className={`w-full ${actionBtn}`}>Login</Button>
              </Link>
            ) : (
              <div className="grid grid-cols-1 gap-2">
                <Link to="/cart" onClick={() => setOpen(false)}>
                  <Button className={`w-full ${actionBtn}`}>Cart ({count})</Button>
                </Link>
                <Link to="/orders" onClick={() => setOpen(false)}>
                  <Button className={`w-full ${actionBtn}`}>Your Orders</Button>
                </Link>
                <Link to="/your-subscriptions" onClick={() => setOpen(false)}>
                  <Button className={`w-full ${actionBtn}`}>Your Subscription</Button>
                </Link>
                <Button className={`w-full ${actionBtn}`} onClick={handleLogout}>Logout</Button>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </header>
  );
}
