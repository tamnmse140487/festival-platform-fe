import React, { useEffect, useState } from "react";
import {
  CheckCircle,
  XCircle,
  Clock,
  Calendar,
  User,
  AlertTriangle,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { festivalSchoolServices } from "../../../services/festivalSchoolServices";
import { convertToVietnamTimeWithFormat } from "../../../utils/formatters";
import { getStatusBadge } from "../../../utils/helpers";
import { notificationServices } from "../../../services/notificationServices";
import { NOTIFICATION_EVENT } from "../../../utils/constants";
import { schoolServices } from "../../../services/schoolServices";

const AdminApprovalTab = ({ festival, festivalSchool, onStatusUpdate }) => {
  const [loading, setLoading] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  const handleApprove = async () => {
    if (!festivalSchool) {
      toast.error("Không tìm thấy thông tin đăng ký lễ hội");
      return;
    }

    try {
      setLoading(true);
      await festivalSchoolServices.updateApproveStatus({
        id: festivalSchool.festivalSchoolId,
      });

      onStatusUpdate("approved", new Date().toISOString(), null);

      try {
        const accountId = await schoolServices.getAccountIdBySchoolId(
          festival.schoolId
        );

        await notificationServices.createByType(
          NOTIFICATION_EVENT.FESTIVAL_APPROVAL,
          {
            data: {
              festivalId: festival.festivalId,
              festivalName: festival.festivalName,
              schoolId: festival.schoolId,
            },
            list_user_id: [accountId],
          }
        );
      } catch (e) {
        console.warn("Send notification failed:", e?.message || e);
      }

      toast.success("Đã duyệt lễ hội thành công");
    } catch (error) {
      console.error("Error approving festival:", error);
      toast.error("Có lỗi xảy ra khi duyệt lễ hội");
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!festivalSchool) {
      toast.error("Không tìm thấy thông tin đăng ký lễ hội");
      return;
    }

    if (!rejectReason.trim()) {
      toast.error("Vui lòng nhập lý do từ chối");
      return;
    }

    try {
      setLoading(true);
      await festivalSchoolServices.updateRejectStatus({
        id: festivalSchool.festivalSchoolId,
        rejectReason: rejectReason.trim(),
      });

      onStatusUpdate("rejected", null, rejectReason.trim());

      try {
        const accountId = await schoolServices.getAccountIdBySchoolId(
          festival.schoolId
        );

        await notificationServices.createByType(
          NOTIFICATION_EVENT.FESTIVAL_REJECT,
          {
            data: {
              festivalId: festival.festivalId,
              festivalName: festival.festivalName,
              schoolId: festival.schoolId,
              reason: rejectReason.trim(),
            },
            list_user_id: [accountId],
          }
        );
      } catch (e) {
        console.warn("Send notification failed:", e?.message || e);
      }

      setShowRejectModal(false);
      setRejectReason("");
      toast.success("Đã từ chối lễ hội");
    } catch (error) {
      console.error("Error rejecting festival:", error);
      toast.error("Có lỗi xảy ra khi từ chối lễ hội");
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="text-green-500" size={24} />;
      case "rejected":
        return <XCircle className="text-red-500" size={24} />;
      default:
        return <Clock className="text-yellow-500" size={24} />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "approved":
        return "bg-green-50 border-green-200";
      case "rejected":
        return "bg-red-50 border-red-200";
      default:
        return "bg-yellow-50 border-yellow-200";
    }
  };

  if (!festivalSchool) {
    return (
      <div className="text-center py-8">
        <AlertTriangle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Không tìm thấy thông tin đăng ký
        </h3>
        <p className="text-gray-600">
          Lễ hội này chưa có thông tin đăng ký từ trường.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div
        className={`p-6 rounded-lg border-2 ${getStatusColor(
          festivalSchool.status
        )}`}
      >
        <div className="flex items-center space-x-3 mb-4">
          {getStatusIcon(festivalSchool.status)}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              Trạng thái kiểm duyệt:
              {getStatusBadge(festivalSchool.status, "approval")}
            </h3>
            <p className="text-sm text-gray-600">
              ID đăng ký: {festivalSchool.festivalSchoolId}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Thông tin đăng ký</h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Calendar size={16} className="text-gray-400" />
                <span className="text-sm font-medium text-gray-700">
                  Ngày đăng ký:
                </span>
                <span className="text-sm text-gray-900">
                  {convertToVietnamTimeWithFormat(
                    festivalSchool.registrationDate
                  )}
                </span>
              </div>

              {festivalSchool.approvalDate && (
                <div className="flex items-center space-x-2">
                  <CheckCircle size={16} className="text-green-400" />
                  <span className="text-sm font-medium text-gray-700">
                    Ngày duyệt:
                  </span>
                  <span className="text-sm text-gray-900">
                    {convertToVietnamTimeWithFormat(
                      festivalSchool.approvalDate
                    )}
                  </span>
                </div>
              )}

              <div className="flex items-center space-x-2">
                <User size={16} className="text-gray-400" />
                <span className="text-sm font-medium text-gray-700">
                  Festival ID:
                </span>
                <span className="text-sm text-gray-900 font-mono">
                  {festivalSchool.festivalId}
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <User size={16} className="text-gray-400" />
                <span className="text-sm font-medium text-gray-700">
                  School ID:
                </span>
                <span className="text-sm text-gray-900 font-mono">
                  {festivalSchool.schoolId}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Thông tin lễ hội</h4>
            <div className="space-y-3">
              <div>
                <span className="text-sm font-medium text-gray-700">
                  Tên lễ hội:
                </span>
                <p className="text-sm text-gray-900 mt-1">
                  {festival.festivalName}
                </p>
              </div>

              <div>
                <span className="text-sm font-medium text-gray-700">
                  Chủ đề:
                </span>
                <p className="text-sm text-gray-900 mt-1">{festival.theme}</p>
              </div>

              <div>
                <span className="text-sm font-medium text-gray-700">
                  Địa điểm:
                </span>
                <p className="text-sm text-gray-900 mt-1">
                  {festival.location}
                </p>
              </div>

              <div>
                <span className="text-sm font-medium text-gray-700">
                  Thời gian:
                </span>
                <p className="text-sm text-gray-900 mt-1">
                  {convertToVietnamTimeWithFormat(festival.startDate)}
                  <br />
                  đến {convertToVietnamTimeWithFormat(festival.endDate)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {festivalSchool.rejectReason && (
          <div className="mt-6 p-4 bg-red-100 rounded-lg border border-red-200">
            <h4 className="text-sm font-medium text-red-800 mb-2 flex items-center gap-2">
              <XCircle size={16} />
              Lý do từ chối:
            </h4>
            <p className="text-sm text-red-700">
              {festivalSchool.rejectReason}
            </p>
          </div>
        )}
      </div>

      {festivalSchool.status === "pending" && (
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Thao tác kiểm duyệt
          </h3>

          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="text-sm font-medium text-blue-800 mb-2">
              Hướng dẫn kiểm duyệt
            </h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Kiểm tra thông tin lễ hội có chính xác và đầy đủ</li>
              <li>• Xác minh thời gian và địa điểm tổ chức</li>
              <li>• Đảm bảo nội dung phù hợp với quy định của trường</li>
              <li>• Kiểm tra khả năng thực hiện của ban tổ chức</li>
            </ul>
          </div>

          <p className="text-gray-600 mb-6">
            Vui lòng xem xét kỹ thông tin lễ hội trước khi thực hiện kiểm duyệt.
            Quyết định này sẽ ảnh hưởng đến việc tổ chức lễ hội.
          </p>

          <div className="flex space-x-4">
            <button
              onClick={handleApprove}
              disabled={loading}
              className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2"
            >
              <CheckCircle size={18} />
              <span>{loading ? "Đang xử lý..." : "Duyệt lễ hội"}</span>
            </button>

            <button
              onClick={() => setShowRejectModal(true)}
              disabled={loading}
              className="bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2"
            >
              <XCircle size={18} />
              <span>Từ chối lễ hội</span>
            </button>
          </div>
        </div>
      )}

      {festivalSchool.status !== "pending" && (
        <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Clock size={20} />
            Lịch sử kiểm duyệt
          </h3>

          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 px-4 bg-white rounded-lg border">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <Calendar size={16} className="text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Đăng ký lễ hội</p>
                  <p className="text-sm text-gray-600">
                    {convertToVietnamTimeWithFormat(
                      festivalSchool.registrationDate
                    )}
                  </p>
                </div>
              </div>
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                Hoàn thành
              </span>
            </div>

            <div className="flex items-center justify-between py-3 px-4 bg-white rounded-lg border">
              <div className="flex items-center gap-3">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    festivalSchool.status === "approved"
                      ? "bg-green-100"
                      : "bg-red-100"
                  }`}
                >
                  {festivalSchool.status === "approved" ? (
                    <CheckCircle size={16} className="text-green-600" />
                  ) : (
                    <XCircle size={16} className="text-red-600" />
                  )}
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    {festivalSchool.status === "approved"
                      ? "Duyệt lễ hội"
                      : "Từ chối lễ hội"}
                  </p>
                  <p className="text-sm text-gray-600">
                    {convertToVietnamTimeWithFormat(
                      festivalSchool.approvalDate ||
                        festivalSchool.registrationDate
                    )}
                  </p>
                </div>
              </div>
              {getStatusBadge(festivalSchool.status, "approval")}
            </div>
          </div>

          <div className="mt-6 p-4 bg-white rounded-lg border">
            <h4 className="font-medium text-gray-900 mb-3">Tóm tắt kết quả</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Trạng thái cuối:</span>
                <div className="mt-1">
                  {getStatusBadge(festivalSchool.status, "approval")}
                </div>
              </div>
              <div>
                <span className="text-gray-600">Thời gian xử lý:</span>
                <p className="text-gray-900 mt-1">
                  {festivalSchool.approvalDate
                    ? Math.ceil(
                        (new Date(festivalSchool.approvalDate) -
                          new Date(festivalSchool.registrationDate)) /
                          (1000 * 60 * 60 * 24)
                      )
                    : 0}{" "}
                  ngày
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Thông tin bổ sung
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-3">
              Cấu hình gian hàng
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Gian hàng đồ ăn:</span>
                <span className="font-medium">
                  {festival.maxFoodBooths || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Gian hàng đồ uống:</span>
                <span className="font-medium">
                  {festival.maxBeverageBooths || 0}
                </span>
              </div>
              <div className="flex justify-between border-t pt-2 mt-2">
                <span className="text-gray-600">Tổng cộng:</span>
                <span className="font-medium">
                  {(festival.maxFoodBooths || 0) +
                    (festival.maxBeverageBooths || 0)}
                </span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 mb-3">
              Thời gian đăng ký
            </h4>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-gray-600">Mở đăng ký:</span>
                <p className="text-gray-900 mt-1">
                  {convertToVietnamTimeWithFormat(
                    festival.registrationStartDate
                  )}
                </p>
              </div>
              <div>
                <span className="text-gray-600">Đóng đăng ký:</span>
                <p className="text-gray-900 mt-1">
                  {convertToVietnamTimeWithFormat(festival.registrationEndDate)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {festival.description && (
          <div className="mt-6">
            <h4 className="font-medium text-gray-900 mb-2">Mô tả lễ hội</h4>
            <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
              {festival.description}
            </p>
          </div>
        )}
      </div>

      {showRejectModal && (
        <div className="mt-0-important fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <XCircle size={20} className="text-red-600" />
              Từ chối lễ hội
            </h3>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lý do từ chối <span className="text-red-500">*</span>
              </label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none"
                rows={4}
                placeholder="Nhập lý do cụ thể tại sao từ chối lễ hội này..."
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Lý do này sẽ được gửi đến ban tổ chức để họ có thể chỉnh sửa và
                đăng ký lại.
              </p>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectReason("");
                }}
                disabled={loading}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleReject}
                disabled={loading || !rejectReason.trim()}
                className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white px-4 py-2 rounded-lg transition-colors"
              >
                {loading ? "Đang xử lý..." : "Xác nhận từ chối"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminApprovalTab;
