import React, { useEffect, useMemo, useState } from "react";
import { Button, Input, Tabs, Table, Empty, Tag } from "antd";
import { Store, MapPin, Check, X } from "lucide-react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import { Breadcrumb } from "antd";

import { useAuth } from "../../contexts/AuthContext";
import {
  ROLE_NAME,
  BOOTH_STATUS,
  NOTIFICATION_EVENT,
} from "../../utils/constants";
import { convertToVietnamTimeWithFormat } from "../../utils/formatters";

import { boothServices } from "../../services/boothServices";
import { festivalServices } from "../../services/festivalServices";
import { mapLocationServices } from "../../services/mapLocationServices";
import { festivalMapServices } from "../../services/festivalMapServices";
import { imageServices } from "../../services/imageServices";

import useModal from "antd/es/modal/useModal";
import BoothMenu from "../../components/groupDetail/booth/BoothMenu";
import OrdersManagement from "../../components/groupDetail/OrdersManagement";
import { notificationServices } from "../../services/notificationServices";
import { groupMemberServices } from "../../services/groupMemberServices";

const { TextArea } = Input;

export default function BoothDetailPage() {
  const navigate = useNavigate();
  const locationPath = useLocation();
  const { hasRole } = useAuth();
  const { groupId, boothId } = useParams();

  const [booth, setBooth] = useState(null);
  const [festival, setFestival] = useState(null);
  const [location, setLocation] = useState(null);
  const [mapUrl, setMapUrl] = useState(null);
  const [festivalImages, setFestivalImages] = useState([]);

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [activeKey, setActiveKey] = useState("info");
  const [modal, contextHolder] = useModal();

  useEffect(() => {
    const isOrders = locationPath.pathname.endsWith("/orders");
    setActiveKey(isOrders ? "orders" : "info");
  }, [locationPath.pathname]);

  const handleTabChange = (key) => {
    setActiveKey(key);
    const base = `/app/groups/${groupId}/booth/${boothId}`;
    navigate(key === "orders" ? `${base}/orders` : base, { replace: true });
  };

  const breadcrumbItems = useMemo(
    () => [
      { title: <Link to="/app/groups">Danh sách nhóm </Link> },
      { title: <Link to={`/app/groups/${groupId}`}>Chi tiết nhóm</Link> },
      {
        title: (
          <Link to={`/app/groups/${groupId}/booth`}>Danh sách gian hàng</Link>
        ),
      },
      { title: `Gian hàng ${booth?.boothName}` },
    ],
    [groupId, booth]
  );

  const isHomeroomTeacher = () => hasRole([ROLE_NAME.TEACHER]);

  const getStatusBadge = (status) => {
    const map = {
      [BOOTH_STATUS.APPROVED]: { label: "Đã duyệt", color: "green" },
      [BOOTH_STATUS.PENDING]: { label: "Chờ duyệt", color: "gold" },
      [BOOTH_STATUS.REJECTED]: { label: "Từ chối", color: "red" },
      [BOOTH_STATUS.ACTIVE]: { label: "Hoạt động", color: "blue" },
    };
    const cfg = map[status] || map[BOOTH_STATUS.PENDING];
    return <Tag color={cfg.color}>{cfg.label}</Tag>;
  };

  const fetchBoothDetail = async () => {
    setLoading(true);
    try {
      let boothData = null;

      try {
        const respById = await boothServices.get({ boothId });
        boothData = respById?.data?.[0] || null;
      } catch {
        const respByGroup = await boothServices.get({ groupId });
        boothData =
          (respByGroup?.data || []).find(
            (b) => String(b.boothId) === String(boothId)
          ) || null;
      }

      if (!boothData) {
        setBooth(null);
        toast.error("Không tìm thấy gian hàng");
        return;
      }

      setBooth(boothData);

      const [festivalResp, locationResp] = await Promise.all([
        festivalServices.get({ festivalId: boothData.festivalId }),
        mapLocationServices.get({ locationId: boothData.locationId }),
      ]);

      const f = festivalResp?.data?.[0] || null;
      const loc = locationResp?.data?.[0] || null;
      setFestival(f);
      setLocation(loc);

      if (f) {
        const [imagesResp, mapResp] = await Promise.all([
          imageServices.get({ festivalId: boothData.festivalId }),
          festivalMapServices.get({ festivalId: boothData.festivalId }),
        ]);
        setFestivalImages(imagesResp?.data || []);
        setMapUrl(mapResp?.data?.[0]?.mapUrl || null);
      } else {
        setFestivalImages([]);
        setMapUrl(null);
      }
    } catch (e) {
      console.error("Error fetching booth detail:", e);
      toast.error("Không thể tải chi tiết gian hàng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (groupId && boothId) fetchBoothDetail();
  }, [groupId, boothId]);

  const handleStatusChange = (action, newStatus) => {
    if (!booth) return;
    if (action === "reject") {
      handleReject();
      return;
    }
    const actionText = { approve: "duyệt", activate: "kích hoạt" };
    modal.confirm({
      title: `Xác nhận ${actionText[action]} gian hàng`,
      content: `Bạn có chắc chắn muốn ${actionText[action]} gian hàng "${booth.boothName}" không?`,
      okText: "Xác nhận",
      cancelText: "Hủy",
      onOk: () => executeStatusChange(action, newStatus),
    });
  };

  const handleReject = () => {
    let rejectionReason = "";
    modal.confirm({
      title: "Từ chối gian hàng",
      content: (
        <div className="mt-4">
          <p className="mb-3">Vui lòng nhập lý do từ chối:</p>
          <TextArea
            rows={4}
            placeholder="Nhập lý do từ chối gian hàng..."
            onChange={(e) => (rejectionReason = e.target.value)}
          />
        </div>
      ),
      okText: "Từ chối",
      cancelText: "Hủy",
      okButtonProps: { danger: true },
      onOk: () => {
        if (!rejectionReason.trim()) {
          toast.error("Vui lòng nhập lý do từ chối");
          return false;
        }
        executeStatusChange(
          "reject",
          BOOTH_STATUS.REJECTED,
          rejectionReason.trim()
        );
      },
    });
  };

  const getRecipientAccountIds = async () => {
    try {
      const res = await groupMemberServices.get({ groupId });
      return Array.isArray(res?.data)
        ? res.data
            .filter((m) => String(m.role) !== "homeroom_teacher")
            .map((m) => m.accountId)
            .filter(Boolean)
        : [];
    } catch (e) {
      console.warn("Fetch recipients failed:", e?.message || e);
      return [];
    }
  };

  const sendBoothNotification = async (eventType, extraData = {}) => {
    try {
      const list_user_id = await getRecipientAccountIds();
      if (!list_user_id.length) return;

      await notificationServices.createByType(eventType, {
        data: {
          groupId,
          boothId,
          boothName: booth?.boothName,
          festivalName: festival?.festivalName,
          ...extraData,
        },
        list_user_id,
      });
    } catch (e) {
      console.warn("Send notification failed:", e?.message || e);
    }
  };

  const SUCCESS_TEXT = {
    approve: "Duyệt gian hàng thành công!",
    reject: "Từ chối gian hàng thành công!",
    activate: "Kích hoạt gian hàng thành công!",
  };

  const ERROR_VERB = {
    approve: "duyệt",
    reject: "từ chối",
    activate: "kích hoạt",
  };

  const executeStatusChange = async (
    action,
    newStatus,
    rejectionReason = null
  ) => {
    try {
      setActionLoading(true);

      switch (action) {
        case "approve": {
          await boothServices.updateApprove(
            { id: booth.boothId },
            { approvalDate: new Date().toISOString(), pointsBalance: 0 }
          );

          const afterApproveTasks = [];

          if (location?.locationId) {
            afterApproveTasks.push(
              mapLocationServices
                .update({ id: location.locationId, isOccupied: true })
                .catch((e) =>
                  console.warn("Update location failed:", e?.message || e)
                )
            );
          }

          if (booth?.festivalId && booth?.boothType && festival) {
            const isFood = String(booth.boothType).toLowerCase() === "food";
            const updateData = {
              id: booth.festivalId,
              ...(isFood
                ? {
                    registeredFoodBooths:
                      (festival?.registeredFoodBooths || 0) + 1,
                  }
                : {
                    registeredBeverageBooths:
                      (festival?.registeredBeverageBooths || 0) + 1,
                  }),
            };

            afterApproveTasks.push(
              festivalServices
                .update(updateData)
                .then(() => setFestival((prev) => ({ ...prev, ...updateData })))
                .catch((e) =>
                  console.warn("Update festival failed:", e?.message || e)
                )
            );
          }

          await Promise.allSettled(afterApproveTasks);

          try {
            await sendBoothNotification(NOTIFICATION_EVENT.BOOTH_APPROVAL);
          } catch (e) {
            console.warn("Send notification failed:", e?.message || e);
          }

          break;
        }

        case "reject": {
          await boothServices.updateReject({
            boothId: booth.boothId,
            rejectReason: rejectionReason,
          });

          await sendBoothNotification(NOTIFICATION_EVENT.BOOTH_REJECTED, {
            reason: rejectionReason,
          });
          break;
        }

        case "activate": {
          await boothServices.updateActivate({ boothId: booth.boothId });
          await sendBoothNotification(NOTIFICATION_EVENT.BOOTH_ACTIVATED);
          break;
        }

        default:
          console.warn("Unknown action:", action);
          break;
      }

      setBooth((prev) => ({
        ...prev,
        status: newStatus,
        ...(rejectionReason && { rejectionReason }),
      }));

      toast.success(SUCCESS_TEXT[action] || "Thành công!");
    } catch (e) {
      console.error(`Error ${action} booth:`, e);
      toast.error(`Không thể ${ERROR_VERB[action] || "thực hiện"} gian hàng`);
    } finally {
      setActionLoading(false);
    }
  };

  const renderActionButtons = () => {
    if (!booth) return null;

    if (booth.status === BOOTH_STATUS.PENDING && isHomeroomTeacher()) {
      return (
        <>
          <Button
            type="primary"
            icon={<Check size={16} />}
            loading={actionLoading}
            onClick={() => handleStatusChange("approve", BOOTH_STATUS.APPROVED)}
          >
            Duyệt
          </Button>
          <Button
            danger
            icon={<X size={16} />}
            loading={actionLoading}
            onClick={() => handleStatusChange("reject", BOOTH_STATUS.REJECTED)}
          >
            Từ chối
          </Button>
        </>
      );
    }

    if (
      booth.status === BOOTH_STATUS.APPROVED &&
      hasRole([ROLE_NAME.TEACHER, ROLE_NAME.STUDENT])
    ) {
      return (
        <Button
          type="primary"
          icon={<Check size={16} />}
          loading={actionLoading}
          onClick={() => handleStatusChange("activate", BOOTH_STATUS.ACTIVE)}
        >
          Kích hoạt
        </Button>
      );
    }

    return null;
  };

  const invoiceColumns = useMemo(
    () => [
      {
        title: "Mã hoá đơn",
        dataIndex: "id",
        key: "id",
        render: (v) => <span className="font-medium">{v}</span>,
      },
      {
        title: "Ngày tạo",
        dataIndex: "createdAt",
        key: "createdAt",
        render: (v) => convertToVietnamTimeWithFormat(v),
      },
      { title: "Khách hàng", dataIndex: "customer", key: "customer" },
      { title: "Số món", dataIndex: "items", key: "items", align: "right" },
      {
        title: "Tổng tiền",
        dataIndex: "amount",
        key: "amount",
        align: "right",
        render: (v) => (
          <span className="font-semibold">{(v || 0).toLocaleString()}đ</span>
        ),
      },
      {
        title: "Trạng thái",
        dataIndex: "status",
        key: "status",
        render: (s) => {
          const color =
            { paid: "green", pending: "gold", canceled: "red" }[s] || "default";
          const label =
            { paid: "Đã thanh toán", pending: "Chờ", canceled: "Huỷ" }[s] || s;
          return <Tag color={color}>{label}</Tag>;
        },
      },
      {
        title: "",
        key: "action",
        align: "right",
        render: (_, r) => (
          <Button
            size="small"
            onClick={() => toast.success(`Xem hoá đơn ${r.id}`)}
          >
            Xem
          </Button>
        ),
      },
    ],
    []
  );

  const infoTab = (
    <>
      <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-lg border border-gray-100 p-4">
            <p className="text-sm font-medium text-gray-500">Loại gian hàng</p>
            <p className="text-gray-900 mt-1">{booth?.boothType}</p>
          </div>
          <div className="rounded-lg border border-gray-100 p-4">
            <p className="text-sm font-medium text-gray-500">Ngày đăng ký</p>
            <p className="text-gray-900 mt-1">
              {convertToVietnamTimeWithFormat(booth?.registrationDate)}
            </p>
          </div>
          {booth?.approvalDate && (
            <div className="rounded-lg border border-gray-100 p-4">
              <p className="text-sm font-medium text-gray-500">Ngày duyệt</p>
              <p className="text-gray-900 mt-1">
                {convertToVietnamTimeWithFormat(booth?.approvalDate)}
              </p>
            </div>
          )}
        </div>

        {booth?.description && (
          <div className="mt-5">
            <p className="text-sm font-medium text-gray-500">Mô tả</p>
            <p className="text-gray-900 mt-1">{booth.description}</p>
          </div>
        )}
        {booth?.note && (
          <div className="mt-4">
            <p className="text-sm font-medium text-gray-500">Ghi chú</p>
            <p className="text-gray-900 mt-1">{booth.note}</p>
          </div>
        )}
        {booth?.rejectionReason && booth?.status === BOOTH_STATUS.REJECTED && (
          <div className="mt-5 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm font-medium text-red-700">Lý do từ chối</p>
            <p className="text-red-800 mt-1">{booth.rejectionReason}</p>
          </div>
        )}
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
        <h5 className="text-lg font-semibold text-gray-900 mb-4">
          Menu gian hàng
        </h5>
        <BoothMenu boothId={boothId} />
      </div>

      {location && (
        <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-xl p-6 mb-6">
          <h5 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <MapPin size={20} className="mr-2 text-green-600" />
            Vị trí gian hàng
          </h5>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Vị trí</p>
              <p className="text-gray-900 mt-1">
                {location.locationName}-{location.coordinates}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Loại vị trí</p>
              <p className="text-gray-900 mt-1">{location.locationType}</p>
            </div>
          </div>
          {mapUrl && (
            <div className="mt-4">
              <p className="text-sm font-medium text-gray-500 mb-3">
                Bản đồ lễ hội
              </p>
              <img
                src={mapUrl}
                alt="Festival Map"
                className="w-full max-w-lg h-full object-cover rounded-lg border mx-auto"
              />
            </div>
          )}
        </div>
      )}

      {festival && (
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-6">
          <h5 className="text-lg font-semibold text-gray-900 mb-4">
            Thông tin lễ hội
          </h5>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Tên lễ hội</p>
              <p className="text-gray-900 mt-1">{festival.festivalName}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Chủ đề</p>
              <p className="text-gray-900 mt-1">{festival.theme}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Địa điểm</p>
              <p className="text-gray-900 mt-1">{festival.location}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Thời gian</p>
              <p className="text-gray-900 mt-1">
                {convertToVietnamTimeWithFormat(festival.startDate)} -{" "}
                {convertToVietnamTimeWithFormat(festival.endDate)}
              </p>
            </div>
          </div>

          {festivalImages.length > 0 && (
            <div className="mt-4">
              <p className="text-sm font-medium text-gray-500 mb-3">
                Hình ảnh lễ hội
              </p>
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

          <div className="mt-6 flex justify-end">
            <Button
              type="primary"
              onClick={() => navigate(`/app/festivals/${festival.festivalId}`)}
            >
              Xem thông tin chi tiết
            </Button>
          </div>
        </div>
      )}
    </>
  );

  const tabItems = useMemo(() => {
    const items = [
      { key: "info", label: "Thông tin gian hàng", children: infoTab },
    ];
    if (booth?.status === BOOTH_STATUS.ACTIVE) {
      items.push({
        key: "orders",
        label: "Hoá đơn",
        children: <OrdersManagement boothId={booth?.boothId} />,
      });
    }
    return items;
  }, [booth?.status, booth?.boothId, infoTab]);

  useEffect(() => {
    if (
      activeKey === "orders" &&
      booth &&
      booth.status !== BOOTH_STATUS.ACTIVE
    ) {
      setActiveKey("info");
      const base = `/app/groups/${groupId}/booth/${boothId}`;
      navigate(base, { replace: true });
    }
  }, [activeKey, booth?.status, groupId, boothId, navigate]);

  if (loading) {
    return (
      <div className="text-center py-10">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
        <p className="text-gray-600 mt-2">Đang tải chi tiết gian hàng...</p>
      </div>
    );
  }

  if (!booth) {
    return (
      <div className="text-center py-12">
        <Store className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Không tìm thấy gian hàng
        </h3>
        <Button onClick={() => navigate(-1)}>← Quay lại</Button>
      </div>
    );
  }

  return (
    <>
      {contextHolder}

      <Breadcrumb items={breadcrumbItems} className="mb-2 text-sm" />
      <div className="bg-white border border-gray-200 rounded-xl p-5 mb-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-lg">
              {booth.boothName?.[0]?.toUpperCase() || "B"}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-semibold text-gray-900 truncate">
                  {booth.boothName}
                </h2>
                {getStatusBadge(booth.status)}
              </div>
              <p className="text-xs text-gray-500 truncate">
                Thuộc lễ hội:{" "}
                <span className="font-medium text-gray-700">
                  {festival?.festivalName || "—"}
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">{renderActionButtons()}</div>
        </div>
      </div>

      <Tabs
        activeKey={activeKey}
        onChange={handleTabChange}
        items={tabItems}
        destroyInactiveTabPane
      />
    </>
  );
}
