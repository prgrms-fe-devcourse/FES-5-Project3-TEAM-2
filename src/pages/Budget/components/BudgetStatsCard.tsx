import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
  type PieLabelRenderProps,
} from "recharts";

type Item = { name: string; value: number; color?: string };

interface Props {
  title?: string;
  totalLabel?: string;
  data?: Item[];
  colors?: string[];
  height?: number;
}

const defaultColors = ["#FF8E9E", "#F9B5D0", "#8ACCD5", "#51ACB8", "#D1D1D1"];
const RADIAN = Math.PI / 180;

function formatWon(n: number) {
  return `${n.toLocaleString()}원`;
}

// 커스텀 라벨: Pie가 주는 percent(0~1)를 사용
const renderLabel = ({
  cx = 0,
  cy = 0,
  midAngle = 0,
  innerRadius = 0,
  outerRadius = 0,
  percent = 0,
}: PieLabelRenderProps): React.ReactNode => {
  const r =
    Number(innerRadius ?? 0) +
    (Number(outerRadius ?? 0) - Number(innerRadius ?? 0)) * 0.5;
  const x = Number(cx ?? 0) + r * Math.cos(-Number(midAngle ?? 0) * RADIAN);
  const y = Number(cy ?? 0) + r * Math.sin(-Number(midAngle ?? 0) * RADIAN);
  const p = Math.round(percent * 100);

  if (p < 5) return null;

  return (
    <text
      x={x}
      y={y}
      fill="#000"
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={12}
      fontWeight={700}
    >
      {p}%
    </text>
  );
};

export default function BudgetStatsCard({
  title = "통계 📊",
  totalLabel = "총 지출 금액",
  data,
  colors = defaultColors,
  height = 280,
}: Props) {
  const rows = Array.isArray(data) ? data : [];
  const normalized = rows.map((d) => ({
    name: d?.name ?? "",
    value: Number(d?.value ?? 0),
    color: d?.color,
  }));

  const total = normalized.reduce((s, d) => s + (d.value || 0), 0);
  const withColor = normalized.map((d, i) => ({
    ...d,
    color: colors[i % colors.length] ?? d.color,
  }));

  return (
    <section className="max-h-screen overflow-hidden rounded-2xl border border-secondary bg-white px-5 py-4 shadow-[0_4px_16px_rgba(0,0,0,0.06)]">
      <h3 className="text-xl font-extrabold mb-3">{title}</h3>

      <div className="mb-1 text-xs text-gray-400">{totalLabel}</div>
      <div className="mb-4 text-3xl font-extrabold tracking-tight">
        {formatWon(total)}
      </div>

      <div className="h-[300px] md:h-[360px] grid grid-rows-[1fr_auto]">
        <div className="h-full">
          <ResponsiveContainer width="100%" height={height}>
            <PieChart>
              <Pie
                data={withColor}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={110}
                stroke="transparent"
                labelLine={false}
                label={renderLabel}
              >
                {withColor.map((entry, i) => (
                  <Cell key={i} fill={entry.color!} />
                ))}
              </Pie>

              <Tooltip
                formatter={(v: string | number, name: string | number) => {
                  const value = Array.isArray(v as any)
                    ? Number((v as any)[0])
                    : Number(v);
                  const percent =
                    total > 0 ? Math.round((value / total) * 100) : 0;
                  return [`${formatWon(value)} (${percent}%)`, String(name)];
                }}
              />
              <Legend
                verticalAlign="bottom"
                iconType="circle"
                wrapperStyle={{ paddingTop: 8 }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  );
}
