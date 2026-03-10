import { useEffect, useState } from "react";
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
  const [isScrolled, setIsScrolled] = useState(false);
  const { isLoggedIn, logout } = useAuth();
  const { count } = useCart();
  const location = useLocation();
  const navigate = useNavigate();
  const navItems = baseNavItems;

  const headerClasses = isScrolled
    ? "overflow-hidden border-b border-softGray bg-paperWhite"
    : "overflow-hidden border-b border-softGray bg-paperWhite";
  const brandText = "text-pmDeep";
  const subtitleText = "text-coolGray";
  const navText = "text-pmDeep/80";
  const navActiveText = "text-freshCoral";
  const actionBtn = "pm-btn-secondary min-w-[96px]";
  const ordersBtn = "pm-btn-secondary";
  const cartBtn = "relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-softGray bg-milkBlueLight text-pmDeep hover:bg-pastelCream";

  const handleLogout = async () => {
    try {
      await logoutRequest(api);
    } finally {
      logout();
      setOpen(false);
      navigate("/", { replace: true });
    }
  };

  useEffect(() => {
    const onScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={`sticky top-0 z-[1000] transition-all duration-300 ${headerClasses}`}>
      <nav className="mx-auto flex h-[74px] max-w-6xl items-center justify-between px-4 md:h-[80px] md:px-5">
        <Link to="/" className="flex items-center gap-3">
          {useFallbackLogo ? (
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-milkBlue ring-2 ring-white/45 md:h-11 md:w-11">
              <span className="text-xs font-extrabold text-white">PM</span>
            </div>
          ) : (
            <img
              src={logoImage}
              alt="PuneMilkman logo"
              className="h-10 w-10 rounded-full bg-white/95 object-cover ring-2 ring-white/45 md:h-11 md:w-11"
              onError={() => setUseFallbackLogo(true)}
            />
          )}
          <div>
            <p className={`text-[1.7rem] font-extrabold tracking-tight ${brandText}`}>PuneMilkman</p>
            <p className={`text-xs ${subtitleText}`}>Pune, Maharashtra</p>
          </div>
        </Link>

        <div className="hidden items-center gap-7 md:flex">
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
                  `pm-nav-link ${activeFlag || isActive ? `active ${navActiveText}` : navText}`
                }
              >
                {item.label}
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
                  <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-freshCoral px-1 text-xs font-bold text-white">
                    {count}
                  </span>
                ) : null}
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-softGray bg-milkBlueLight text-pmDeep transition hover:bg-pastelCream"
                aria-label="logout"
              >
                <FiLogOut />
              </button>
            </div>
          )}
        </div>

        <button className="rounded-xl border border-softGray bg-milkBlueLight p-2 text-pmDeep transition hover:bg-pastelCream md:hidden" onClick={() => setOpen((v) => !v)} aria-label="menu toggle">
          {open ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>
      </nav>

      {open ? (
        <div className="border-t border-softGray bg-paperWhite px-4 pb-4 pt-3 md:hidden">
          <div className="flex flex-col gap-3">
            {navItems.map((item) => (
              <Link
                key={item.label}
                to={item.to}
                onClick={() => setOpen(false)}
                className="rounded-lg px-1 py-1.5 text-sm font-medium text-pmDeep/90"
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
