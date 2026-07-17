import { formatNumber } from "@/lib/format";

interface MetricCardProps {
  label: string;
  value: number;
  tone?: "default" | "good" | "warn";
}

export function MetricCard({ label, value, tone = "default" }: MetricCardProps) {
  const color =
    tone === "good" ? "var(--success)" : tone === "warn" ? "var(--warning)" : "var(--ink)";

  return (
    <div className="metric-card">
      <div className="metric-value" style={{ color }}>
        {formatNumber(value)}
      </div>
      <div className="metric-label">{label}</div>
    </div>
  );
}
