import React, { useEffect, useMemo, useState } from "react";
import {
  TrendingUp,
  School as SchoolIcon,
  Users,
  Store,
  Filter,
  Clock,
  CheckCircle,
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
  buildSchoolParams,
  buildRevenueParams,
} from "../../../utils/helpers";
import { statisticServices } from "../../../services/statisticsServices";
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
} from "recharts";
import { useAuth } from "../../../contexts/AuthContext";
import FilterSelect from "../../../components/statistics/FilterSelect";
import toast from "react-hot-toast";

export default function SchoolDashboard() {
  const { user } = useAuth();
  const schoolId = user?.schoolId;

  const [timeRange, setTimeRange] = useState("7d");
  const [festivalId, setFestivalId] = useState(null);
  const [festivals, setFestivals] = useState([]);

  const [summary, setSummary] = useState(null);
  const [revenueRaw, setRevenueRaw] = useState([]);
  const [menuMix, setMenuMix] = useState([]);
  const [festivalPerf, setFestivalPerf] = useState([]);
  const [boothFunnel, setBoothFunnel] = useState([]);
  const [topBooths, setTopBooths] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const fesRes = await festivalServices.get({ schoolId });
        const items = (fesRes?.data || []).map((f) => ({
          value: f.festivalId,
          label: f.festivalName,
          avatarUrl: f.avatarUrl,
        }));
        setFestivals(items);
      } catch {}
    })();
  }, [schoolId]);

  useEffect(() => {
    if (!schoolId) return;
    const load = async () => {
      try {
        const sParams = buildSchoolParams({ range: timeRange, schoolId });
        const sRes = await statisticServices.getSchoolSummary(sParams);
        setSummary(sRes?.data?.data || sRes?.data);

        const rParams = buildRevenueParams({
          range: timeRange,
          granularity: "day",
          schoolId,
          festivalId,
        });
        const rRes = await statisticServices.getRevenueSeries(rParams);
        const raw = mapRevenueSeriesToRaw(
          rRes?.data?.data?.series || rRes?.data?.series || []
        );
        setRevenueRaw(
          raw.length
            ? raw
            : sliceByDays(generateMockRevenue(), TIME_RANGES[timeRange].days)
        );

        const mmParams = buildSchoolParams({
          range: timeRange,
          schoolId,
          festivalId,
        });
        const mmRes = await statisticServices.getSchoolMenuMix(mmParams);
        setMenuMix(mmRes?.data?.data || mmRes?.data || []);

        const fpParams = buildSchoolParams({ range: timeRange, schoolId });
        const fpRes = await statisticServices.getSchoolFestivalPerformance(
          fpParams
        );
        setFestivalPerf(fpRes?.data?.data || fpRes?.data || []);

        const bfParams = buildSchoolParams({
          range: timeRange,
          schoolId,
          festivalId,
        });
        const bfRes = await statisticServices.getSchoolBoothFunnel(bfParams);
        setBoothFunnel(bfRes?.data?.data || bfRes?.data || []);

        const tbParams = {
          ...buildRevenueParams({ range: timeRange, schoolId }),
          limit: 5,
        };
        const tbRes = await statisticServices.getTopBooths(tbParams);
        setTopBooths(tbRes?.data?.data || tbRes?.data || []);

        const roParams = {
          school_id: schoolId,
          ...(festivalId ? { festival_id: festivalId } : {}),
          limit: 5,
        };
        const roRes = await statisticServices.getRecentOrders(roParams);
        setRecentOrders(roRes?.data?.data || roRes?.data || []);
      } catch (e) {
        console.log(e);
        toast.error("Có lỗi khi tải 1 số dữ liệu thống kê");
      }
    };
    load();
  }, [timeRange, schoolId, festivalId]);

  const totals = useMemo(() => {
    const gmv = summary?.gmv ?? revenueRaw.reduce((s, x) => s + x.revenue, 0);
    const paidOrders =
      summary?.paid_orders ?? revenueRaw.reduce((s, x) => s + x.orders, 0);
    return {
      festivals: summary?.festivals ?? 0,
      festivalsOngoing: summary?.festivalsOngoing ?? 0,
      booths: summary?.booths ?? 0,
      boothsActive: summary?.boothsActive ?? 0,
      groups: summary?.groups ?? 0,
      members: summary?.members ?? 0,
      gmv,
      ordersPaid: paidOrders,
      aov: summary?.aov ?? gmv / (paidOrders || 1),
    };
  }, [summary, revenueRaw]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        <div className="inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm">
          <Filter className="w-4 h-4" />
          <span className="text-zinc-600 dark:text-zinc-300">Bộ lọc:</span>
          <TimeRangeSelector value={timeRange} onChange={setTimeRange} />
        </div>

        <FilterSelect
          label="Festival"
          items={festivals}
          value={festivalId}
          onChange={(v) => setFestivalId(v || null)}
          placeholder="Tất cả festival của trường"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card
          title="Festival"
          icon={<SchoolIcon className="w-4 h-4" />}
          value={`${totals.festivals}`}
          subValue={
            <div className="flex items-center text-sm text-gray-500 mt-1">
              <Clock className="w-4 h-4 mr-1 text-blue-500" />
              <span>Đang diễn ra: {totals.festivalsOngoing}</span>
            </div>
          }
        />
        <Card
          title="Booth"
          icon={<Store className="w-4 h-4" />}
          value={`${totals.booths} `}
          subValue={
            <div className="flex items-center text-sm text-gray-500 mt-1">
              <CheckCircle className="w-4 h-4 mr-1 text-green-500" />
              <span>Hoạt động: {totals.boothsActive}</span>
            </div>
          }
        />
        <Card
          title="Nhóm / Thành viên"
          icon={<Users className="w-4 h-4" />}
          value={`${totals.groups} / ${totals.members}`}
        />
        <Card
          title={`GMV (${TIME_RANGES[timeRange].label})`}
          icon={<TrendingUp className="w-4 h-4" />}
          value={currency(totals.gmv)}
          sub={`AOV ${currency(totals.aov)}`}
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <Card
          title="Doanh thu của tất cả lễ hội"
          sub="Chọn theo ngày/tháng/năm"
          className="xl:col-span-2"
        >
          <GranularRevenueChart raw={revenueRaw} variant="line" />
        </Card>

        <Card title="Cơ cấu món bán" sub="Food vs Beverage">
          <div className="h-72">
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={menuMix}
                  dataKey="value"
                  nameKey="type"
                  outerRadius={90}
                  label
                >
                  {menuMix.map((_, i) => (
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
              <BarChart data={festivalPerf}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="festivalName" />
                <YAxis />
                <Tooltip formatter={(v) => currency(v)} />
                <Bar dataKey="revenue">
                  {festivalPerf.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card title="Phễu Booth (pending/approved/rejected/active)">
          <div className="h-72">
            <ResponsiveContainer>
              <BarChart data={boothFunnel}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="status" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#f59e0b" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

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
                {recentOrders.map((o) => (
                  <tr key={o.orderId} className="border-t">
                    <td className="py-2">#{o.orderId}</td>
                    <td className="py-2">
                      <div className="flex flex-col">
                        <span className="font-medium">{o.festivalName}</span>
                        <span className="text-xs text-zinc-500">
                          {o.boothName}
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
    return { dt: d, revenue: 0, orders: 22 + i * 2 };
  });
  return arr;
}
