export const getRoleDisplayName = (role) => {
  const roleNames = {
    'Admin': 'Quản trị viên',
    'SchoolManager': 'Quản lý trường',
    'Teacher': 'Giáo viên',
    'Student': 'Học sinh',
    'Supplier': 'Nhà cung cấp',
    'guest': 'Khách'
  };
  return roleNames[role] || 'Người dùng';
};