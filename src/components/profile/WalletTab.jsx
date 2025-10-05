import React, { useState, useEffect, useMemo } from "react";
import { Modal, Radio, Input, Spin } from "antd";
import { Wallet, DollarSign } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import Button from "../../components/common/Button";
import { walletServices } from "../../services/walletServices";
import { accountWalletHistoriesServices } from "../../services/accountWalletHistoryServices";
import { paymentServices } from "../../services/paymentServices";
import { requestServices } from "../../services/requestServices";
import { accountServices } from "../../services/accountServices";
import TransactionList from "./TransactionList";
import TopupModal from "./wallet/TopupModal";
import toast from "react-hot-toast";
import {
  HISTORY_TYPE,
  REQUEST_TYPE,
  REQUEST_STATUS,
} from "../../utils/constants";
import { vietqrServices } from "../../services/atmServices";

const MIN_WITHDRAW_BALANCE = 5000;

const WalletTab = ({ user }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const [walletData, setWalletData] = useState({ balance: 0, walletId: null });
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTopupModal, setShowTopupModal] = useState(false);
  const [selectedAmount, setSelectedAmount] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [handledReturn, setHandledReturn] = useState(false);

  const [withdrawVisible, setWithdrawVisible] = useState(false);
  const [isRequestingWithdraw, setIsRequestingWithdraw] = useState(false);

  const [bankModalVisible, setBankModalVisible] = useState(false);
  const [checkingAccount, setCheckingAccount] = useState(false);
  const [accountInfo, setAccountInfo] = useState(null);
  const [useExisting, setUseExisting] = useState("existing");
  const [banksLoading, setBanksLoading] = useState(false);
  const [banks, setBanks] = useState([]);
  const [selectedBank, setSelectedBank] = useState(null);
  const [bankNumber, setBankNumber] = useState("");
  const [updatingBank, setUpdatingBank] = useState(false);

  const [bankQuery, setBankQuery] = useState("");

  useEffect(() => {
    fetchWalletData();
  }, [user?.id]);

  useEffect(() => {
    const handleReturnParams = async () => {
      if (!user?.id || handledReturn) return;

      const urlParams = new URLSearchParams(location.search);
      const cancel = urlParams.get("cancel");
      const status = urlParams.get("status");
      const orderCode = urlParams.get("orderCode");

      if (cancel === "false" && status === "PAID" && orderCode) {
        try {
          const amountPaidStr = sessionStorage.getItem("topup_amount");
          const walletIdFromSession = sessionStorage.getItem("topup_walletId");
          const amountPaid = amountPaidStr ? Number(amountPaidStr) : 0;

          if (!amountPaid || amountPaid <= 0) {
            throw new Error("Invalid or missing amountPaid in session.");
          }

          const description = `Bạn đã nạp ${amountPaid.toLocaleString(
            "vi-VN"
          )} VNĐ vào ví cá nhân`;

          const createRes = await accountWalletHistoriesServices.create({
            accountId: user.id,
            description,
            type: HISTORY_TYPE.TOPUP,
            amount: amountPaid,
          });

          const createdHistory = Array.isArray(createRes?.data)
            ? createRes.data[0]
            : createRes?.data || {
                accountWalletHistoryId: Date.now(),
                accountId: user.id,
                description,
                type: HISTORY_TYPE.TOPUP,
                amount: amountPaid,
                createdAt: new Date().toISOString(),
              };

          setTransactions((prev) => [createdHistory, ...prev]);

          const latestWalletRes = await walletServices.get({ userId: user.id });
          const latest =
            Array.isArray(latestWalletRes?.data) && latestWalletRes.data[0]
              ? latestWalletRes.data[0]
              : {
                  walletId: walletIdFromSession || walletData.walletId,
                  balance: walletData.balance || 0,
                };

          const targetWalletId = latest.walletId || walletIdFromSession;
          const newBalance = (latest.balance || 0) + amountPaid;

          if (!targetWalletId) throw new Error("Missing walletId to update.");

          await walletServices.update({
            walletId: targetWalletId,
            balance: newBalance,
          });

          setWalletData({
            balance: newBalance,
            walletId: targetWalletId,
          });

          toast.success("Nạp tiền thành công!");
        } catch (err) {
          console.error("Handle return params error:", err);
        } finally {
          sessionStorage.removeItem("topup_amount");
          sessionStorage.removeItem("topup_walletId");
          sessionStorage.removeItem("topup_started_at");

          setHandledReturn(true);
          navigate({ pathname: location.pathname }, { replace: true });
        }
      }
    };

    handleReturnParams();
  }, [user?.id, location.search, handledReturn, navigate, location.pathname]);

  const filteredBanks = useMemo(() => {
    const q = bankQuery.trim().toLowerCase();
    if (!q) return banks;
    return banks.filter((b) =>
      String(b.shortName || "")
        .toLowerCase()
        .includes(q)
    );
  }, [banks, bankQuery]);

  const fetchWalletData = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);

      let walletResponse = await walletServices.get({ userId: user.id });
      if (
        !Array.isArray(walletResponse?.data) ||
        walletResponse.data.length === 0
      ) {
        const createResponse = await walletServices.create({
          accountId: user.id,
          balance: 0,
        });
        setWalletData({
          balance: 0,
          walletId: createResponse?.data?.walletId || null,
        });
      } else {
        setWalletData({
          balance: walletResponse.data[0].balance,
          walletId: walletResponse.data[0].walletId,
        });
      }

      const historyResponse = await accountWalletHistoriesServices.get({
        accountId: user.id,
      });

      setTransactions(historyResponse?.data || []);
    } catch (error) {
      console.error("Error fetching wallet data:", error);
      toast.error("Không thể tải dữ liệu ví.");
    } finally {
      setLoading(false);
    }
  };

  const openWithdrawConfirm = () => {
    if (!walletData?.balance || walletData.balance <= MIN_WITHDRAW_BALANCE) {
      toast.error("Số dư tài khoản phải trên 5.000 VNĐ thì mới được rút");
      return;
    }
    setWithdrawVisible(true);
  };

  const handleOpenBankModal = async () => {
    setWithdrawVisible(false);
    setCheckingAccount(true);
    try {
      const res = await accountServices.get({ id: user.id });
      setAccountInfo(res?.data[0] || null);
      const hasExisting = !!(
        res?.data?.atmName && res?.data?.accountBankNumber
      );
      setUseExisting(hasExisting ? "existing" : "new");
      if (!hasExisting) {
        setBanksLoading(true);
        const list = await vietqrServices.getBanks();
        setBanks(list);
      }
      setBankModalVisible(true);
    } catch (e) {
      toast.error("Không thể tải thông tin tài khoản.");
    } finally {
      setCheckingAccount(false);
      setBanksLoading(false);
    }
  };

  const onChooseNewInfo = async () => {
    if (banks.length === 0) {
      try {
        setBanksLoading(true);
        const list = await vietqrServices.getBanks();
        setBanks(list);
      } catch {
        toast.error("Không thể tải danh sách ngân hàng.");
      } finally {
        setBanksLoading(false);
      }
    }
    setUseExisting("new");
  };

  const createWithdrawRequest = async () => {
    setIsRequestingWithdraw(true);
    try {
      await requestServices.create({
        accountId: user.id,
        type: REQUEST_TYPE.REFUND,
        status: REQUEST_STATUS.PENDING,
        message: "Yêu cầu rút tiền từ ví cá nhân",
        data: JSON.stringify({
          walletId: walletData.walletId,
          balance: walletData.balance,
        }),
      });
      toast.success("Đã tạo yêu cầu rút tiền");
      setBankModalVisible(false);
    } catch (e) {
      toast.error(
        e?.response?.data?.detail ||
          e?.response?.data?.message ||
          "Tạo yêu cầu rút tiền thất bại"
      );
    } finally {
      setIsRequestingWithdraw(false);
    }
  };

  const handleConfirmBankFlow = async () => {
    if (useExisting === "existing") {
      await createWithdrawRequest();
      return;
    }
    if (!selectedBank || !selectedBank.shortName) {
      toast.error("Vui lòng chọn ngân hàng.");
      return;
    }
    if (!bankNumber || String(bankNumber).trim().length === 0) {
      toast.error("Vui lòng nhập số tài khoản.");
      return;
    }
    try {
      setUpdatingBank(true);
      await accountServices.update(
        { id: user?.id },
        { atmName: selectedBank.shortName, accountBankNumber: bankNumber }
      );
      await createWithdrawRequest();
    } catch (e) {
      toast.error(
        e?.response?.data?.detail ||
          e?.response?.data?.message ||
          "Cập nhật thông tin chuyển khoản thất bại"
      );
    } finally {
      setUpdatingBank(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="text-lg">Đang tải...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          Quản lý ví cá nhân
        </h3>
        <div className="flex space-x-2">
          <Button
            onClick={() => setShowTopupModal(true)}
            className="flex items-center space-x-2"
          >
            <DollarSign size={16} />
            <span>Nạp tiền</span>
          </Button>
          <Button
            variant="outline"
            onClick={openWithdrawConfirm}
            className="flex items-center space-x-2"
          >
            <Wallet size={16} />
            <span>Yêu cầu rút tiền</span>
          </Button>
        </div>
      </div>

      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-blue-100 text-sm">Ví chính - Số dư hiện tại</p>
            <p className="text-3xl font-bold">
              {walletData.balance.toLocaleString("vi-VN")} VND
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Wallet className="w-12 h-12 text-blue-200" />
          </div>
        </div>
      </div>

      <TransactionList transactions={transactions} />

      <TopupModal
        show={showTopupModal}
        onClose={() => {
          setShowTopupModal(false);
          setSelectedAmount(null);
        }}
        user={user}
        walletData={walletData}
        selectedAmount={selectedAmount}
        setSelectedAmount={setSelectedAmount}
        isProcessing={isProcessing}
        setIsProcessing={setIsProcessing}
      />

      <Modal
        open={withdrawVisible}
        title="Xác nhận yêu cầu rút tiền"
        onCancel={() => setWithdrawVisible(false)}
        footer={[
          <Button
            key="cancel"
            variant="outline"
            onClick={() => setWithdrawVisible(false)}
          >
            Hủy
          </Button>,
          <Button
            key="ok"
            className="ml-3"
            onClick={handleOpenBankModal}
            disabled={checkingAccount}
          >
            {checkingAccount ? "Đang kiểm tra..." : "Xác nhận tạo yêu cầu"}
          </Button>,
        ]}
      >
        Bạn có chắc muốn tạo yêu cầu rút tiền?
      </Modal>

      <Modal
        open={bankModalVisible}
        title="Vui lòng chọn phương thức để nhập thông tin chuyển khoản"
        onCancel={() => setBankModalVisible(false)}
        footer={[
          <Button
            key="cancel"
            variant="outline"
            onClick={() => setBankModalVisible(false)}
          >
            Hủy
          </Button>,
          <Button
            key="ok"
            className="ml-3"
            onClick={handleConfirmBankFlow}
            disabled={isRequestingWithdraw || updatingBank}
          >
            {isRequestingWithdraw || updatingBank
              ? "Đang xử lý..."
              : "Tiếp tục"}
          </Button>,
        ]}
      >
        {checkingAccount ? (
          <div className="flex items-center justify-center py-6">
            <Spin />
          </div>
        ) : (
          <div className="space-y-4">
            {accountInfo?.atmName && accountInfo?.accountBankNumber ? (
              <div className="space-y-3">
                <Radio.Group
                  value={useExisting}
                  onChange={(e) => setUseExisting(e.target.value)}
                >
                  <div className="flex flex-col gap-2">
                    <Radio value="existing">
                      Dùng thông tin đã lưu: {accountInfo.atmName} ·{" "}
                      {accountInfo.accountBankNumber}
                    </Radio>
                    <Radio value="new" onClick={onChooseNewInfo}>
                      Chọn thông tin mới
                    </Radio>
                  </div>
                </Radio.Group>
              </div>
            ) : (
              <div className="text-sm text-gray-600">
                Chưa có thông tin chuyển khoản. Vui lòng nhập mới.
              </div>
            )}

            {(useExisting === "new" ||
              !(accountInfo?.atmName && accountInfo?.accountBankNumber)) && (
              <div className="space-y-3">
                {banksLoading ? (
                  <div className="flex items-center justify-center py-4">
                    <Spin />
                  </div>
                ) : (
                  <>
                    <div>
                      <div className="mb-1 text-sm text-gray-700">
                        Tìm ngân hàng
                      </div>
                      <Input
                        allowClear
                        placeholder="VD: VCB, TCB, ACB..."
                        value={bankQuery}
                        onChange={(e) => setBankQuery(e.target.value)}
                      />
                    </div>

                    <div className="max-h-64 overflow-auto border rounded-md p-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {filteredBanks.length === 0 ? (
                        <div className="col-span-2 text-center text-sm text-gray-500 py-3">
                          Không tìm thấy ngân hàng phù hợp
                        </div>
                      ) : (
                        filteredBanks.map((b) => (
                          <div
                            key={b.bin}
                            onClick={() => setSelectedBank(b)}
                            className={`flex items-center gap-3 p-2 rounded-md cursor-pointer border ${
                              selectedBank?.bin === b.bin
                                ? "border-blue-500 ring-2 ring-blue-200"
                                : "border-gray-200"
                            }`}
                          >
                            <img
                              src={b.logo}
                              alt={b.shortName}
                              className="w-8 h-8 object-contain"
                            />
                            <div className="text-sm font-medium">
                              {b.shortName}
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    <div>
                      <div className="mb-1 text-sm text-gray-700">
                        Số tài khoản
                      </div>
                      <Input
                        placeholder="Nhập số tài khoản"
                        value={bankNumber}
                        onChange={(e) => setBankNumber(e.target.value)}
                        inputMode="numeric"
                      />
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default WalletTab;
