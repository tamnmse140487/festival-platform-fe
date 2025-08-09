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
};

export const ORDER_STATUS = {
  PENDING: "pending",
  PAID: "paid",
  CANCELLED: "cancelled",
};

export const ORDER_STATUS_LABELS = {
  [ORDER_STATUS.PENDING]: "Chờ thanh toán",
  [ORDER_STATUS.PAID]: "Đã thanh toán",
  [ORDER_STATUS.CANCELLED]: "Đã hủy",
};

export const PAYMENT_METHOD = {
  WALLET: "wallet",
  ACCOUNT_POINTS: "account_points",
  CASH: "cash",
  BANK: "bank",
};

export const PAYMENT_METHOD_LABELS = {
  [PAYMENT_METHOD.WALLET]: "Ví điện tử",
  [PAYMENT_METHOD.ACCOUNT_POINTS]: "Điểm tích lũy",
  [PAYMENT_METHOD.CASH]: "Tiền mặt",
  [PAYMENT_METHOD.BANK]: "Chuyển khoản",
};

export const PAYMENT_TYPE = {
  TOPUP: "topup",
  REFUND: "refund",
  ORDER: "order",
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
