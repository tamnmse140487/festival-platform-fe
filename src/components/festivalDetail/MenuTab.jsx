import React from 'react';
import { ShoppingCart, Image as ImageIcon } from 'lucide-react';
import Card from '../common/Card';

const MenuTab = ({ festivalMenu, menuItems, menuItemImages, loading }) => {

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <Card.Content>
            <div className="animate-pulse space-y-4">
              <div className="h-6 bg-gray-200 rounded w-1/3"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </Card.Content>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {festivalMenu ? (
        <>
          <Card>
            <Card.Header>
              <Card.Title>{festivalMenu.menuName}</Card.Title>
              <Card.Description>{festivalMenu.description}</Card.Description>
            </Card.Header>
          </Card>

          <Card>
            <Card.Header>
              <Card.Title>Danh sách món ăn/đồ uống</Card.Title>
            </Card.Header>
            <Card.Content>
              {menuItems.length > 0 ? (
                <div className="space-y-4">
                  {menuItems.map((item) => {
                    return (
                      <div key={item.itemId} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">


                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{item.itemName}</h4>
                          <p className="text-sm text-gray-600">{item.description}</p>
                          <span className={`inline-block mt-1 px-2 py-1 rounded-full text-xs ${item.itemType === 'food'
                            ? 'bg-orange-100 text-orange-800'
                            : 'bg-blue-100 text-blue-800'
                            }`}>
                            {item.itemType === 'food' ? 'Đồ ăn' : 'Đồ uống'}
                          </span>
                        </div>

                        <div className="text-right">
                          <p className="font-semibold text-gray-900">
                            {item.minPrice.toLocaleString('vi-VN')} ₫ - {item.maxPrice.toLocaleString('vi-VN')} ₫
                          </p>
                          <p className="text-sm text-gray-600">Khoảng giá</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-gray-600">Chưa có món ăn nào được thêm vào thực đơn.</p>
              )}
            </Card.Content>
          </Card>
        </>
      ) : (
        <Card>
          <Card.Content>
            <div className="text-center py-8">
              <ShoppingCart className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có thực đơn</h3>
              <p className="text-gray-600">Thực đơn lễ hội chưa được thiết lập.</p>
            </div>
          </Card.Content>
        </Card>
      )}
    </div>
  );
};

export default MenuTab;