import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle, XCircle } from "lucide-react";
import { toast } from "react-hot-toast";

import { accountServices } from "../../services/accountServices";
import Card from "../../components/common/Card";

const VerifyPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [loading, setLoading] = useState(true);
  const [uiState, setUiState] = useState({
    type: "info",
    text: "Đang xác thực tài khoản...",
  });

  useEffect(() => {
    (async () => {
      const idParam = searchParams.get("id");
      const statusParam = (searchParams.get("status") || "").toLowerCase();

      const id = Number(idParam);
      console.log("id: ", id);
      if (!id || Number.isNaN(id)) {
        setUiState({
          type: "error",
          text: "Đã có lỗi xảy ra khi xác thực, vui lòng thử lại sau!",
        });
        toast.error("Đã có lỗi xảy ra khi xác thực, vui lòng thử lại sau!");
        return;
      }

      try {
        setLoading(true);
        setUiState({ type: "info", text: "Đang kiểm tra tài khoản..." });

        const res = await accountServices.get({ id });
        const account = Array.isArray(res?.data) ? res.data[0] : null;

        if (!account) {
          setUiState({ type: "error", text: "Không tìm thấy tài khoản." });
          toast.error("Không tìm thấy tài khoản.");
          return;
        }

        if (statusParam === "true") {
          setUiState({
            type: "info",
            text: "Đang cập nhật trạng thái tài khoản...",
          });
          await accountServices.update({ id }, { status: true });
        }

        setUiState({
          type: "success",
          text: "Xác thực tài khoản thành công, vui lòng đăng nhập lại.",
        });
        toast.success("Xác thực tài khoản thành công, vui lòng đăng nhập lại.");
        navigate("/auth/login", { replace: true });
      } catch (err) {
        console.error("Verify error:", err);
        setUiState({
          type: "error",
          text: "Có lỗi xảy ra khi xác thực tài khoản.",
        });
        toast.error("Có lỗi xảy ra khi xác thực tài khoản.");
      } finally {
        setLoading(false);
      }
    })();
  }, [searchParams, navigate]);

  const Icon =
    uiState.type === "success"
      ? CheckCircle
      : uiState.type === "error"
      ? XCircle
      : null;

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <Card className="max-w-md w-full">
        <Card.Content>
          <div className="flex flex-col items-center text-center space-y-3 py-6">
            {uiState.type === "info" && (
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
            )}
            {Icon ? <Icon className="w-10 h-10 text-green-600" /> : null}

            <h2 className="text-xl font-semibold">
              {uiState.type === "info" ? "Đang xử lý..." : "Xác thực tài khoản"}
            </h2>
            <p className="text-gray-600">{uiState.text}</p>

            {!loading && (
              <p className="text-xs text-gray-400">
                Bạn sẽ được chuyển về trang đăng nhập ngay.
              </p>
            )}
          </div>
        </Card.Content>
      </Card>
    </div>
  );
};

export default VerifyPage;
