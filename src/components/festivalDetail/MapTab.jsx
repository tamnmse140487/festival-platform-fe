import React, { useState } from "react";
import { MapPin, Store } from "lucide-react";
import Card from "../common/Card";
import Modal from "../common/Modal";
import { BOOTH_STATUS, FESTIVAL_STATUS, ROLE_NAME } from "../../utils/constants";
import BoothRegistrationModal from "../booths/BoothRegistrationModal";
import { useAuth } from "../../contexts/AuthContext";
import Button from "../common/Button";
import { convertToVietnamTimeWithFormat } from "../../utils/formatters";
import dayjs from "dayjs";
import { boothServices } from "../../services/boothServices";
import { imageServices } from "../../services/imageServices";
import { menuItemServices } from "../../services/menuItemServices";

const getStatusBadge = (status) => {
  const statusConfig = {
    [BOOTH_STATUS.APPROVED]: { label: "Đã duyệt", class: "bg-green-100 text-green-800" },
    [BOOTH_STATUS.PENDING]: { label: "Chờ duyệt", class: "bg-yellow-100 text-yellow-800" },
    [BOOTH_STATUS.REJECTED]: { label: "Từ chối", class: "bg-red-100 text-red-800" },
    [BOOTH_STATUS.ACTIVE]: { label: "Hoạt động", class: "bg-blue-100 text-blue-800" },
    [BOOTH_STATUS.CLOSED]: { label: "Đã đóng", class: "bg-gray-100 text-gray-800" },
  };
  const config = statusConfig[status] || statusConfig[BOOTH_STATUS.PENDING];
  return <span className={`px-2 py-1 text-xs font-medium rounded ${config.class}`}>{config.label}</span>;
};

