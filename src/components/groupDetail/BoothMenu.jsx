import React, { useState, useEffect } from 'react'
import { UtensilsCrossed, DollarSign } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { boothServices } from '../../services/boothServices'
import { boothMenuItemServices } from '../../services/boothMenuItemServices'
import { menuItemServices } from '../../services/menuItemServices'

const BoothMenu = ({ groupId }) => {
  const [booth, setBooth] = useState(null)
  const [menuItems, setMenuItems] = useState([])
  const [loading, setLoading] = useState(false)

  const fetchMenuData = async () => {
    setLoading(true)
    try {
      const boothResponse = await boothServices.get({ groupId })
      const boothData = boothResponse.data?.[0] || null
      setBooth(boothData)

      if (boothData?.boothId) {
        const boothMenuResponse = await boothMenuItemServices.get({ 
          boothId: boothData.boothId 
        })
        const boothMenuItems = boothMenuResponse.data || []

        const menuItemsWithDetails = await Promise.all(
          boothMenuItems.map(async (boothMenuItem) => {
            try {
              const menuItemResponse = await menuItemServices.get({ 
                itemId: boothMenuItem.menuItemId 
              })
              const menuItemData = menuItemResponse.data?.[0] || {}
              
              return {
                ...boothMenuItem,
                ...menuItemData
              }
            } catch (error) {
              console.error(`Error fetching menu item ${boothMenuItem.menuItemId}:`, error)
              return boothMenuItem
            }
          })
        )

        setMenuItems(menuItemsWithDetails)
      }
    } catch (error) {
      toast.error('Không thể tải menu gian hàng')
      console.error('Error fetching menu:', error)
    } finally {
      setLoading(false)
    }
  }

  const getItemTypeColor = (itemType) => {
    const colors = {
      'food': 'bg-orange-100 text-orange-800',
      'drink': 'bg-blue-100 text-blue-800',
      'dessert': 'bg-pink-100 text-pink-800',
      'snack': 'bg-yellow-100 text-yellow-800'
    }
    return colors[itemType?.toLowerCase()] || 'bg-gray-100 text-gray-800'
  }

  const getItemTypeLabel = (itemType) => {
    const labels = {
      'food': 'Món chính',
      'drink': 'Đồ uống',
      'dessert': 'Tráng miệng',
      'snack': 'Đồ ăn vặt'
    }
    return labels[itemType?.toLowerCase()] || itemType
  }

  useEffect(() => {
    if (groupId) {
      fetchMenuData()
    }
  }, [groupId])

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
        <p className="text-gray-600 mt-2">Đang tải menu gian hàng...</p>
      </div>
    )
  }

  if (!booth) {
    return (
      <div className="text-center py-12">
        <UtensilsCrossed className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có gian hàng</h3>
        <p className="text-gray-600">Nhóm chưa đăng ký gian hàng nào.</p>
      </div>
    )
  }

  if (menuItems.length === 0) {
    return (
      <div className="text-center py-12">
        <UtensilsCrossed className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có menu</h3>
        <p className="text-gray-600">Gian hàng chưa có món ăn nào trong menu.</p>
      </div>
    )
  }

  const groupedItems = menuItems.reduce((acc, item) => {
    const type = item.itemType || 'other'
    if (!acc[type]) {
      acc[type] = []
    }
    acc[type].push(item)
    return acc
  }, {})

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-lg p-6">
        <div className="flex items-center mb-4">
          <UtensilsCrossed className="w-6 h-6 text-orange-600 mr-3" />
          <h4 className="text-lg font-semibold text-gray-900">
            Menu gian hàng: {booth.boothName}
          </h4>
        </div>
        
        <div className="text-sm text-gray-600">
          Tổng cộng: {menuItems.length} món ăn
        </div>
      </div>

      {Object.entries(groupedItems).map(([itemType, items]) => (
        <div key={itemType} className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h5 className="text-lg font-semibold text-gray-900">
              {getItemTypeLabel(itemType)}
            </h5>
            <span className={`px-3 py-1 text-sm font-medium rounded-full ${getItemTypeColor(itemType)}`}>
              {items.length} món
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((item) => (
              <div key={item.menuItemId} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-2">
                  <h6 className="font-medium text-gray-900 flex-1">
                    {item.itemName || 'Chưa có tên'}
                  </h6>
                  <span className={`px-2 py-1 text-xs font-medium rounded ${getItemTypeColor(item.itemType)}`}>
                    {getItemTypeLabel(item.itemType)}
                  </span>
                </div>
                
                {item.description && (
                  <p className="text-sm text-gray-600 mb-3">
                    {item.description}
                  </p>
                )}
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-green-600">
                    <DollarSign size={16} className="mr-1" />
                    <span className="font-semibold">
                      {item.basePrice?.toLocaleString() || 0}đ
                    </span>
                  </div>
                  
                  <div className="text-sm text-gray-500">
                    Giới hạn: {item.quantityLimit || 'Không giới hạn'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>Tổng số món trong menu:</span>
          <span className="font-semibold">{menuItems.length} món</span>
        </div>
        <div className="flex items-center justify-between text-sm text-gray-600 mt-1">
          <span>Giá trung bình:</span>
          <span className="font-semibold">
            {menuItems.length > 0 
              ? Math.round(menuItems.reduce((sum, item) => sum + (item.basePrice || 0), 0) / menuItems.length).toLocaleString()
              : 0
            }đ
          </span>
        </div>
      </div>
    </div>
  )
}

export default BoothMenu