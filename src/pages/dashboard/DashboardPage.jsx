import React, { useMemo, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Legend, AreaChart, Area } from "recharts";
import { TrendingUp, Building2, School as SchoolIcon, Users, ShoppingCart, Store, Wallet, Gamepad2, AlertTriangle, Filter, CheckCircle2, Clock } from "lucide-react";
// ---------- Mock Data ----------
const currency = (n) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(n);

const TIME_RANGES = {
  "7d": { label: "7 ngày qua", days: 7 },
  "1m": { label: "1 tháng qua", days: 30 },
  "3m": { label: "3 tháng qua", days: 90 },
  "1y": { label: "1 năm qua", days: 365 },
};

const sliceByDays = (raw, days) => {
  // raw = [{dt: Date, revenue: number, orders: number}, ...] đã có 90 ngày — có thể tăng lên 365 nếu muốn
  // Nếu dữ liệu ít hơn 'days' thì trả hết
  return raw.slice(Math.max(0, raw.length - days));
};

const TimeRangeSelector = ({ value, onChange }) => {
  return (
    <div className="inline-flex overflow-hidden rounded-xl border">
      {Object.entries(TIME_RANGES).map(([key, cfg]) => (
        <button
          key={key}
          onClick={() => onChange(key)}
          className={`px-3 py-2 text-sm ${value === key ? "bg-indigo-600 text-white" : "hover:bg-zinc-50 dark:hover:bg-zinc-800"}`}
        >
          {cfg.label}
        </button>
      ))}
    </div>
  );
};

// Helpers to format labels by granularity
const fmtDay = (dt) => dt.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" });
const fmtMonth = (dt) => dt.toLocaleDateString("vi-VN", { month: "2-digit", year: "numeric" });
const fmtYear = (dt) => String(dt.getFullYear());

// Create last 90 days of mock data
const dateObjs = Array.from({ length: 90 }, (_, i) => {
  const d = new Date();
  d.setDate(d.getDate() - (89 - i));
  d.setHours(0, 0, 0, 0);
  return d;
});

// Admin aggregates (RAW series by day with Date for grouping)
const adminRevenueRaw = dateObjs.map((dt, i) => ({
  dt,
  revenue: 3_000_000 + i * 320_000 + (i % 3) * 150_000,
  orders: 40 + i * 3,
}));

const adminFestivalBreakdown = [
  { festival: "Hội Xuân THPT A", revenue: 26_500_000 },
  { festival: "Hội Ẩm Thực THCS B", revenue: 18_200_000 },
  { festival: "Ngày Hội Văn Hóa THPT C", revenue: 12_750_000 },
  { festival: "Chợ Tết THPT D", revenue: 9_480_000 },
];
const adminPaymentMix = [
  { name: "Ví (Wallet)", value: 48 },
  { name: "Tiền mặt", value: 32 },
  { name: "Điểm", value: 12 },
  { name: "Ngân hàng", value: 8 },
];
const adminTopBooths = [
  { booth: "Nhóm 12A1 - Bánh tráng", revenue: 8_350_000 },
  { booth: "Nhóm 11C2 - Trà sữa", revenue: 7_220_000 },
  { booth: "Nhóm 10B - Xiên que", revenue: 6_980_000 },
  { booth: "Nhóm 12A3 - Cơm cuộn", revenue: 5_540_000 },
];
// dùng 10 ngày cuối để demo chart điểm
const adminPoints = dateObjs.slice(-10).map((dt, i) => ({
  date: fmtDay(dt),
  earned: 900 + i * 30,
  spent: 650 + i * 20,
}));
const adminAlerts = [
  { id: 1, type: "booth_pending", label: "12 gian hàng chờ duyệt", icon: <Clock className="w-4 h-4" /> },
  { id: 2, type: "supplier_pending", label: "3 nhà cung cấp chờ duyệt", icon: <Clock className="w-4 h-4" /> },
  { id: 3, type: "festival_upcoming", label: "2 festival sắp bắt đầu trong 3 ngày", icon: <AlertTriangle className="w-4 h-4" /> },
];
const adminRecentOrders = [
  { id: 10021, school: "THPT A", festival: "Hội Xuân", booth: "12A1 - Bánh tráng", user: "Nguyễn Minh", amount: 120_000, status: "paid" },
  { id: 10022, school: "THCS B", festival: "Ẩm Thực", booth: "7B - Sushi", user: "Trần Hoa", amount: 85_000, status: "paid" },
  { id: 10023, school: "THPT C", festival: "Văn Hóa", booth: "10B - Xiên que", user: "Lê Hậu", amount: 60_000, status: "pending" },
  { id: 10024, school: "THPT D", festival: "Chợ Tết", booth: "9C - Bánh mì", user: "Phạm An", amount: 45_000, status: "paid" },
];

