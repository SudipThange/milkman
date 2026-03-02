import {
  HiOutlineUsers,
  HiOutlineTag,
  HiOutlineCube,
  HiOutlineTicket,
  HiOutlineUserGroup,
  HiOutlineShoppingCart,
  HiOutlineClipboardDocumentList,
} from "react-icons/hi2";

const MENU_ITEMS = [
  { key: "users", label: "Users", icon: HiOutlineUsers },
  { key: "category", label: "Category", icon: HiOutlineTag },
  { key: "products", label: "Products", icon: HiOutlineCube },
  { key: "subscription", label: "Subscription", icon: HiOutlineTicket },
  { key: "subscribers", label: "Subscribers", icon: HiOutlineUserGroup },
  { key: "orders", label: "Orders", icon: HiOutlineShoppingCart },
  { key: "order_items", label: "Orders Item", icon: HiOutlineClipboardDocumentList },
];

export default function SideMenu({ activeKey, onSelect }) {
  return (
    <aside className="menu-panel p-3 p-lg-4">
      <h2 className="fw-bold fs-4 mb-4 text-white">Admin Options</h2>
      <div className="d-flex flex-column gap-2">
        {MENU_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = activeKey === item.key;
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => onSelect(item.key)}
              className={`menu-btn d-flex align-items-center gap-2 text-start ${active ? "active" : ""}`}
            >
              <Icon className="menu-icon" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </aside>
  );
}
