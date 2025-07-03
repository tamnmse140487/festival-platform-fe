export const ROLE_NAME = {
  ADMIN: "Admin",
  SCHOOL_MANAGER: "SchoolManager",
  TEACHER: "Teacher",
  STUDENT: "Student",
  SUPPLIER: "Supplier",
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
