import { CheckCircle, Clock, Edit, Trophy, X } from "lucide-react";
import { BOOTH_STATUS_LABELS, FESTIVAL_STATUS, NOTIFICATION_EVENT, ORDER_STATUS } from "./constants";

export const getRoleDisplayName = (role) => {
  const roleNames = {
    Admin: "Quản trị viên",
    SchoolManager: "Quản lý trường",
    Teacher: "Giáo viên",
    Student: "Học sinh",
    Supplier: "Nhà cung cấp",
    guest: "Khách",
  };
  return roleNames[role] || "Người dùng";
};

export const formatPrice = (price) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price);
};

export const formatNumber = (num) => {
  return new Intl.NumberFormat("vi-VN").format(num);
};

export const getBoothStatusLabel = (status) => {
  const found = BOOTH_STATUS_LABELS.find((item) => item.value === status);
  return found ? found.label : status;
};

export const getStatusBadge = (status, type = "default") => {
  const statusConfigs = {
    festival: {
      draft: {
        label: "Nháp",
        class: "bg-gray-100 text-gray-800",
      },
      published: {
        label: "Đã công bố",
        class: "bg-green-100 text-green-800",
      },
      ongoing: {
        label: "Đang diễn ra",
        class: "bg-blue-100 text-blue-800",
      },
      completed: {
        label: "Đã hoàn thành",
        class: "bg-purple-100 text-purple-800",
      },
      cancelled: {
        label: "Đã hủy",
        class: "bg-red-100 text-red-800",
      },
    },
    approval: {
      pending: { label: "Chờ duyệt", class: "bg-yellow-100 text-yellow-800" },
      approved: { label: "Đã duyệt", class: "bg-green-100 text-green-800" },
      rejected: { label: "Đã từ chối", class: "bg-red-100 text-red-800" },
    },
    booth: {
      active: {
        label: "Đang hoạt động",
        class: "bg-purple-100 text-purple-800",
      },
      pending: { label: "Chờ duyệt", class: "bg-yellow-100 text-yellow-800" },
      approved: { label: "Đã duyệt", class: "bg-green-100 text-green-800" },
      rejected: { label: "Đã từ chối", class: "bg-red-100 text-red-800" },
    },
    menuItem: {
      active: { label: "Hoạt động", class: "bg-green-100 text-green-800" },
      inactive: {
        label: "Ngừng hoạt động",
        class: "bg-gray-100 text-gray-800",
      },
    },
    location: {
      true: { label: "Đã đặt", class: "bg-red-100 text-red-800" },
      false: { label: "Trống", class: "bg-green-100 text-green-800" },
    },
  };

  const config = statusConfigs[type]?.[status] || {
    label: status,
    class: "bg-gray-100 text-gray-800",
  };
  return (
    <span
      className={`px-2 py-1 rounded-full text-xs font-medium ${config.class}`}
    >
      {config.label}
    </span>
  );
};

export const getStatusFestivalBadge = (status) => {
  const badges = {
    [FESTIVAL_STATUS.DRAFT]: {
      label: "Bản nháp",
      class: "bg-gray-100 text-gray-800",
      icon: <Edit size={16} />,
    },
    [FESTIVAL_STATUS.PUBLISHED]: {
      label: "Đã công bố",
      class: "bg-green-100 text-green-800",
      icon: <CheckCircle size={16} />,
    },
    [FESTIVAL_STATUS.ONGOING]: {
      label: "Đang diễn ra",
      class: "bg-blue-100 text-blue-800",
      icon: <Clock size={16} />,
    },
    [FESTIVAL_STATUS.COMPLETED]: {
      label: "Đã kết thúc",
      class: "bg-purple-100 text-purple-800",
      icon: <Trophy size={16} />,
    },
    [FESTIVAL_STATUS.CANCELLED]: {
      label: "Đã hủy",
      class: "bg-red-100 text-red-800",
      icon: <X size={16} />,
    },
  };

  const badge = badges[status] || badges[FESTIVAL_STATUS.DRAFT];
  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${badge.class}`}
    >
      {badge.icon}
      <span className="ml-1">{badge.label}</span>
    </span>
  );
};

export const calculateFestivalStats = (festival) => {
  const totalBooths =
    (festival.maxFoodBooths || 0) + (festival.maxBeverageBooths || 0);
  const registeredBooths =
    (festival.registeredFoodBooths || 0) +
    (festival.registeredBeverageBooths || 0);
  const availableBooths = totalBooths - registeredBooths;
  const occupancyRate =
    totalBooths > 0 ? Math.round((registeredBooths / totalBooths) * 100) : 0;

  return {
    totalBooths,
    registeredBooths,
    availableBooths,
    occupancyRate,
  };
};

export const getItemTypeLabel = (type) => {
  const types = {
    food: "Đồ ăn",
    beverage: "Đồ uống",
    dessert: "Tráng miệng",
    snack: "Đồ ăn vặt",
  };
  return types[type] || type;
};

export const getItemTypeIcon = (type) => {
  const icons = {
    food: "🍽️",
    beverage: "🥤",
    dessert: "🍰",
    snack: "🍿",
  };
  return icons[type] || "📦";
};

export const getOrderStatusColor = (status) => {
  const colors = {
    [ORDER_STATUS.PENDING]: "bg-yellow-100 text-yellow-800",
    [ORDER_STATUS.PAID]: "bg-green-100 text-green-800",
    [ORDER_STATUS.COMPLETED]: "bg-green-100 text-green-800",
    [ORDER_STATUS.CANCELLED]: "bg-red-100 text-red-800",
  };
  return colors[status] || "bg-gray-100 text-gray-800";
};

export const getFestivalStatusBadge = (status) => {
  const badges = {
    [FESTIVAL_STATUS.DRAFT]: {
      label: "Bản nháp",
      class: "bg-gray-100 text-gray-800",
      icon: <Edit size={16} />,
    },
    [FESTIVAL_STATUS.PUBLISHED]: {
      label: "Đã công bố",
      class: "bg-green-100 text-green-800",
      icon: <CheckCircle size={16} />,
    },
    [FESTIVAL_STATUS.ONGOING]: {
      label: "Đang diễn ra",
      class: "bg-blue-100 text-blue-800",
      icon: <Clock size={16} />,
    },
    [FESTIVAL_STATUS.COMPLETED]: {
      label: "Đã kết thúc",
      class: "bg-purple-100 text-purple-800",
      icon: <Trophy size={16} />,
    },
    [FESTIVAL_STATUS.CANCELLED]: {
      label: "Đã hủy",
      class: "bg-red-100 text-red-800",
      icon: <X size={16} />,
    },
  };

  const badge = badges[status] || badges[FESTIVAL_STATUS.DRAFT];
  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${badge.class}`}
    >
      {badge.icon}
      <span className="ml-1">{badge.label}</span>
    </span>
  );
};