const MapTab = ({ festivalMap, mapLocations, festival, loading, menuItems = [] }) => {
  const { user, hasRole } = useAuth();
  const [showRegisterBoothModal, setShowRegisterBoothModal] = useState(false);
  const [registrationMessage, setRegistrationMessage] = useState("");

  const [selectedLocation, setSelectedLocation] = useState(null);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [loadingBooths, setLoadingBooths] = useState(false);
  const [locationBooths, setLocationBooths] = useState([]);
  const [boothMenuItemImages, setBoothMenuItemImages] = useState({}); 
  const [menuItemDetails, setMenuItemDetails] = useState({}); 

  const handleRegisterBoothModalClose = () => setShowRegisterBoothModal(false);

  const handleRegisterBoothClick = () => {
    const now = dayjs().tz("Asia/Ho_Chi_Minh");
    const start = dayjs.utc(festival.registrationStartDate).tz("Asia/Ho_Chi_Minh");
    const end = dayjs.utc(festival.registrationEndDate).tz("Asia/Ho_Chi_Minh");
    if (!start.isValid() || !end.isValid()) {
      setRegistrationMessage("Thời gian đăng ký không hợp lệ.");
      return;
    }
    if (now.isBefore(start)) {
      setRegistrationMessage(
        `Chưa tới thời gian đăng ký. Thời gian đăng ký từ ${convertToVietnamTimeWithFormat(
          festival.registrationStartDate
        )} đến ${convertToVietnamTimeWithFormat(festival.registrationEndDate)}`
      );
      return;
    }
    if (now.isAfter(end)) {
      setRegistrationMessage(
        `Đã hết thời gian đăng ký. Thời gian đăng ký từ ${convertToVietnamTimeWithFormat(
          festival.registrationStartDate
        )} đến ${convertToVietnamTimeWithFormat(festival.registrationEndDate)}`
      );
      return;
    }
    setRegistrationMessage("");
    setShowRegisterBoothModal(true);
  };

  const openLocationModal = async (loc) => {
    setSelectedLocation(loc);
    setShowLocationModal(true);
    setLoadingBooths(true);
    setLocationBooths([]);
    setBoothMenuItemImages({});
    setMenuItemDetails({});
    try {
      const res = await boothServices.get({ locationId: loc.locationId || loc.id });
      const booths = Array.isArray(res?.data) ? res.data : [];
      setLocationBooths(booths);

      const allMenuItems = booths.flatMap((b) => Array.isArray(b.boothMenuItems) ? b.boothMenuItems : []);
      const uniqueBoothMenuItemIds = Array.from(new Set(allMenuItems.map((m) => m.boothMenuItemId).filter(Boolean)));
      const uniqueMenuItemIds = Array.from(new Set(allMenuItems.map((m) => m.menuItemId).filter(Boolean)));

      const imagePairs = await Promise.all(
        uniqueBoothMenuItemIds.map(async (id) => {
          try {
            const imgRes = await imageServices.get({ boothMenueItemid: id });
            const list = Array.isArray(imgRes?.data) ? imgRes.data : [];
            const firstUrl = list[0]?.imageUrl || "";
            return [id, firstUrl];
          } catch {
            return [id, ""];
          }
        })
      );
      setBoothMenuItemImages(Object.fromEntries(imagePairs));

      const detailPairs = await Promise.all(
        uniqueMenuItemIds.map(async (mid) => {
          try {
            const dRes = await menuItemServices.get({ itemId: mid });
            const data = Array.isArray(dRes?.data) ? dRes.data[0] : dRes?.data || {};
            return [mid, { itemName: data.itemName || data.name || "", description: data.description || "" }];
          } catch {
            return [mid, { itemName: "", description: "" }];
          }
        })
      );
      setMenuItemDetails(Object.fromEntries(detailPairs));
    } catch (e) {
      console.error("Load booths by location error:", e);
    } finally {
      setLoadingBooths(false);
    }
  };

  const closeLocationModal = () => {
    setShowLocationModal(false);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <Card.Content>
            <div className="animate-pulse space-y-4">
              <div className="h-6 bg-gray-200 rounded w-1/3"></div>
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
          </Card.Content>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {festivalMap ? (
        <>
          <Card>
            <Card.Header>
              <Card.Title>{festivalMap.mapName}</Card.Title>
              <Card.Description>Loại: {festivalMap.mapType === "layout" ? "Sơ đồ bố trí" : "Tổng quan"}</Card.Description>
            </Card.Header>
            <Card.Content>
              {festivalMap.mapUrl && (
                <img src={festivalMap.mapUrl} alt={festivalMap.mapName} className="w-full h-full object-cover rounded-lg" />
              )}
            </Card.Content>
          </Card>

          <Card>
            <Card.Header>
              <Card.Title>Vị trí trên bản đồ</Card.Title>
              <div className="relative">
                {hasRole([ROLE_NAME.STUDENT]) && festival?.status === FESTIVAL_STATUS.PUBLISHED && (
                  <Button icon={<Store size={16} />} onClick={handleRegisterBoothClick} className="absolute right-0 -top-8">
                    Đăng ký gian hàng
                  </Button>
                )}
              </div>
            </Card.Header>
            <Card.Content>
              {registrationMessage && (
                <div className="mb-4 p-3 bg-yellow-100 border border-yellow-300 rounded-lg text-yellow-800">
                  {registrationMessage}
                </div>
              )}
              {mapLocations.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {mapLocations.map((location) => (
                    <button
                      key={location.locationId || location.id}
                      onClick={() => openLocationModal(location)}
                      className="p-4 border border-gray-200 rounded-lg text-left hover:bg-gray-50 transition-colors"
                    >
                      <h4 className="font-medium text-gray-900">
                        {location.coordinates && `${location.coordinates} - `}
                        {location.locationName}
                      </h4>
                      <p className="text-sm text-gray-600">
                        Loại: {location.locationType === "booth" ? "Gian hàng" : "Khác"}
                      </p>
                      <span
                        className={`inline-block mt-2 px-2 py-1 rounded-full text-xs ${location.isOccupied ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"
                          }`}
                      >
                        {location.isOccupied ? "Đã có nhóm đăng ký" : "Còn trống"}
                      </span>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600">Chưa có vị trí nào được thiết lập.</p>
              )}
            </Card.Content>
          </Card>

          <Modal
            isOpen={showLocationModal}
            onClose={closeLocationModal}
            title={
              selectedLocation
                ? `Gian hàng tại vị trí: ${selectedLocation.coordinates ? `${selectedLocation.coordinates} - ` : ""}${selectedLocation.locationName}`
                : "Gian hàng"
            }
            size="xl"
          >
            {loadingBooths ? (
              <div className="flex flex-col md:flex-row md:flex-wrap gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className="w-full md:flex-[1_1_calc(50%-0.5rem)] p-4 border border-gray-200 rounded-lg bg-white"
                  >
                    <div className="h-5 bg-gray-100 rounded w-2/3 animate-pulse mb-2" />
                    <div className="h-4 bg-gray-100 rounded w-1/2 animate-pulse mb-3" />
                    <div className="h-28 bg-gray-100 rounded w-full animate-pulse" />
                  </div>
                ))}
              </div>
            ) : Array.isArray(locationBooths) && locationBooths.length > 0 ? (
              <div className="flex flex-col md:flex-row md:flex-wrap gap-4">
                {locationBooths.map((booth) => (
                  <div
                    key={booth.boothId}
                    className="w-full md:flex-[1_1_calc(50%-0.5rem)] p-4 border border-gray-200 rounded-lg bg-white shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-semibold text-gray-900">{booth.boothName}</h4>
                        <p className="text-sm text-gray-600">
                          Loại: {booth.boothType === "beverage" ? "Đồ uống" : booth.boothType === "food" ? "Đồ ăn" : booth.boothType}
                        </p>
                      </div>
                      {getStatusBadge(booth.status)}
                    </div>

                    {booth.description && (
                      <p className="text-sm text-gray-700 mt-2">{booth.description}</p>
                    )}

                    {Array.isArray(booth.boothMenuItems) && booth.boothMenuItems.length > 0 && (
                      <div className="mt-3">
                        <p className="text-sm font-medium text-gray-900 mb-2">Mặt hàng:</p>

                        {/* dùng flex + wrap cho số lượng không cố định */}
                        <div className="flex flex-wrap gap-3">
                          {booth.boothMenuItems.map((item) => {
                            const imgUrl = boothMenuItemImages[item.boothMenuItemId] || "";
                            const detail = menuItemDetails[item.menuItemId] || {};
                            const name =
                              detail.itemName || item.itemName || item.menuItemName || `#${item.menuItemId}`;
                            const desc = detail.description || item.description || "";

                            return (
                              <div
                                key={item.boothMenuItemId}
                                className="flex items-center gap-3 p-3 border rounded-lg bg-white shadow-sm
                               w-full sm:min-w-[260px] sm:max-w-[360px] sm:flex-[1_1_auto]"
                              >
                                <div className="w-14 h-14 rounded-md bg-gray-100 overflow-hidden flex items-center justify-center">
                                  {imgUrl ? (
                                    <img
                                      src={imgUrl}
                                      alt={name}
                                      className="w-full h-full object-cover"
                                      onError={(e) => {
                                        e.currentTarget.style.display = "none";
                                      }}
                                    />
                                  ) : (
                                    <span className="text-xs text-gray-400">No image</span>
                                  )}
                                </div>

                                <div className="min-w-0">
                                  <p className="text-sm font-medium text-gray-900 truncate" title={name}>
                                    {name}
                                  </p>
                                  {desc && (
                                    <p className="text-xs text-gray-600 line-clamp-2" title={desc}>
                                      {desc}
                                    </p>
                                  )}
                                  <p className="text-xs text-gray-600">
                                    Giá: {item.customPrice != null ? item.customPrice.toLocaleString("vi-VN") : "-"}
                                  </p>
                                  {item.quantityLimit != null && (
                                    <p className="text-xs text-gray-600">Giới hạn: {item.quantityLimit}</p>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600">Không có gian hàng nào tại vị trí này.</p>
            )}

          </Modal>
        </>
      ) : (
        <Card>
          <Card.Content>
            <div className="text-center py-8">
              <MapPin className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có bản đồ</h3>
              <p className="text-gray-600">Bản đồ lễ hội chưa được thiết lập.</p>
            </div>
          </Card.Content>
        </Card>
      )}

      <BoothRegistrationModal
        isOpen={showRegisterBoothModal}
        onClose={handleRegisterBoothModalClose}
        mapLocations={mapLocations}
        festivalId={festival?.festivalId || festival?.id}
        festivalInfo={festival}
        menuItems={menuItems}
      />
    </div>
  );
};

export default MapTab;
