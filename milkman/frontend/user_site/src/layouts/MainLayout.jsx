import { Outlet, useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function MainLayout() {
  const location = useLocation();
  const isHome = location.pathname === "/";

  return (
    <div className={`${isHome ? "bg-ivory-palace" : "pm-page-gradient"} min-h-screen text-royal-brown`}>
      <Navbar />
      <main className={isHome ? "h-[calc(100svh-74px)] overflow-hidden md:h-[calc(100svh-80px)]" : ""}>
        <Outlet />
      </main>
    </div>
  );
}
