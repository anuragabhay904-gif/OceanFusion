import { Activity, Waves } from "lucide-react";

interface HeaderProps {
  connected: boolean;
}

export default function Header({ connected }: HeaderProps) {
  return (
    <header className="topbar">
      <div className="brand">
        <div className="brand-mark">
          <Waves size={21} />
        </div>
        <div>
          <div className="brand-name">OceanFusion</div>
          <div className="brand-subtitle">Ocean intelligence platform</div>
        </div>
      </div>

      <div className="topbar-right">
        <div className={`connection-pill ${connected ? "online" : "offline"}`}>
          <span className="connection-dot" />
          <Activity size={14} />
          {connected ? "Backend connected" : "Backend offline"}
        </div>
      </div>
    </header>
  );
}