// notification
export const timeAgo = (iso) => {
  if (!iso) return "";
  const diff = Date.now() - new Date(iso).getTime();
  const s = Math.floor(diff / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
};

export const navTargetByType = (n) => {
  const t = n.type;
  const d = n.data || {};

  switch (t) {
    case NOTIFICATION_EVENT.FESTIVAL_REQUESTED:
      return `/app/festivals`;

    case NOTIFICATION_EVENT.FESTIVAL_APPROVAL:
    case NOTIFICATION_EVENT.FESTIVAL_REJECT:
    case NOTIFICATION_EVENT.FESTIVAL_ONGOING:
    case NOTIFICATION_EVENT.FESTIVAL_PARTICIPANT:
    case NOTIFICATION_EVENT.FESTIVAL_COMMENT:
    case NOTIFICATION_EVENT.FESTIVAL_COMMISSION:
      return d.festivalId ? `/app/festivals/${d.festivalId}` : `/app/festivals`;

    case NOTIFICATION_EVENT.FESTIVAL_COMPLETED:
      return d.festivalId
        ? `/app/festivals/admin/${d.festivalId}`
        : `/app/festivals/admin`;

    case NOTIFICATION_EVENT.GROUP_ADD_MEMBER:
    case NOTIFICATION_EVENT.GROUP_UP_ROLE:
    case NOTIFICATION_EVENT.GROUP_DOWN_ROLE:
    case NOTIFICATION_EVENT.GROUP_REMOVE_MEMBER:
      return d.groupId ? `/app/groups/${d.groupId}/members` : `/app/groups`;

    case NOTIFICATION_EVENT.BOOTH_PENDING:
    case NOTIFICATION_EVENT.BOOTH_APPROVAL:
    case NOTIFICATION_EVENT.BOOTH_REJECTED:
    case NOTIFICATION_EVENT.BOOTH_ACTIVATED:
    case NOTIFICATION_EVENT.BOOTH_UPDATED:
      return d.boothId && d.groupId
        ? `/app/groups/${d.groupId}/booth/${d.boothId}`
        : `/app/groups`;

    default:
      return "/auth/login";
  }
};

//statistics
export const currency = (n) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(n);

export const sliceByDays = (raw, days) =>
  raw.slice(Math.max(0, raw.length - days));

export const fmtDay = (dt) =>
  dt.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" });
export const fmtMonth = (dt) =>
  dt.toLocaleDateString("vi-VN", { month: "2-digit", year: "numeric" });
export const fmtYear = (dt) => String(dt.getFullYear());

export const groupRevenue = (raw, granularity = "day") => {
  const map = new Map();
  for (const r of raw) {
    const key =
      granularity === "day"
        ? fmtDay(r.dt)
        : granularity === "month"
        ? fmtMonth(r.dt)
        : fmtYear(r.dt);
    map.set(key, (map.get(key) || 0) + r.revenue);
  }
  return Array.from(map.entries()).map(([label, revenue]) => ({
    label,
    revenue,
  }));
};

export const mapRevenueSeriesToRaw = (series = []) =>
  series.map((p) => ({
    dt: new Date(p.date),
    revenue: p.revenue,
    orders: p.orders,
  }));

export const buildAdminParams = ({
  range,
  startDate,
  endDate,
  schoolId,
  festivalId,
} = {}) => {
  const p = {};
  if (range) p.range = range;
  if (startDate && endDate) {
    p.startDate = startDate;
    p.endDate = endDate;
  }
  if (schoolId) p.schoolId = schoolId;
  if (festivalId) p.festivalId = festivalId;
  return p;
};

export const buildSchoolParams = ({
  range,
  startDate,
  endDate,
  schoolId,
  festivalId,
} = {}) => {
  const p = {};
  if (range) p.range = range;
  if (startDate && endDate) {
    p.start_date = startDate;
    p.end_date = endDate;
  }
  if (schoolId) p.schoolId = schoolId;
  if (festivalId) p.festival_id = festivalId;
  return p;
};

export const buildRevenueParams = ({
  range,
  startDate,
  endDate,
  granularity = "day",
  schoolId,
  festivalId,
} = {}) => {
  const p = { granularity };
  if (range) p.range = range;
  if (startDate && endDate) {
    p.start_date = startDate;
    p.end_date = endDate;
  }
  if (schoolId) p.school_id = schoolId;
  if (festivalId) p.festival_id = festivalId;
  return p;
};

export const STATUS_LABEL_MAP = Object.fromEntries(
  BOOTH_STATUS_LABELS.map((i) => [i.value, i.label])
);