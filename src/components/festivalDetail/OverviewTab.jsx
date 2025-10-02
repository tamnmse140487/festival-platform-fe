import React, { useEffect, useMemo, useState } from "react";
import {
  Calendar,
  Clock,
  Star,
  Edit,
  Trash2,
  Save,
  X,
  UserIcon,
} from "lucide-react";
import { Rate, Popconfirm } from "antd";
import Card from "../common/Card";
import Button from "../common/Button";
import { useAuth } from "../../contexts/AuthContext";
import { convertToVietnamTimeWithFormat } from "../../utils/formatters";
import { reviewsServices } from "../../services/reviewsServices";
import { accountServices } from "../../services/accountServices";
import { toast } from "react-hot-toast";
import { FESTIVAL_STATUS, NOTIFICATION_EVENT } from "../../utils/constants";
import { notificationServices } from "../../services/notificationServices";
import { schoolServices } from "../../services/schoolServices";
import ReviewComments from "../review/ReviewComments";

const OverviewTab = ({ festival }) => {
  console.log("festival: ", festival);
  const { user } = useAuth();

  const [loadingReviews, setLoadingReviews] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [accounts, setAccounts] = useState({});
  const [myReview, setMyReview] = useState(null);

  const [form, setForm] = useState({ rating: 0, comment: "" });
  const [submitting, setSubmitting] = useState(false);
  const [editing, setEditing] = useState(false);

  const Avatar = ({ accountId, size = 36, className = "" }) => {
    const acc = accounts[accountId];
    const url = acc?.avatarUrl;
    const name = acc?.fullName || `Người dùng #${accountId}`;

    if (url) {
      return (
        <img
          src={url}
          alt={name}
          className={`rounded-full object-cover ${className}`}
          style={{ width: size, height: size }}
        />
      );
    }

    return (
      <div
        className={`rounded-full bg-gray-200 text-gray-600 flex items-center justify-center ${className}`}
        style={{ width: size, height: size }}
        title={name}
      >
        <UserIcon size={Math.floor(size * 0.6)} />
      </div>
    );
  };

  const ReviewStars = ({ value = 0, size = 16 }) => (
    <div className="flex items-center">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={size}
          className={
            i < value ? "text-yellow-500 fill-yellow-500" : "text-gray-300"
          }
        />
      ))}
    </div>
  );

  const fetchAccounts = async (ids = []) => {
    if (!ids.length) return;
    try {
      const unique = [...new Set(ids)].filter(Boolean);
      const results = await Promise.all(
        unique.map(async (id) => {
          try {
            const res = await accountServices.get({ id });
            const data = Array.isArray(res?.data) ? res.data[0] : res?.data;
            if (data) {
              return [
                id,
                {
                  fullName:
                    data.fullName || data.full_name || `Người dùng #${id}`,
                  avatarUrl: data.avatarUrl || data.avatar_url || "",
                },
              ];
            }
            return [id, { fullName: `Người dùng #${id}`, avatarUrl: "" }];
          } catch {
            return [id, { fullName: `Người dùng #${id}`, avatarUrl: "" }];
          }
        })
      );
      setAccounts((prev) => {
        const next = { ...prev };
        results.forEach(([id, info]) => {
          next[id] = info;
        });
        return next;
      });
    } catch (e) {
      console.warn("Fetch accounts failed:", e?.message || e);
    }
  };

  const fetchReviews = async () => {
    if (!festival?.festivalId) return;
    setLoadingReviews(true);
    try {
      const allRes = await reviewsServices.get({
        festivalId: festival.festivalId,
      });
      const list = Array.isArray(allRes?.data) ? allRes.data : [];
      list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setReviews(list);

      let mine = null;
      if (user?.id) {
        try {
          const mineRes = await reviewsServices.get({ accountId: user.id });
          const mineList = Array.isArray(mineRes?.data) ? mineRes.data : [];
          mine =
            mineList.find(
              (r) => String(r.festivalId) === String(festival.festivalId)
            ) || null;
        } catch {
          mine =
            list.find((r) => String(r.accountId) === String(user.id)) || null;
        }
      }
      setMyReview(mine);
      if (mine) {
        setForm({ rating: mine.rating ?? 0, comment: mine.comment ?? "" });
        setEditing(false);
      } else {
        setForm({ rating: 0, comment: "" });
        setEditing(false);
      }

      const allIds = list.map((r) => r.accountId);
      if (mine?.accountId) allIds.push(mine.accountId);
      await fetchAccounts(allIds);
    } catch (e) {
      console.error("Fetch reviews error:", e);
      toast.error("Không thể tải đánh giá");
    } finally {
      setLoadingReviews(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [festival?.festivalId, user?.id]);

  const avgRating = useMemo(() => {
    if (typeof festival?.avr_Rating === "number") return festival.avr_Rating;
    if (!reviews.length) return 0;
    const sum = reviews.reduce((acc, r) => acc + (Number(r.rating) || 0), 0);
    return sum / reviews.length;
  }, [festival?.avr_Rating, reviews]);

  const handleCreate = async () => {
    if (!user?.id) return toast.error("Vui lòng đăng nhập để đánh giá.");
    if (!form.rating) return toast.error("Vui lòng chọn số sao.");

    try {
      setSubmitting(true);
      const res = await reviewsServices.create({
        festivalId: festival.festivalId,
        accountId: user.id,
        rating: form.rating,
        comment: form.comment?.trim() || "",
      });

      try {
        const accountId = await schoolServices.getAccountIdBySchoolId(
          festival.schoolId
        );

        await notificationServices.createByType(
          NOTIFICATION_EVENT.FESTIVAL_COMMENT,
          {
            data: {
              festivalId: festival.festivalId,
              festivalName: festival.festivalName,
              comment: form.comment?.trim(),
            },
            list_user_id: [accountId],
          }
        );
      } catch (e) {
        console.warn("Send notification failed:", e?.message || e);
      }

      const created = res?.data || {
        reviewId: Date.now(),
        festivalId: festival.festivalId,
        accountId: user.id,
        rating: form.rating,
        comment: form.comment?.trim() || "",
        isEdit: false,
        createdAt: new Date().toISOString(),
        updatedAt: null,
      };

      setAccounts((prev) => ({
        ...prev,
        [user.id]: prev[user.id] || {
          fullName: user.fullName || user.full_name || `Người dùng #${user.id}`,
          avatarUrl: user.avatarUrl || user.avatar_url || "",
        },
      }));

      setMyReview(created);
      setReviews((prev) => [
        created,
        ...prev.filter((r) => String(r.accountId) !== String(user.id)),
      ]);
      setEditing(false);

      toast.success("Đã gửi đánh giá!");
    } catch (e) {
      console.error("Create review error:", e);
      toast.error("Không thể gửi đánh giá");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async () => {
    if (!myReview?.reviewId) return;
    if (!form.rating) return toast.error("Vui lòng chọn số sao.");

    try {
      setSubmitting(true);
      await reviewsServices.update({
        reviewId: myReview.reviewId,
        rating: form.rating,
        comment: form.comment?.trim() || "",
      });

      const updated = {
        ...myReview,
        rating: form.rating,
        comment: form.comment?.trim() || "",
        isEdit: true,
        updatedAt: new Date().toISOString(),
      };
      setMyReview(updated);
      setReviews((prev) =>
        prev.map((r) => (r.reviewId === myReview.reviewId ? updated : r))
      );
      setEditing(false);

      toast.success("Đã cập nhật đánh giá!");
    } catch (e) {
      console.error("Update review error:", e);
      toast.error("Không thể cập nhật đánh giá");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!myReview?.reviewId) return;

    try {
      setSubmitting(true);
      await reviewsServices.delete({ reviewId: myReview.reviewId });

      setReviews((prev) =>
        prev.filter((r) => r.reviewId !== myReview.reviewId)
      );
      setMyReview(null);
      setForm({ rating: 0, comment: "" });
      setEditing(false);

      toast.success("Đã xoá đánh giá!");
    } catch (e) {
      console.error("Delete review error:", e);
      toast.error("Không thể xoá đánh giá");
    } finally {
      setSubmitting(false);
    }
  };

  if (!festival) {
    return (
      <div className="space-y-6">
        <Card>
          <Card.Content>
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
          </Card.Content>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <Card.Header>
          <Card.Title>Mô tả lễ hội</Card.Title>
        </Card.Header>
        <Card.Content>
          <p className="text-gray-700 leading-relaxed">
            {festival.description}
          </p>
        </Card.Content>
      </Card>

      <Card>
        <Card.Header>
          <Card.Title>Lịch trình đăng ký</Card.Title>
        </Card.Header>
        <Card.Content>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
              <div>
                <h4 className="font-medium text-blue-900">Mở đăng ký</h4>
                <p className="text-blue-700 text-sm">
                  {convertToVietnamTimeWithFormat(
                    festival.registrationStartDate
                  )}
                </p>
              </div>
              <Calendar className="w-8 h-8 text-blue-600" />
            </div>

            <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
              <div>
                <h4 className="font-medium text-red-900">Đóng đăng ký</h4>
                <p className="text-red-700 text-sm">
                  {convertToVietnamTimeWithFormat(festival.registrationEndDate)}
                </p>
              </div>
              <Clock className="w-8 h-8 text-red-600" />
            </div>
          </div>
        </Card.Content>
      </Card>

      {(festival.status === FESTIVAL_STATUS.ONGOING ||
        festival.status === FESTIVAL_STATUS.COMPLETED) && (
        <Card>
          <Card.Header>
            <div className="flex items-center justify-between w-full">
              <Card.Title>Bình luận & nhận xét</Card.Title>
              <div className="flex items-center gap-3">
                <Rate disabled value={Number(avgRating) || 0} />
                <span className="text-sm">
                  <span className="font-semibold">
                    {(Number(avgRating) || 0).toFixed(1)}
                  </span>{" "}
                  / 5
                </span>
                <span className="text-sm text-gray-500">
                  ({reviews.length} đánh giá)
                </span>
              </div>
            </div>
          </Card.Header>

          <Card.Content>
            <div className="mb-6 rounded-lg border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  {user?.id && <Avatar accountId={user.id} size={32} />}
                  <p className="font-medium">
                    {myReview
                      ? editing
                        ? "Chỉnh sửa đánh giá của bạn"
                        : "Đánh giá của bạn"
                      : "Viết đánh giá của bạn"}
                  </p>
                </div>

                {myReview && !editing && (
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setForm({
                          rating: myReview.rating || 0,
                          comment: myReview.comment || "",
                        });
                        setEditing(true);
                      }}
                      icon={<Edit size={16} />}
                    >
                      Sửa
                    </Button>
                    <Popconfirm
                      title="Xoá đánh giá?"
                      description="Bạn chắc chắn muốn xoá đánh giá này?"
                      okText="Xoá"
                      cancelText="Huỷ"
                      onConfirm={handleDelete}
                    >
                      <Button
                        size="sm"
                        variant="danger"
                        icon={<Trash2 size={16} />}
                      >
                        Xoá
                      </Button>
                    </Popconfirm>
                  </div>
                )}
              </div>

              {!myReview && (
                <>
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-sm text-gray-600">Chọn số sao:</span>
                    <Rate
                      value={form.rating}
                      onChange={(v) => setForm((s) => ({ ...s, rating: v }))}
                    />
                  </div>
                  <textarea
                    rows={3}
                    className="w-full rounded-md border border-gray-300 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Chia sẻ cảm nhận của bạn..."
                    value={form.comment}
                    onChange={(e) =>
                      setForm((s) => ({ ...s, comment: e.target.value }))
                    }
                  />
                  <div className="mt-3 flex justify-end">
                    <Button
                      variant="primary"
                      disabled={submitting}
                      onClick={handleCreate}
                      icon={<Save size={16} />}
                    >
                      {submitting ? "Đang lưu..." : "Gửi đánh giá"}
                    </Button>
                  </div>
                </>
              )}

              {myReview && !editing && (
                <div className="rounded-md bg-gray-50 p-3">
                  <div className="flex items-center justify-between">
                    <ReviewStars value={Number(myReview.rating) || 0} />
                    <span className="text-xs text-gray-500">
                      {convertToVietnamTimeWithFormat(myReview.createdAt)}
                      {myReview.isEdit ? " • đã chỉnh sửa" : ""}
                    </span>
                  </div>
                  {myReview.comment && (
                    <p className="mt-2 text-sm text-gray-700">
                      {myReview.comment}
                    </p>
                  )}
                </div>
              )}

              {myReview && editing && (
                <>
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-sm text-gray-600">Chọn số sao:</span>
                    <Rate
                      value={form.rating}
                      onChange={(v) => setForm((s) => ({ ...s, rating: v }))}
                    />
                  </div>
                  <textarea
                    rows={3}
                    className="w-full rounded-md border border-gray-300 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Cập nhật cảm nhận của bạn..."
                    value={form.comment}
                    onChange={(e) =>
                      setForm((s) => ({ ...s, comment: e.target.value }))
                    }
                  />
                  <div className="mt-3 flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setEditing(false);
                        setForm({
                          rating: myReview.rating || 0,
                          comment: myReview.comment || "",
                        });
                      }}
                      icon={<X size={16} />}
                    >
                      Huỷ
                    </Button>
                    <Button
                      variant="primary"
                      disabled={submitting}
                      onClick={handleUpdate}
                      icon={<Save size={16} />}
                    >
                      {submitting ? "Đang lưu..." : "Cập nhật"}
                    </Button>
                  </div>
                </>
              )}
            </div>

            <div className="space-y-4">
              {loadingReviews ? (
                <div className="space-y-3">
                  <div className="h-16 bg-gray-100 rounded animate-pulse" />
                  <div className="h-16 bg-gray-100 rounded animate-pulse" />
                  <div className="h-16 bg-gray-100 rounded animate-pulse" />
                </div>
              ) : reviews.length === 0 ? (
                <p className="text-sm text-gray-500">Chưa có đánh giá nào.</p>
              ) : (
                reviews.map((r) => {
                  const acc = accounts[r.accountId];
                  const name = acc?.fullName || `Người dùng #${r.accountId}`;
                  return (
                    <div
                      key={r.reviewId}
                      className={`rounded-lg border p-4 ${
                        String(r.accountId) === String(user?.id)
                          ? "border-blue-200 bg-blue-50/40"
                          : "border-gray-200"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 min-w-0">
                          <Avatar accountId={r.accountId} />
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p
                                className="font-medium text-gray-900 truncate max-w-[220px] mb-0"
                                title={name}
                              >
                                {name}
                              </p>
                              <ReviewStars value={Number(r.rating) || 0} />
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              {convertToVietnamTimeWithFormat(r.createdAt)}
                              {r.isEdit ? " • đã chỉnh sửa" : ""}
                            </p>
                          </div>
                        </div>
                      </div>
                      {r.comment && (
                        <p className="mt-2 text-gray-800 text-sm">
                          {r.comment}
                        </p>
                      )}

                      <ReviewComments reviewId={r.reviewId} className="mt-3" />
                    </div>
                  );
                })
              )}
            </div>
          </Card.Content>
        </Card>
      )}
    </div>
  );
};

export default OverviewTab;
