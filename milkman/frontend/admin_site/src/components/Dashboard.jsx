import { useState } from "react";
import SideMenu from "./SideMenu";
import ResourcePanel from "./ResourcePanel";

export default function Dashboard({ token, adminInfo, onLogout }) {
  const [selected, setSelected] = useState("users");

  return (
    <div className="min-h-screen dashboard-bg px-2 px-lg-3 py-3 py-lg-4">
      <header className="bg-white rounded-4 shadow-sm px-3 px-lg-4 py-3 d-flex justify-content-between align-items-center mb-3">
        <div>
          <h1 className="m-0 fs-5 fw-bold text-pmBlue900">PuneMilkman Admin Site</h1>
          <small className="text-secondary">Logged in as {adminInfo?.email || "Admin"}</small>
        </div>
        <button className="btn btn-pm-outline" onClick={onLogout}>
          Logout
        </button>
      </header>

      <div className="dashboard-shell">
        <div className="menu-col">
          <SideMenu activeKey={selected} onSelect={setSelected} />
        </div>
        <div className="content-col">
          <ResourcePanel selected={selected} token={token} />
        </div>
      </div>
    </div>
  );
}
