import React, { useState, useEffect } from "react";
import { Table, Button as AntButton, Card, Modal } from "antd";
import { Plus, DollarSign } from "lucide-react";
import { toast } from "react-hot-toast";
import { ordersServices } from "../../services/orderServices";
import { accountServices } from "../../services/accountServices";
import { boothMenuItemServices } from "../../services/boothMenuItemServices";
import { boothWalletServices } from "../../services/boothWalletServices";
import { boothServices } from "../../services/boothServices";
import { festivalServices } from "../../services/festivalServices";
import { paymentServices } from "../../services/paymentServices";
import { studentGroupServices } from "../../services/studentGroupServices";
import {
  ORDER_STATUS_LABELS,
  ROLE_NAME,
  FESTIVAL_STATUS,
  ORDER_STATUS,
  PAYMENT_STATUS,
  BOOTH_STATUS,
  IS_WITHDRAW_STATUS,

  HISTORY_TYPE,
} from "../../utils/constants";
import { useAuth } from "../../contexts/AuthContext";
import CreatePaymentModal from "./order/CreatePaymentModal";
import OrdersTable from "./order/OrdersTable";
import { accountWalletHistoriesServices } from "../../services/accountWalletHistoryServices";

const OrdersManagement = ({ boothId }) => {
  const { user, hasRole } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [menuItems, setMenuItems] = useState([]);
  const [boothBalance, setBoothBalance] = useState(0);
  const [festivalId, setFestivalId] = useState(null);
  const [festival, setFestival] = useState(null);
  const [groupInfo, setGroupInfo] = useState(null);
  const [boothInfo, setBoothInfo] = useState(null);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const handleUrlParams = async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const cancel = urlParams.get("cancel");
    const status = urlParams.get("status");
    const orderCode = urlParams.get("orderCode");
    if (cancel === "true" && status === "CANCELLED" && orderCode) {
      try {
        const orderResponse = await ordersServices.get({ orderId: orderCode });
        const found =
          Array.isArray(orderResponse?.data) && orderResponse.data.length > 0
            ? orderResponse.data[0]
            : orderResponse?.data;
        if (found?.status === ORDER_STATUS.PENDING) {
          await Promise.all([
            ordersServices.update({
              orderId: orderCode,
              status: ORDER_STATUS.CANCELLED,
            }),
            paymentServices.update({
              orderId: orderCode,
              status: PAYMENT_STATUS.FAILED,
            }),
          ]);
        }
        window.history.replaceState(
          {},
          document.title,
          window.location.pathname
        );
      } catch (error) {}
      return;
    }
    if (cancel === "false" && status === "PAID" && orderCode) {
      try {
        const updateResp = await ordersServices.update({
          orderId: orderCode,
          status: ORDER_STATUS.COMPLETED,
        });
        let updatedOrder =
          updateResp?.data && typeof updateResp.data === "object"
            ? updateResp.data
            : updateResp;
        let totalAmount = updatedOrder?.totalAmount;
        if (typeof totalAmount !== "number") {
          const getResp = await ordersServices.get({ orderId: orderCode });
          const got =
            Array.isArray(getResp?.data) && getResp.data.length > 0
              ? getResp.data[0]
              : getResp?.data;
          totalAmount = got?.totalAmount ?? 0;
        }
        if (typeof totalAmount === "number" && totalAmount > 0) {
          const path = window.location.pathname;
          const match = path.match(/\/booth\/(\d+)/);
          const boothIdFromPath = match ? parseInt(match[1], 10) : null;
          if (boothIdFromPath) {
            await boothWalletServices.updateBalance({
              boothId: boothIdFromPath,
              balance: totalAmount,
            });
          }
        }
        await paymentServices.update({
          orderId: orderCode,
          status: PAYMENT_STATUS.COMPLETED,
        });
        window.history.replaceState(
          {},
          document.title,
          window.location.pathname
        );
      } catch (error) {}
    }
  };

  const fetchOrders = async (page = 1, pageSize = 10) => {
    setLoading(true);
    try {
      const ordersResponse = await ordersServices.get({
        boothId,
        page,
        pageSize,
      });
      const ordersData = ordersResponse.data || [];
      const totalCount = ordersResponse.totalCount || 0;
      const ordersWithCustomers = await Promise.all(
        ordersData.map(async (order) => {
          try {
            const customerResponse = await accountServices.get({
              id: order.accountId,
            });
            const customerData = customerResponse.data?.[0] || {};
            return { ...order, customer: customerData };
          } catch {
            return { ...order, customer: { fullName: "N/A", email: "N/A" } };
          }
        })
      );
      const sortedOrders = ordersWithCustomers.sort(
        (a, b) => new Date(b.orderDate) - new Date(a.orderDate)
      );
      setOrders(sortedOrders);
      setPagination({ current: page, pageSize, total: totalCount });
    } catch {
      toast.error("Không thể tải danh sách hóa đơn");
    } finally {
      setLoading(false);
    }
  };

  const fetchBoothWallet = async () => {
    try {
      const walletResponse = await boothWalletServices.get({ boothId });
      const walletData = walletResponse.data?.[0];
      setBoothBalance(walletData?.totalBalance || 0);
    } catch {}
  };

  const fetchBoothAndGroup = async () => {
    try {
      const path = window.location.pathname;
      const match = path.match(/\/groups\/(\d+)/);
      const groupIdFromPath = match ? parseInt(match[1], 10) : null;
      if (!groupIdFromPath) return;
      const groupRes = await studentGroupServices.get({
        groupId: groupIdFromPath,
      });
      const groupData =
        Array.isArray(groupRes?.data) && groupRes.data.length > 0
          ? groupRes.data[0]
          : groupRes?.data;
      setGroupInfo(groupData);
      const boothRes = await boothServices.get({ boothId });
      const boothData =
        Array.isArray(boothRes?.data) && boothRes.data.length > 0
          ? boothRes.data[0]
          : boothRes?.data;
      setBoothInfo(boothData);
    } catch {}
  };

  const confirmWithdraw = async () => {
    try {
      const res = await boothServices.canWithdrawRevenue({
        boothId: boothId,
        accountId: user?.id,
      });
      console.log("asd: ", res);
    } catch (err) {
      console.log("err: ", err);
      toast.error(err?.response?.data?.detail || err?.response?.data?.message);
      return;
    }
    setConfirmVisible(true);
  };

  const doWithdraw = async () => {
    if (!groupInfo?.accountId || !boothId) return;
    setIsWithdrawing(true);

    try {
      await boothServices.withdraw({ boothId, accountId: groupInfo.accountId });
      setBoothInfo((prev) => ({
        ...(prev || {}),
        isWithdraw: IS_WITHDRAW_STATUS.TRUE,
      }));

      await accountWalletHistoriesServices.create({
        accountId: user.id,
        description: `Doanh thu của gian hàng ${boothInfo?.boothName} đã về ví cá nhân của bạn`,
        amount: boothBalance,
        type: HISTORY_TYPE.RETURN_TRANSFER,
      });

      setBoothBalance(0);

      toast.success("Đã chuyển doanh thu về ví cá nhân");
      setConfirmVisible(false);
    } catch (e) {
      toast.error(
        e?.response?.data?.detail ||
          e?.response?.data?.message ||
          "Rút tiền thất bại"
      );
    } finally {
      setIsWithdrawing(false);
    }
  };

  const fetchMenuItems = async () => {
    try {
      const menuResponse = await boothMenuItemServices.get({ boothId });
      setMenuItems(menuResponse.data || []);
    } catch {}
  };

  const fetchBoothInfo = async () => {
    try {
      const boothResponse = await boothServices.get({ boothId });
      const boothData = boothResponse.data?.[0];
      if (boothData?.festivalId) {
        setFestivalId(boothData.festivalId);
        await fetchFestivalInfo(boothData.festivalId);
      }
    } catch {}
  };

  const fetchFestivalInfo = async (festivalId) => {
    try {
      const festivalResponse = await festivalServices.get({ festivalId });
      const festivalData = festivalResponse.data?.[0];
      setFestival(festivalData);
    } catch {}
  };

  const handleCreatePaymentSuccess = () => {
    fetchOrders(pagination.current, pagination.pageSize);
    fetchBoothWallet();
    setCreateModalVisible(false);
  };

  const handleTableChange = (paginationInfo) => {
    fetchOrders(paginationInfo.current, paginationInfo.pageSize);
  };

  const canCreatePayment = () => {
    return (
      hasRole([ROLE_NAME.STUDENT]) &&
      festival?.status === FESTIVAL_STATUS.ONGOING
    );
  };

  useEffect(() => {
    const init = async () => {
      await handleUrlParams();
      if (boothId) {
        fetchOrders();
        fetchMenuItems();
        fetchBoothWallet();
        fetchBoothInfo();
        fetchBoothAndGroup();
      }
    };
    init();
  }, [boothId]);

  const isLeader = groupInfo?.accountId === user?.id;
  const isClosed = boothInfo?.status === BOOTH_STATUS.CLOSED;
  const withdrawState = boothInfo?.isWithdraw || IS_WITHDRAW_STATUS.FALSE;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex flex-col">
          <h4 className="text-lg font-semibold text-gray-900">
            Quản lý hóa đơn
          </h4>
          <div className="flex flex-row items-center gap-4">
            <Card size="small" className="bg-green-50 border-green-200">
              <div className="flex items-center space-x-2">
                <DollarSign size={16} className="text-green-600" />
                <span className="text-sm text-gray-600">
                  Doanh thu gian hàng:
                </span>
                <span className="font-medium text-lg text-green-600">
                  {boothBalance.toLocaleString()}đ
                </span>
              </div>
            </Card>
            {
              isClosed &&
              groupInfo && (
                <>
                  {isLeader ? (
                    withdrawState === IS_WITHDRAW_STATUS.TRUE ? (
                      <AntButton disabled>Đã chuyển về ví của bạn</AntButton>
                    ) : withdrawState === IS_WITHDRAW_STATUS.PENDING ? (
                      <AntButton disabled>Đang được yêu cầu rút tiền</AntButton>
                    ) : (
                      <AntButton
                        type="primary"
                        loading={isWithdrawing}
                        onClick={confirmWithdraw}
                      >
                        Rút tiền về tài khoản cá nhân
                      </AntButton>
                    )
                  ) : withdrawState === IS_WITHDRAW_STATUS.TRUE ? (
                    <AntButton disabled>
                      Tiền đã được chuyển về ví của nhóm trưởng
                    </AntButton>
                  ) : withdrawState === IS_WITHDRAW_STATUS.PENDING ? (
                    <AntButton disabled>
                      Đang đợi nhóm trưởng rút tiền
                    </AntButton>
                  ) : (
                    <AntButton disabled>
                      Nhóm trưởng đã rút tiền về ví cá nhân
                    </AntButton>
                  )}
                </>
              )
            }
          </div>
        </div>
        {canCreatePayment() && (
          <AntButton
            type="primary"
            icon={<Plus size={16} />}
            onClick={() => setCreateModalVisible(true)}
          >
            Tạo thanh toán
          </AntButton>
        )}
      </div>
      <OrdersTable
        orders={orders}
        loading={loading}
        pagination={pagination}
        onTableChange={handleTableChange}
      />
      {createModalVisible && (
        <CreatePaymentModal
          visible={createModalVisible}
          onCancel={() => setCreateModalVisible(false)}
          onSuccess={handleCreatePaymentSuccess}
          boothId={boothId}
          menuItems={menuItems}
          festivalId={festivalId}
        />
      )}

      <Modal
        open={confirmVisible}
        title="Xác nhận rút tiền"
        onCancel={() => setConfirmVisible(false)}
        footer={[
          <AntButton key="cancel" onClick={() => setConfirmVisible(false)}>
            Hủy
          </AntButton>,
          <AntButton
            key="ok"
            type="primary"
            loading={isWithdrawing}
            onClick={doWithdraw}
          >
            Xác nhận
          </AntButton>,
        ]}
      >
        Bạn có chắc muốn rút doanh thu của gian hàng {boothInfo?.boothName} về
        ví cá nhân hay không?
      </Modal>
    </div>
  );
};

export default OrdersManagement;
