import React, { useState, useEffect } from 'react'
import { Store, MapPin } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { boothServices } from '../../services/boothServices'
import { festivalServices } from '../../services/festivalServices'
import { mapLocationServices } from '../../services/mapLocationServices'
import { festivalMapServices } from '../../services/festivalMapServices'
import { imageServices } from '../../services/imageServices'

const BoothInfo = ({ groupId }) => {
  const [booth, setBooth] = useState(null)
  const [festival, setFestival] = useState(null)
  const [location, setLocation] = useState(null)
  const [mapUrl, setMapUrl] = useState(null)
  const [festivalImages, setFestivalImages] = useState([])
  const [boothImages, setBoothImages] = useState([])
  const [loading, setLoading] = useState(false)

  const fetchBoothData = async () => {
    setLoading(true)
    try {
      const boothResponse = await boothServices.get({ groupId })
      const boothData = boothResponse.data?.[0] || null
      setBooth(boothData)

      if (boothData) {
        const [
          festivalResponse,
          locationResponse,
          boothImagesResponse
        ] = await Promise.all([
          festivalServices.get({ id: boothData.festivalId }),
          mapLocationServices.get({ id: boothData.locationId }),
          imageServices.get({ boothId: boothData.boothId })
        ])
        
        setFestival(festivalResponse.data?.[0] || null)
        setLocation(locationResponse.data?.[0] || null)
        setBoothImages(boothImagesResponse.data || [])

        if (festivalResponse.data?.[0]) {
          const [festivalImagesResponse, mapResponse] = await Promise.all([
            imageServices.get({ festivalId: boothData.festivalId }),
            festivalMapServices.get({ festivalId: boothData.festivalId })
          ])
          
          setFestivalImages(festivalImagesResponse.data || [])
          setMapUrl(mapResponse.data?.[0]?.mapUrl || null)
        }
      }
    } catch (error) {
      toast.error('Không thể tải thông tin gian hàng')
      console.error('Error fetching booth:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      'approved': { label: 'Đã duyệt', class: 'bg-green-100 text-green-800' },
      'pending': { label: 'Chờ duyệt', class: 'bg-yellow-100 text-yellow-800' },
      'rejected': { label: 'Từ chối', class: 'bg-red-100 text-red-800' }
    }
    
    const config = statusConfig[status] || statusConfig.pending
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded ${config.class}`}>
        {config.label}
      </span>
    )
  }

  useEffect(() => {
    if (groupId) {
      fetchBoothData()
    }
  }, [groupId])

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
        <p className="text-gray-600 mt-2">Đang tải thông tin gian hàng...</p>
      </div>
    )
  }

  if (!booth) {
    return (
      <div className="text-center py-12">
        <Store className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có gian hàng</h3>
        <p className="text-gray-600">Nhóm chưa đăng ký gian hàng nào.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-semibold text-gray-900">Thông tin gian hàng</h4>
          {getStatusBadge(booth.status)}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-sm font-medium text-gray-500">Tên gian hàng</label>
            <p className="text-gray-900 mt-1">{booth.boothName}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Loại gian hàng</label>
            <p className="text-gray-900 mt-1">{booth.boothType}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Điểm tích lũy</label>
            <p className="text-gray-900 mt-1">{booth.pointsBalance} điểm</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Ngày đăng ký</label>
            <p className="text-gray-900 mt-1">{formatDate(booth.registrationDate)}</p>
          </div>
          {booth.approvalDate && (
            <div>
              <label className="text-sm font-medium text-gray-500">Ngày duyệt</label>
              <p className="text-gray-900 mt-1">{formatDate(booth.approvalDate)}</p>
            </div>
          )}
        </div>

        {booth.description && (
          <div className="mt-4">
            <label className="text-sm font-medium text-gray-500">Mô tả</label>
            <p className="text-gray-900 mt-1">{booth.description}</p>
          </div>
        )}

        {booth.note && (
          <div className="mt-4">
            <label className="text-sm font-medium text-gray-500">Ghi chú</label>
            <p className="text-gray-900 mt-1">{booth.note}</p>
          </div>
        )}

        {boothImages.length > 0 && (
          <div className="mt-6">
            <label className="text-sm font-medium text-gray-500 mb-3 block">Hình ảnh gian hàng</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {boothImages.map((image, index) => (
                <img
                  key={index}
                  src={image.imageUrl}
                  alt={`Booth ${index + 1}`}
                  className="w-full h-32 object-cover rounded-lg border"
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {festival && (
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-6">
          <h5 className="text-lg font-semibold text-gray-900 mb-4">Thông tin lễ hội</h5>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Tên lễ hội</label>
              <p className="text-gray-900 mt-1">{festival.festivalName}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Chủ đề</label>
              <p className="text-gray-900 mt-1">{festival.theme}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Địa điểm</label>
              <p className="text-gray-900 mt-1">{festival.location}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Thời gian</label>
              <p className="text-gray-900 mt-1">
                {formatDate(festival.startDate)} - {formatDate(festival.endDate)}
              </p>
            </div>
          </div>

          {festivalImages.length > 0 && (
            <div className="mt-4">
              <label className="text-sm font-medium text-gray-500 mb-3 block">Hình ảnh lễ hội</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {festivalImages.map((image, index) => (
                  <img
                    key={index}
                    src={image.imageUrl}
                    alt={`Festival ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg border"
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {location && (
        <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-6">
          <h5 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <MapPin size={20} className="mr-2 text-green-600" />
            Vị trí gian hàng
          </h5>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Tên vị trí</label>
              <p className="text-gray-900 mt-1">{location.locationName}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Loại vị trí</label>
              <p className="text-gray-900 mt-1">{location.locationType}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Tọa độ</label>
              <p className="text-gray-900 mt-1">{location.coordinates}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Trạng thái</label>
              <p className="text-gray-900 mt-1">
                {location.isOccupied ? 'Đã có người' : 'Còn trống'}
              </p>
            </div>
          </div>

          {mapUrl && (
            <div className="mt-4">
              <label className="text-sm font-medium text-gray-500 mb-3 block">Bản đồ lễ hội</label>
              <img
                src={mapUrl}
                alt="Festival Map"
                className="w-full max-w-lg h-64 object-cover rounded-lg border mx-auto"
              />
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default BoothInfo