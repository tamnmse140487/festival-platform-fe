import React, { useState, useEffect } from "react";
import { UtensilsCrossed, DollarSign, Package } from "lucide-react";
import { toast } from "react-hot-toast";
import { boothServices } from "../../../services/boothServices";
import { boothMenuItemServices } from "../../../services/boothMenuItemServices";
import { menuItemServices } from "../../../services/menuItemServices";
import { imageServices } from "../../../services/imageServices";

const BoothMenu = ({ groupId, boothId: boothIdProp }) => {
  const [booth, setBooth] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchMenuData = async () => {
    setLoading(true);
    try {
      let boothData = null;

      if (boothIdProp) {
        const boothResp = await boothServices.get({ boothId: boothIdProp });
        boothData = boothResp?.data?.[0] || null;


      } else if (groupId) {
        const boothResponse = await boothServices.get({ groupId });
        boothData = boothResponse.data?.[0] || null;
      }

      setBooth(boothData);

      if (boothData?.boothId) {
        const boothMenuResponse = await boothMenuItemServices.get({
          boothId: boothData.boothId,
        });
        const boothMenuItems = boothMenuResponse.data || [];
        const menuItemsWithDetails = await Promise.all(
          boothMenuItems.map(async (boothMenuItem) => {
            try {
              const menuItemResponse = await menuItemServices.get({
                itemId: boothMenuItem.menuItemId,
              });
              const menuItemData = menuItemResponse.data?.[0] || {};

              const imageResponse = await imageServices.get({
                boothMenuItemId: boothMenuItem.boothMenuItemId,
              });

              const imageData =
                (imageResponse.data || []).find(
                  (img) => img.boothMenuItemId === boothMenuItem.boothMenuItemId
                ) || null;

              return {
                ...boothMenuItem,
                ...menuItemData,
                image: imageData,
              };
            } catch (error) {
              console.error(
                `Error fetching menu item ${boothMenuItem.menuItemId}:`,
                error
              );
              return boothMenuItem;
            }
          })
        );

        setMenuItems(menuItemsWithDetails);
      }
    } catch (error) {
      toast.error("Không thể tải menu gian hàng");
      console.error("Error fetching menu:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (boothIdProp || groupId) fetchMenuData();
  }, [boothIdProp, groupId]);

  const getItemTypeColor = (itemType) => {
    const colors = {
      food: "bg-orange-100 text-orange-800",
      beverage: "bg-blue-100 text-blue-800",
      dessert: "bg-pink-100 text-pink-800",
      snack: "bg-yellow-100 text-yellow-800",
    };
    return colors[itemType?.toLowerCase()] || "bg-gray-100 text-gray-800";
  };

  const getItemTypeLabel = (itemType) => {
    const labels = {
      food: "Món chính",
      dessert: "Tráng miệng",
      snack: "Đồ ăn vặt",
      beverage: "Thức uống",
    };
    return labels[itemType?.toLowerCase()] || itemType;
  };

  const getQuantityStatusColor = (remainingQuantity, quantityLimit) => {
    if (!quantityLimit) return "text-gray-500";
    const percentage = (remainingQuantity / quantityLimit) * 100;
    if (percentage >= 90) return "text-red-600";
    if (percentage >= 70) return "text-orange-600";
    if (percentage >= 50) return "text-yellow-600";
    return "text-green-600";
  };

  const getQuantityStatus = (remainingQuantity, quantityLimit) => {
    if (!quantityLimit) return "Không giới hạn";
    const available = quantityLimit - (remainingQuantity || 0);
    if (available <= 0) return "Hết hàng";
    return `Còn ${available}/${quantityLimit}`;
  };

  useEffect(() => {
    if (groupId) {
      fetchMenuData();
    }
  }, [groupId]);

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
        <p className="text-gray-600 mt-2">Đang tải menu gian hàng...</p>
      </div>
    );
  }

  if (!booth) {
    return (
      <div className="text-center py-12">
        <UtensilsCrossed className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Chưa có gian hàng
        </h3>
        <p className="text-gray-600">Nhóm chưa đăng ký gian hàng nào.</p>
      </div>
    );
  }

  if (menuItems.length === 0) {
    return (
      <div className="text-center py-12">
        <UtensilsCrossed className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có menu</h3>
        <p className="text-gray-600">
          Gian hàng chưa có món ăn nào trong menu.
        </p>
      </div>
    );
  }

  const groupedItems = menuItems.reduce((acc, item) => {
    const type = item.itemType || "other";
    if (!acc[type]) {
      acc[type] = [];
    }
    acc[type].push(item);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {Object.entries(groupedItems).map(([itemType, items]) => (
        <div
          key={itemType}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {items.map((item) => (
            <div
              key={item.menuItemId}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              {item.image && (
                <div className="w-full h-32 mb-3 rounded-lg overflow-hidden">
                  <img
                    src={item.image.imageUrl}
                    alt={item.itemName}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="flex items-start justify-between mb-2">
                <h6 className="font-medium text-gray-900 flex-1">
                  {item.itemName || "Chưa có tên"}
                </h6>
                <span
                  className={`px-2 py-1 text-xs font-medium rounded ${getItemTypeColor(
                    item.itemType
                  )}`}
                >
                  {getItemTypeLabel(item.itemType)}
                </span>
              </div>

              {item.description && (
                <p className="text-sm text-gray-600 mb-3">{item.description}</p>
              )}

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-green-600">
                    <DollarSign size={16} className="mr-1" />
                    <span className="font-semibold">
                      {item.customPrice?.toLocaleString() || 0}đ
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center text-gray-500">
                    <Package size={14} className="mr-1" />
                    <span>Số lượng:</span>
                  </div>
                  <span
                    className={`font-medium ${getQuantityStatusColor(
                      item.remainingQuantity,
                      item.quantityLimit
                    )}`}
                  >
                    {getQuantityStatus(
                      item.remainingQuantity,
                      item.quantityLimit
                    )}
                  </span>
                </div>

                {item.quantityLimit && (
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${
                        ((item.remainingQuantity || 0) / item.quantityLimit) *
                          100 >=
                        90
                          ? "bg-red-500"
                          : ((item.remainingQuantity || 0) /
                              item.quantityLimit) *
                              100 >=
                            70
                          ? "bg-orange-500"
                          : ((item.remainingQuantity || 0) /
                              item.quantityLimit) *
                              100 >=
                            50
                          ? "bg-yellow-500"
                          : "bg-green-500"
                      }`}
                      style={{
                        width: `${Math.min(
                          ((item.remainingQuantity || 0) / item.quantityLimit) *
                            100,
                          100
                        )}%`,
                      }}
                    ></div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ))}

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>Tổng số món trong menu:</span>
          <span className="font-semibold">{menuItems.length} món</span>
        </div>
      </div>
    </div>
  );
};

export default BoothMenu;
