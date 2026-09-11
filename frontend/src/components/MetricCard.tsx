import type { LucideIcon } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: LucideIcon;
}

export default function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon
}: MetricCardProps) {
  return (
    <article className="metric-card">
      <div className="metric-icon">
        <Icon size={19} />
      </div>
      <div className="metric-copy">
        <span className="metric-title">{title}</span>
        <strong className="metric-value">{value}</strong>
        <span className="metric-subtitle">{subtitle}</span>
      </div>
    </article>
  );
}
