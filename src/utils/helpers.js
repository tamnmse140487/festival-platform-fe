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

export const formatPrice = (price) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(price);
};

export const formatNumber = (num) => {
  return new Intl.NumberFormat('vi-VN').format(num);
};

export const getStatusBadge = (status, type = 'default') => {
  const statusConfigs = {
    festival: {
      draft: { label: 'Nháp', class: 'bg-gray-100 text-gray-800' },
      published: { label: 'Đã công bố', class: 'bg-green-100 text-green-800' },
      cancelled: { label: 'Đã hủy', class: 'bg-red-100 text-red-800' }
    },
    approval: {
      pending: { label: 'Chờ duyệt', class: 'bg-yellow-100 text-yellow-800' },
      approved: { label: 'Đã duyệt', class: 'bg-green-100 text-green-800' },
      rejected: { label: 'Đã từ chối', class: 'bg-red-100 text-red-800' }
    },
    booth: {
      pending: { label: 'Chờ duyệt', class: 'bg-yellow-100 text-yellow-800' },
      approved: { label: 'Đã duyệt', class: 'bg-green-100 text-green-800' },
      rejected: { label: 'Đã từ chối', class: 'bg-red-100 text-red-800' }
    },
    menuItem: {
      active: { label: 'Hoạt động', class: 'bg-green-100 text-green-800' },
      inactive: { label: 'Ngừng hoạt động', class: 'bg-gray-100 text-gray-800' }
    },
    location: {
      true: { label: 'Đã thuê', class: 'bg-red-100 text-red-800' },
      false: { label: 'Trống', class: 'bg-green-100 text-green-800' }
    }
  };

  const config = statusConfigs[type]?.[status] || { label: status, class: 'bg-gray-100 text-gray-800' };
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.class}`}>
      {config.label}
    </span>
  );
};

export const calculateFestivalStats = (festival) => {
  const totalBooths = (festival.maxFoodBooths || 0) + (festival.maxBeverageBooths || 0);
  const registeredBooths = (festival.registeredFoodBooths || 0) + (festival.registeredBeverageBooths || 0);
  const availableBooths = totalBooths - registeredBooths;
  const occupancyRate = totalBooths > 0 ? Math.round((registeredBooths / totalBooths) * 100) : 0;

  return {
    totalBooths,
    registeredBooths,
    availableBooths,
    occupancyRate
  };
};

export const getItemTypeLabel = (type) => {
  const types = {
    food: 'Đồ ăn',
    beverage: 'Đồ uống',
    dessert: 'Tráng miệng',
    snack: 'Đồ ăn vặt'
  };
  return types[type] || type;
};

export const getItemTypeIcon = (type) => {
  const icons = {
    food: '🍽️',
    beverage: '🥤',
    dessert: '🍰',
    snack: '🍿'
  };
  return icons[type] || '📦';
};