// School aggregates (RAW series by day with Date)
const schoolRevenueRaw = dateObjs.map((dt, i) => ({
  dt,
  revenue: 1_600_000 + i * 180_000,
  orders: 22 + i * 2,
}));
const schoolFestivalPerf = [
  { festival: "Hội Xuân 2026", revenue: 12_900_000, booths: 18, orders: 420 },
  { festival: "Chợ Tết 2026", revenue: 8_600_000, booths: 12, orders: 290 },
];
const schoolTopBooths = [
  { booth: "12A1 - Bánh tráng", revenue: 4_250_000, orders: 140 },
  { booth: "11C2 - Trà sữa", revenue: 3_860_000, orders: 120 },
  { booth: "10B - Xiên que", revenue: 2_970_000, orders: 96 },
];
const schoolMenuMix = [
  { name: "Đồ ăn", value: 68 },
  { name: "Đồ uống", value: 32 },
];
const schoolBoothFunnel = [
  { stage: "Đăng ký", count: 26 },
  { stage: "Được duyệt", count: 22 },
  { stage: "Active", count: 20 },
];
const schoolRecentOrders = [
  { id: 21001, festival: "Hội Xuân 2026", booth: "12A1 - Bánh tráng", user: "Mai Hoa", amount: 45_000, status: "paid" },
  { id: 21002, festival: "Hội Xuân 2026", booth: "11C2 - Trà sữa", user: "Đức Anh", amount: 55_000, status: "paid" },
  { id: 21003, festival: "Chợ Tết 2026", booth: "10B - Xiên que", user: "Thuỷ Tiên", amount: 35_000, status: "pending" },
];
const COLORS = ["#6366f1", "#22c55e", "#f59e0b", "#ef4444", "#06b6d4", "#a855f7"]; // indigo, green, amber, red, cyan, purple

// ---------- Shared UI ----------
// Generic reducer to group by granularity
const groupRevenue = (raw, granularity = "day") => {
  const map = new Map();
  for (const r of raw) {
    const key =
      granularity === "day" ? fmtDay(r.dt) :
        granularity === "month" ? fmtMonth(r.dt) :
          fmtYear(r.dt);
    map.set(key, (map.get(key) || 0) + r.revenue);
  }
  return Array.from(map.entries()).map(([label, revenue]) => ({ label, revenue }));
};

