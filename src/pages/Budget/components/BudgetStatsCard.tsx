import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
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
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
}: {
  cx: number;
  cy: number;
  midAngle: number;
  innerRadius: number;
  outerRadius: number;
  percent: number;
}) => {
  // 도넛 두께의 중간 지점
  const r = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + r * Math.cos(-midAngle * RADIAN);
  const y = cy + r * Math.sin(-midAngle * RADIAN);
  const p = Math.round(percent * 100);

  // 조각이 너무 얇으면 라벨 숨김(겹침 방지)
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
  totalLabel = "카테고리별 예산",
  data,
  colors = defaultColors,
  height = 280,
}: Props) {
  const rows = Array.isArray(data) ? data : [];
  const normalized = rows.map((d) => ({
    name: d?.name ?? "",
    value: Number((d as any)?.value ?? 0),
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
                formatter={(v: any, _n: any, props: any) => {
                  const value = Number(v);
                  const percent =
                    total > 0 ? Math.round((value / total) * 100) : 0;
                  return [
                    `${formatWon(value)} (${percent}%)`,
                    props?.payload?.name,
                  ];
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
