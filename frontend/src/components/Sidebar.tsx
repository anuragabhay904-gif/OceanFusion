import { Database, Fish, LayoutDashboard, Map } from "lucide-react";

export type View = "overview" | "explore" | "biodiversity";

interface SidebarProps {
  active: View;
  onChange: (view: View) => void;
}

const items: Array<{
  id: View;
  label: string;
  description: string;
  icon: typeof LayoutDashboard;
}> = [
  {
    id: "overview",
    label: "Overview",
    description: "Platform dashboard",
    icon: LayoutDashboard
  },
  {
    id: "explore",
    label: "Explore",
    description: "ARGO observations",
    icon: Map
  },
  {
    id: "biodiversity",
    label: "Biodiversity",
    description: "eDNA intelligence",
    icon: Fish
  }
];

export default function Sidebar({ active, onChange }: SidebarProps) {
  return (
    <aside className="sidebar">
      <div className="sidebar-section-title">WORKSPACE</div>

      <nav className="sidebar-nav">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              className={`nav-item ${active === item.id ? "active" : ""}`}
              onClick={() => onChange(item.id)}
            >
              <span className="nav-icon">
                <Icon size={18} />
              </span>
              <span className="nav-copy">
                <strong>{item.label}</strong>
                <small>{item.description}</small>
              </span>
            </button>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <div className="system-card">
          <Database size={16} />
          <div>
            <strong>Data sources</strong>
            <span>ARGO + eDNA</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
