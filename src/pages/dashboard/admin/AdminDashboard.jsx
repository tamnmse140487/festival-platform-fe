import React, { useEffect, useMemo, useState } from "react";
import {
  TrendingUp,
  Building2,
  School as SchoolIcon,
  Users,
  ShoppingCart,
  Store,
  Wallet,
  Gamepad2,
  AlertTriangle,
  Filter,
  Clock,
} from "lucide-react";
import Card from "../../../components/statistics/Card";
import StatusBadge from "../../../components/statistics/StatusBadge";
import TimeRangeSelector from "../../../components/statistics/TimeRangeSelector";
import GranularRevenueChart from "../../../components/statistics/GranularRevenueChart";
import { COLORS, TIME_RANGES } from "../../../utils/constants";
import {
  currency,
  sliceByDays,
  mapRevenueSeriesToRaw,
  buildAdminParams,
  buildRevenueParams,
} from "../../../utils/helpers";
import { statisticServices } from "../../../services/statisticsServices";
import { schoolServices } from "../../../services/schoolServices";  
import { festivalServices } from "../../../services/festivalServices"; 
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  Tooltip,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  LineChart,
  Line,
} from "recharts";
import FilterSelect from "../../../components/statistics/FilterSelect";
import toast from "react-hot-toast";

export default function AdminDashboard() {
  const [timeRange, setTimeRange] = useState("7d");
  const [schools, setSchools] = useState([]);
  const [festivals, setFestivals] = useState([]);
  const [schoolId, setSchoolId] = useState(null);
  const [festivalId, setFestivalId] = useState(null);

  const [summary, setSummary] = useState(null);
  const [revenueRaw, setRevenueRaw] = useState([]); 
  const [paymentMix, setPaymentMix] = useState([]);
  const [topFestivals, setTopFestivals] = useState([]);
  const [topBooths, setTopBooths] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [alerts, setAlerts] = useState([]);

  const [points, setPoints] = useState(() => {
    const today = new Date();
    const arr = Array.from({ length: 10 }, (_, i) => {
      const d = new Date(today);
      d.setDate(d.getDate() - (9 - i));
      return {
        date: d.toLocaleDateString("vi-VN", {
          day: "2-digit",
          month: "2-digit",
        }),
        earned: 900 + i * 30,
        spent: 650 + i * 20,
      };
    });
    return arr;
  });

  useEffect(() => {
    (async () => {
      try {
        const [schRes, fesRes] = await Promise.all([
          schoolServices.get(),
          festivalServices.get(),
        ]);
        const schoolItems = (schRes?.data || []).map((s) => ({
          value: s.schoolId,
          label: s.schoolName,
          avatarUrl: s.logoUrl,
        }));
        const festivalItems = (fesRes?.data || []).map((f) => ({
          value: f.festivalId,
          label: f.festivalName,
          avatarUrl: f.avatarUrl,
          schoolId: f.schoolId, 
        }));
        setSchools(schoolItems);
        setFestivals(festivalItems);
      } catch (e) {}
    })();
  }, []);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const sumParams = buildAdminParams({
          range: timeRange,
          schoolId,
          festivalId,
        });
        const sRes = await statisticServices.getAdminSummary(sumParams);
        setSummary(sRes?.data?.data || sRes?.data); 

        const revParams = buildRevenueParams({
          range: timeRange,
          granularity: "day",
          schoolId,
          festivalId,
        });
        const rRes = await statisticServices.getRevenueSeries(revParams);
        const raw = mapRevenueSeriesToRaw(
          rRes?.data?.data?.series || rRes?.data?.series || []
        );

        setRevenueRaw(
          raw.length
            ? raw
            : sliceByDays(generateMockRevenue(), TIME_RANGES[timeRange].days)
        );

        const pmParams = buildAdminParams({
          range: timeRange,
          schoolId,
          festivalId,
        });
        const pmRes = await statisticServices.getAdminPaymentMix(pmParams);
        setPaymentMix(pmRes?.data?.data || pmRes?.data || []);

        const tfParams = {
          ...buildAdminParams({ range: timeRange, schoolId }),
          limit: 5,
        };

        const tfRes = await statisticServices.getAdminTopFestivals(tfParams);
        setTopFestivals(tfRes?.data?.data || tfRes?.data || []);

        const tbParams = {
          ...buildRevenueParams({ range: timeRange, schoolId }),
          limit: 5,
        };
        const tbRes = await statisticServices.getTopBooths(tbParams);
        setTopBooths(tbRes?.data?.data || tbRes?.data || []);

        const roParams = {
          ...(schoolId ? { school_id: schoolId } : {}),
          ...(festivalId ? { festival_id: festivalId } : {}),
          limit: 5,
        };
        const roRes = await statisticServices.getRecentOrders(roParams);
        setRecentOrders(roRes?.data?.data || roRes?.data || []);

        const alRes = await statisticServices.getAlerts({
          ...(festivalId ? { festival_id: festivalId } : {}),
          ...(schoolId ? { school_id: schoolId } : {}),
        });
        setAlerts(alRes?.data?.data || alRes?.data || []);
      } catch (e) {
        console.log(e);
        toast.error("Có lỗi khi tải 1 số dữ liệu thống kê")
      }
    };
    fetchAll();
  }, [timeRange, schoolId, festivalId]);

  const filteredFestivalItems = useMemo(
    () =>
      festivals.filter(
        (f) => !schoolId || String(f.schoolId) === String(schoolId)
      ),
    [festivals, schoolId]
  );

  const totals = useMemo(() => {
    const gmv = summary?.gmv ?? revenueRaw.reduce((s, x) => s + x.revenue, 0);
    const paidOrders =
      summary?.paidOrders ?? revenueRaw.reduce((s, x) => s + x.orders, 0);
    return {
      schools: summary?.schools ?? 0,
      festivalsOngoing: summary?.festivalsOngoing ?? 0,
      gmv,
      paidOrders,
      boothsActive: summary?.boothsActive ?? 0,
      usersActive: summary?.usersActive ?? 0,
      walletTopup: summary?.walletTopup ?? 0,
      commission: summary?.commission ?? 0,
      minigames: 17,
    };
  }, [summary, revenueRaw]);
  const aov = totals.gmv / (totals.paidOrders || 1);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        <div className="inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm">
          <Filter className="w-4 h-4" />
          <span className="text-zinc-600 dark:text-zinc-300">Bộ lọc:</span>
          <TimeRangeSelector value={timeRange} onChange={setTimeRange} />
        </div>

        <FilterSelect
          label="Trường"
          items={schools}
          value={schoolId}
          onChange={(v) => {
            setSchoolId(v || null);
            setFestivalId(null);
          }}
          placeholder="Tất cả"
        />

        <FilterSelect
          label="Festival"
          items={filteredFestivalItems}
          value={festivalId}
          onChange={(v) => setFestivalId(v || null)}
          placeholder="Tất cả"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card
          title="Tổng số trường"
          icon={<Building2 className="w-4 h-4" />}
          value={totals.schools}
        />
        <Card
          title="Festival đang hoạt động"
          icon={<SchoolIcon className="w-4 h-4" />}
          value={totals.festivalsOngoing}
        />
        <Card
          title={`GMV (${TIME_RANGES[timeRange].label})`}
          icon={<TrendingUp className="w-4 h-4" />}
          value={currency(totals.gmv)}
          sub={`AOV ${currency(aov)}`}
        />
        <Card
          title="Đơn đã thanh toán"
          icon={<ShoppingCart className="w-4 h-4" />}
          value={totals.paidOrders}
        />
        <Card
          title="Booth active"
          icon={<Store className="w-4 h-4" />}
          value={totals.boothsActive}
        />
        <Card
          title="Người dùng hoạt động"
          icon={<Users className="w-4 h-4" />}
          value={totals.usersActive}
        />
        <Card
          title="Top-up ví"
          icon={<Wallet className="w-4 h-4" />}
          value={currency(totals.walletTopup)}
        />
        <Card
          title="Tiền hoa hồng"
          icon={<Wallet className="w-4 h-4" />}
          value={currency(totals.commission)}
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <Card
          title="Doanh thu của tất cả lễ hội"
          sub="Chọn theo ngày/tháng/năm"
          className="xl:col-span-2"
        >
          <GranularRevenueChart raw={revenueRaw} variant="area" />
        </Card>

        <Card title="Cơ cấu phương thức thanh toán" sub="% đơn hàng">
          <div className="h-72">
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={paymentMix}
                  dataKey="count"
                  nameKey="method"
                  outerRadius={90}
                  label
                >
                  {paymentMix.map((_, i) => (
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
              <BarChart data={topFestivals}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="festivalName" />
                <YAxis />
                <Tooltip formatter={(v) => currency(v)} />
                <Bar dataKey="revenue">
                  {topFestivals.map((_, i) => (
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
              <LineChart data={points}>
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

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <Card title="Cảnh báo & tác vụ nhanh" className="xl:col-span-1">
          <ul className="space-y-2">
            {alerts.map((a, idx) => (
              <li
                key={idx}
                className="flex items-center justify-between rounded-xl border p-3"
              >
                <div className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-200">
                  {a.type?.includes("pending") ? (
                    <Clock className="w-4 h-4" />
                  ) : (
                    <AlertTriangle className="w-4 h-4" />
                  )}
                  {a.message || `${a.count} ${a.type}`}
                </div>
                <button className="text-xs rounded-lg px-2 py-1 bg-indigo-50 text-indigo-700 hover:bg-indigo-100">
                  Xem
                </button>
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
                  <th className="text-right py-2">Đơn</th>
                  <th className="text-right py-2">Doanh thu</th>
                </tr>
              </thead>
              <tbody>
                {topBooths.map((b, i) => (
                  <tr key={i} className="border-t">
                    <td className="py-2">{b.boothName}</td>
                    <td className="py-2 text-right">{b.orders}</td>
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
                {recentOrders.map((o) => (
                  <tr key={o.orderId} className="border-t">
                    <td className="py-2">#{o.orderId}</td>
                    <td className="py-2">
                      <div className="flex flex-col">
                        <span className="font-medium">{o.nameName}</span>
                        <span className="text-xs text-zinc-500">
                          {o.festivalName} • {o.boothName}
                        </span>
                        <span className="text-xs text-zinc-500">
                          {o.userFullName}
                        </span>
                      </div>
                    </td>
                    <td className="py-2 text-right">{currency(o.amount)}</td>
                    <td className="py-2 text-right">
                      <StatusBadge status={o.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}

function generateMockRevenue() {
  const n = 90;
  const arr = Array.from({ length: n }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (n - 1 - i));
    d.setHours(0, 0, 0, 0);
    return {
      dt: d,
      revenue: 0,
      orders: 40 + i * 3,
    };
  });
  return arr;
}
