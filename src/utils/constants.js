export const ROLE_NAME = {
  ADMIN: "Admin",
  SCHOOL_MANAGER: "SchoolManager",
  TEACHER: "Teacher",
  STUDENT: "Student",
  SUPPLIER: "Supplier",
  USER: "User",
};

export const FESTIVAL_APPROVAL_STATUS = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
};

export const FESTIVAL_APPROVAL_STATUS_LABELS = {
  pending: "Chờ duyệt",
  approved: "Đã duyệt",
  rejected: "Đã từ chối",
};

export const FESTIVAL_STATUS = {
  DRAFT: "draft",
  PUBLISHED: "published",
  ONGOING: "ongoing",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
};

export const FESTIVAL_INGREDIENT_STATUS = {
  AVAILABLE: "available",
  LIMITED: "limited",
  OUT_OF_STOCK: "out_of_stock",
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
};

export const BOOTH_STATUS = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
  ACTIVE: "active",
  CLOSED: "closed"
};

export const BOOTH_STATUS_LABELS =[
  {value: BOOTH_STATUS.PENDING, label: "Chờ duyệt"},
  {value: BOOTH_STATUS.APPROVED, label: "Đã được duyệt"},
  {value: BOOTH_STATUS.REJECTED, label: "Đã bị từ chối"},
  {value: BOOTH_STATUS.ACTIVE, label: "Đang hoạt động"},
  {value: BOOTH_STATUS.CLOSED, label: "Đã đóng"},
]

export const ORDER_STATUS = {
  COMPLETED: "Completed",
  PENDING: "pending",
  PAID: "paid",
  CANCELLED: "cancelled",
};

export const ORDER_STATUS_LABELS = {
  [ORDER_STATUS.PENDING]: "Chờ thanh toán",
  [ORDER_STATUS.PAID]: "Đã thanh toán",
  [ORDER_STATUS.COMPLETED]: "Đã thanh toán",
  [ORDER_STATUS.CANCELLED]: "Đã hủy",
};

export const PAYMENT_METHOD = {
  WALLET: "wallet",
  ACCOUNT_POINTS: "account_points",
  CASH: "cash",
  BANK: "bank",
};

export const PAYMENT_METHOD_LABELS = {
  [PAYMENT_METHOD.ACCOUNT_POINTS]: "Điểm tích lũy",
  [PAYMENT_METHOD.CASH]: "Tiền mặt",
  [PAYMENT_METHOD.BANK]: "Chuyển khoản",
};

export const PAYMENT_TYPE = {
  TOPUP: "topup",
  REFUND: "refund",
  ORDER: "order",
};

export const HISTORY_TYPE = {
  TOPUP: "topup",
  REFUND: "refund",
  CREATE_SUB_WALLET: "create_sub_wallet",
  TRANSFER: "transfer",
  RETURN_TRANSFER: "return_transfer",
  PAYMENT: "payment",
  COMMISSION: "commission",
};

export const GROUP_ROLE = {
  LEADER: "leader",
  MEMBER: "member",
  HOMEROOM_TEACHER: "homeroom_teacher",
  TREASURER: "treasurer",
};

export const GROUP_ROLE_LABELS = {
  [GROUP_ROLE.LEADER]: "Nhóm trưởng",
  [GROUP_ROLE.MEMBER]: "Thành viên",
  [GROUP_ROLE.HOMEROOM_TEACHER]: "Giáo viên chủ nhiệm",
  [GROUP_ROLE.TREASURER]: "Thủ quỹ",
};

export const getRoleColor = (role) => {
  const colors = {
    [GROUP_ROLE.LEADER]: "bg-purple-100 text-purple-800",
    [GROUP_ROLE.MEMBER]: "bg-blue-100 text-blue-800",
    [GROUP_ROLE.HOMEROOM_TEACHER]: "bg-green-100 text-green-800",
    [GROUP_ROLE.TREASURER]: "bg-orange-100 text-orange-800",
  };
  return colors[role] || "bg-gray-100 text-gray-800";
};

export const TOPUP_PACKAGES = [
  { value: 10000, label: "10.000 VND" },
  { value: 50000, label: "50.000 VND" },
  { value: 100000, label: "100.000 VND" },
  { value: 200000, label: "200.000 VND" },
  { value: 500000, label: "500.000 VND" },
  { value: 1000000, label: "1.000.000 VND" },
];

export const TIME_RANGES = {
  "7d": { label: "7 ngày qua", days: 7 },
  "1m": { label: "1 tháng qua", days: 30 },
  "3m": { label: "3 tháng qua", days: 90 },
  "1y": { label: "1 năm qua", days: 365 },
};

export const COLORS = [
  "#6366f1",
  "#22c55e",
  "#f59e0b",
  "#ef4444",
  "#06b6d4",
  "#a855f7",
]; 

export const NOTIFICATION_EVENT = {
  FESTIVAL_REQUESTED: "festival_requested",
  FESTIVAL_APPROVAL: "festival_approval",
  FESTIVAL_REJECT: "festival_reject",
  FESTIVAL_ONGOING: "festival_ongoing",
  FESTIVAL_COMPLETED: "festival_completed",
  FESTIVAL_PARTICIPANT: "festival_participant",
  FESTIVAL_COMMENT: "festival_comment",
  FESTIVAL_COMMISSION: "festival_commission",
  GROUP_ADD_MEMBER: "group_add_member",
  GROUP_UP_ROLE: "group_up_role",
  GROUP_REMOVE_MEMBER: "group_remove_member",
  GROUP_DOWN_ROLE: "group_down_role",
  BOOTH_PENDING: "booth_pending",
  BOOTH_APPROVAL: "booth_approval",
  BOOTH_REJECTED: "booth_rejected",
  BOOTH_ACTIVATED: "booth_active",
  BOOTH_UPDATED: "booth_updated",
};
