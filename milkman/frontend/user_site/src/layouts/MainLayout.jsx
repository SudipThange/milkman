import { Outlet } from "react-router-dom";
import { useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function MainLayout() {
  const location = useLocation();
  const isHome = location.pathname === "/";

  return (
    <div className="pm-page-gradient min-h-screen text-pmDeep">
      <Navbar />
      <main className={isHome ? "pt-0" : "pt-20"}>
        <Outlet />
      </main>
    </div>
  );
}