// Reusable chart with granularity toggle
const GranularRevenueChart = ({ raw, variant = "area" }) => {
  const [view, setView] = useState("day");
  const data = useMemo(() => groupRevenue(raw, view), [raw, view]);

  return (
    <div className="h-72">
      <div className="mb-3 flex items-center gap-2">
        <div className="inline-flex overflow-hidden rounded-xl border">
          {["day", "month", "year"].map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-3 py-1.5 text-xs md:text-sm ${view === v ? "bg-indigo-600 text-white" : "hover:bg-zinc-50 dark:hover:bg-zinc-800"}`}
            >
              {v === "day" ? "Theo ngày" : v === "month" ? "Theo tháng" : "Theo năm"}
            </button>
          ))}
        </div>
        <span className="text-xs text-zinc-500">
          Chế độ: {view === "day" ? "Ngày" : view === "month" ? "Tháng" : "Năm"}
        </span>
      </div>

      <ResponsiveContainer width="100%" height="100%">
        {variant === "area" ? (
          <AreaChart data={data} margin={{ left: 10, right: 10, top: 10, bottom: 0 }}>
            <defs>
              <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="label" />
            <YAxis />
            <Tooltip formatter={(v) => currency(v)} labelFormatter={(l) => `Mốc: ${l}`} />
            <Area type="monotone" dataKey="revenue" stroke="#6366f1" fillOpacity={1} fill="url(#rev)" />
          </AreaChart>
        ) : (
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="label" />
            <YAxis />
            <Tooltip formatter={(v) => currency(v)} labelFormatter={(l) => `Mốc: ${l}`} />
            <Line type="monotone" dataKey="revenue" stroke="#06b6d4" />
          </LineChart>
        )}
      </ResponsiveContainer>
    </div>
  );
};


const Card = ({ title, icon, value, sub, children, className = "" }) => (
  <div className={`rounded-2xl bg-white/80 dark:bg-zinc-900/70 shadow-sm ring-1 ring-black/5 p-5 ${className}`}>
    <div className="flex items-start justify-between mb-3">
      <h3 className="text-sm font-medium text-zinc-600 dark:text-zinc-300 flex items-center gap-2">
        {icon && <span className="text-zinc-500">{icon}</span>}
        {title}
      </h3>
      {sub && <span className="text-xs text-zinc-500">{sub}</span>}
    </div>
    {value && (
      <div className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100 mb-2">{value}</div>
    )}
    {children}
  </div>
);

const StatusBadge = ({ status }) => {
  const map = {
    paid: "bg-green-100 text-green-700",
    pending: "bg-amber-100 text-amber-700",
    cancelled: "bg-rose-100 text-rose-700",
  };
  return <span className={`px-2 py-1 text-xs rounded-md ${map[status] || "bg-zinc-100 text-zinc-700"}`}>{status}</span>;
};

// ---------- Admin Dashboard ----------
const AdminDashboard = () => {
  const [timeRange, setTimeRange] = useState("7d");

  // dữ liệu đã lọc theo thời gian
  const filtered = useMemo(() => {
    const days = TIME_RANGES[timeRange].days;
    // nếu bạn chỉ tạo 90 ngày mock, chọn "1y" cũng chỉ cắt về 90 ngày.
    // Khi dùng dữ liệu thật, hãy đảm bảo có đủ 365 ngày.
    return sliceByDays(adminRevenueRaw, days);
  }, [timeRange]);

  // KPI theo range
  const totals = useMemo(() => ({
    schools: 42,
    festivalsOngoing: 3,
    gmv: filtered.reduce((s, x) => s + x.revenue, 0),
    paidOrders: filtered.reduce((s, x) => s + x.orders, 0),
    boothsActive: 128,
    usersActive: 1820,
    walletTopup: 15400000,
    minigames: 17,
  }), [filtered]);

  const aov = totals.gmv / (totals.paidOrders || 1);

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm">
          <Filter className="w-4 h-4" />
          <span className="text-zinc-600 dark:text-zinc-300">Bộ lọc:</span>
          <TimeRangeSelector value={timeRange} onChange={setTimeRange} />
        </div>
        <button className="rounded-xl border px-3 py-2 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800">Tất cả trường</button>
        <button className="rounded-xl border px-3 py-2 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800">Tất cả festival</button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card title="Tổng số trường" icon={<Building2 className="w-4 h-4" />} value={totals.schools} />
        <Card title="Festival đang hoạt động" icon={<SchoolIcon className="w-4 h-4" />} value={totals.festivalsOngoing} />
        <Card
          title={`GMV (${TIME_RANGES[timeRange].label})`}
          icon={<TrendingUp className="w-4 h-4" />}
          value={currency(totals.gmv)}
          sub={`AOV ${currency(aov)}`}
        />
        <Card title="Đơn đã thanh toán" icon={<ShoppingCart className="w-4 h-4" />} value={totals.paidOrders} />
        <Card title="Booth active" icon={<Store className="w-4 h-4" />} value={totals.boothsActive} />
        <Card title="Người dùng hoạt động" icon={<Users className="w-4 h-4" />} value={totals.usersActive} />
        <Card title="Top-up ví" icon={<Wallet className="w-4 h-4" />} value={currency(totals.walletTopup)} />
        <Card title="Minigame active" icon={<Gamepad2 className="w-4 h-4" />} value={totals.minigames} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <Card title="Doanh thu của tất cả lễ hội" sub="Chọn theo ngày/tháng/năm" className="xl:col-span-2">
          <GranularRevenueChart raw={filtered} variant="area" />
        </Card>

        <Card title="Cơ cấu phương thức thanh toán" sub="% đơn hàng">
          <div className="h-72">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={adminPaymentMix} dataKey="value" nameKey="name" outerRadius={90} label>
                  {adminPaymentMix.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Legend />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <Card title="Top festival theo doanh thu">
          <div className="h-72">
            <ResponsiveContainer>
              <BarChart data={adminFestivalBreakdown}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="festival" />
                <YAxis />
                <Tooltip formatter={(v) => currency(v)} />
                <Bar dataKey="revenue">
                  {adminFestivalBreakdown.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card title="Điểm thưởng: Earned vs Spent">
          <div className="h-72">
            <ResponsiveContainer>
              <LineChart data={adminPoints}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="earned" stroke="#22c55e" />
                <Line type="monotone" dataKey="spent" stroke="#ef4444" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Lists */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <Card title="Cảnh báo & tác vụ nhanh" className="xl:col-span-1">
          <ul className="space-y-2">
            {adminAlerts.map((a) => (
              <li key={a.id} className="flex items-center justify-between rounded-xl border p-3">
                <div className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-200">{a.icon}{a.label}</div>
                <button className="text-xs rounded-lg px-2 py-1 bg-indigo-50 text-indigo-700 hover:bg-indigo-100">Xem</button>
              </li>
            ))}
          </ul>
        </Card>
        <Card title="Top booth theo doanh thu" className="xl:col-span-1">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="text-zinc-500">
                <tr>
                  <th className="text-left py-2">Booth</th>
                  <th className="text-right py-2">Doanh thu</th>
                </tr>
              </thead>
              <tbody>
                {adminTopBooths.map((b, i) => (
                  <tr key={i} className="border-t">
                    <td className="py-2">{b.booth}</td>
                    <td className="py-2 text-right">{currency(b.revenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
        <Card title="Đơn hàng gần đây" className="xl:col-span-1">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="text-zinc-500">
                <tr>
                  <th className="text-left py-2">ID</th>
                  <th className="text-left py-2">Trường / Festival / Booth</th>
                  <th className="text-right py-2">Tổng</th>
                  <th className="text-right py-2">TT</th>
                </tr>
              </thead>
              <tbody>
                {adminRecentOrders.map((o) => (
                  <tr key={o.id} className="border-t">
                    <td className="py-2">#{o.id}</td>
                    <td className="py-2">
                      <div className="flex flex-col">
                        <span className="font-medium">{o.school}</span>
                        <span className="text-xs text-zinc-500">{o.festival} • {o.booth}</span>
                        <span className="text-xs text-zinc-500">{o.user}</span>
                      </div>
                    </td>
                    <td className="py-2 text-right">{currency(o.amount)}</td>
                    <td className="py-2 text-right"><StatusBadge status={o.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
};

// ---------- School Dashboard ----------
const SchoolDashboard = () => {
  const [timeRange, setTimeRange] = useState("7d");

  const filtered = useMemo(() => {
    const days = TIME_RANGES[timeRange].days;
    return sliceByDays(schoolRevenueRaw, days);
  }, [timeRange]);

  const totals = useMemo(() => ({
    festivals: 2,
    festivalsOngoing: 1,
    booths: 20,
    boothsActive: 18,
    groups: 9,
    members: 212,
    gmv: filtered.reduce((s, x) => s + x.revenue, 0),
    ordersPaid: filtered.reduce((s, x) => s + x.orders, 0),
  }), [filtered]);

  const aov = totals.gmv / (totals.ordersPaid || 1);

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm">
          <Filter className="w-4 h-4" />
          <span className="text-zinc-600 dark:text-zinc-300">Bộ lọc:</span>
          <TimeRangeSelector value={timeRange} onChange={setTimeRange} />
        </div>
        <button className="rounded-xl border px-3 py-2 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800">
          Tất cả festival của trường
        </button>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card title="Festival" icon={<SchoolIcon className="w-4 h-4" />} value={`${totals.festivals} (ongoing ${totals.festivalsOngoing})`} />
        <Card title="Booth" icon={<Store className="w-4 h-4" />} value={`${totals.booths} (active ${totals.boothsActive})`} />
        <Card title="Nhóm / Thành viên" icon={<Users className="w-4 h-4" />} value={`${totals.groups} / ${totals.members}`} />
        <Card
          title={`GMV (${TIME_RANGES[timeRange].label})`}
          icon={<TrendingUp className="w-4 h-4" />}
          value={currency(totals.gmv)}
          sub={`AOV ${currency(aov)}`}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <Card title="Doanh thu của tất cả lễ hội" sub="Chọn theo ngày/tháng/năm" className="xl:col-span-2">
          <GranularRevenueChart raw={schoolRevenueRaw} variant="line" />
        </Card>

        <Card title="Cơ cấu món bán" sub="Food vs Beverage">
          <div className="h-72">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={schoolMenuMix} dataKey="value" nameKey="name" outerRadius={90} label>
                  {schoolMenuMix.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Legend />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <Card title="Hiệu suất theo festival của trường">
          <div className="h-72">
            <ResponsiveContainer>
              <BarChart data={schoolFestivalPerf}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="festival" />
                <YAxis />
                <Tooltip formatter={(v) => currency(v)} />
                <Bar dataKey="revenue">
                  {schoolFestivalPerf.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card title="Phễu Booth (ĐK → Duyệt → Active)">
          <div className="h-72">
            <ResponsiveContainer>
              <BarChart data={schoolBoothFunnel}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="stage" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#f59e0b" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Lists */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <Card title="Top booth của trường">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="text-zinc-500">
                <tr>
                  <th className="text-left py-2">Booth</th>
                  <th className="text-right py-2">Đơn</th>
                  <th className="text-right py-2">Doanh thu</th>
                </tr>
              </thead>
              <tbody>
                {schoolTopBooths.map((b, i) => (
                  <tr key={i} className="border-t">
                    <td className="py-2">{b.booth}</td>
                    <td className="py-2 text-right">{b.orders}</td>
                    <td className="py-2 text-right">{currency(b.revenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
        <Card title="Đơn hàng gần đây">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="text-zinc-500">
                <tr>
                  <th className="text-left py-2">ID</th>
                  <th className="text-left py-2">Festival / Booth</th>
                  <th className="text-right py-2">Tổng</th>
                  <th className="text-right py-2">TT</th>
                </tr>
              </thead>
              <tbody>
                {schoolRecentOrders.map((o) => (
                  <tr key={o.id} className="border-t">
                    <td className="py-2">#{o.id}</td>
                    <td className="py-2">
                      <div className="flex flex-col">
                        <span className="font-medium">{o.festival}</span>
                        <span className="text-xs text-zinc-500">{o.booth}</span>
                        <span className="text-xs text-zinc-500">{o.user}</span>
                      </div>
                    </td>
                    <td className="py-2 text-right">{currency(o.amount)}</td>
                    <td className="py-2 text-right"><StatusBadge status={o.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
};

// ---------- Container with Role Toggle ----------
export default function DashboardPage() {
  const [role, setRole] = useState("admin");

  return (
    <div className="min-h-screen w-full ">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Festival Management — Dashboards</h1>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">Preview cho 2 vai trò: <b>Admin</b> (toàn hệ thống) & <b>School</b> (cấp trường)</p>
          </div>

          <div className="flex items-center gap-2 bg-white/80 dark:bg-zinc-900/70 ring-1 ring-black/5 rounded-2xl p-1">
            <button onClick={() => setRole("admin")} className={`px-4 py-2 rounded-xl text-sm transition ${role === "admin" ? "bg-indigo-600 text-white" : "hover:bg-zinc-100 dark:hover:bg-zinc-800"}`}>Admin</button>
            <button onClick={() => setRole("school")} className={`px-4 py-2 rounded-xl text-sm transition ${role === "school" ? "bg-indigo-600 text-white" : "hover:bg-zinc-100 dark:hover:bg-zinc-800"}`}>School</button>
          </div>
        </div>

        {role === "admin" ? <AdminDashboard /> : <SchoolDashboard />}

        {/* Footer */}
        <div className="mt-10 text-xs text-zinc-500">
          <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> Dùng dữ liệu cứng cho mục đích minh hoạ. Thay thế bằng API thật khi backend sẵn sàng.</div>
        </div>
      </div>
    </div>
  );
}