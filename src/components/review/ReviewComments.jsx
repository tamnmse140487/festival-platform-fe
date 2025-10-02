import React, { useEffect, useMemo, useState } from "react";
import CommentItem from "./CommentItem";
import CommentForm from "./CommentForm";
import Button from "../common/Button";
import { toast } from "react-hot-toast";
import { useAuth } from "../../contexts/AuthContext";
import { commentServices } from "../../services/commentServices";

const VISIBLE_DEFAULT = 3;

export default function ReviewComments({ reviewId, className = "" }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [items, setItems] = useState([]);
  const [showAll, setShowAll] = useState(false);

  const fetchComments = async () => {
    if (!reviewId) return;
    setLoading(true);
    try {
      const res = await commentServices.get({ reviewId });
      const data = Array.isArray(res?.data?.data) ? res.data.data : [];
      data.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      setItems(data);
    } catch (e) {
      console.error("Fetch comments error:", e);
      toast.error("Không thể tải bình luận");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [reviewId]);

  const roots = useMemo(
    () => items.filter((c) => !c.parentCommentId),
    [items]
  );

  const visible = useMemo(() => {
    if (showAll) return roots;
    return roots.slice(0, VISIBLE_DEFAULT);
  }, [roots, showAll]);

  const remainCount = Math.max(roots.length - VISIBLE_DEFAULT, 0);

  const handleCreate = async (content) => {
    if (!user?.id) {
      toast.error("Vui lòng đăng nhập để bình luận.");
      return;
    }
    setSubmitting(true);
    try {
      const payload = { reviewId, accountId: user.id, content };
      const res = await commentServices.create(payload);
      const created =
        res?.data?.data || {
          commentId: Date.now(),
          reviewId,
          accountId: user.id,
          content,
          isEdit: false,
          parentCommentId: null,
          createdAt: new Date().toISOString(),
          updatedAt: null,
          account: {
            accountId: user.id,
            email: user.email,
            fullName: user.fullName || user.full_name || `Người dùng #${user.id}`,
            avatarUrl: user.avatarUrl || user.avatar_url || null,
          },
        };
      setItems((prev) => [...prev, created]);
      if (!showAll && roots.length + 1 > VISIBLE_DEFAULT) {
        setShowAll(false);
      }
      toast.success("Đã gửi bình luận!");
    } catch (e) {
      console.error("Create comment error:", e);
      toast.error("Không thể gửi bình luận");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={`mt-4 ${className}`}>
      <h4 className="text-sm font-semibold mb-3">Bình luận</h4>

      {loading ? (
        <div className="space-y-3">
          <div className="h-14 bg-gray-100 rounded animate-pulse" />
          <div className="h-14 bg-gray-100 rounded animate-pulse" />
          <div className="h-14 bg-gray-100 rounded animate-pulse" />
        </div>
      ) : roots.length === 0 ? (
        <p className="text-sm text-gray-500">Chưa có bình luận nào.</p>
      ) : (
        <div className="space-y-4">
          {visible.map((c) => (
            <CommentItem key={c.commentId} comment={c} />
          ))}
          {remainCount > 0 && !showAll ? (
            <div className="pt-1">
              <Button variant="outline" size="sm" onClick={() => setShowAll(true)}>
                Xem thêm {remainCount} bình luận
              </Button>
            </div>
          ) : roots.length > VISIBLE_DEFAULT ? (
            <div className="pt-1">
              <Button variant="ghost" size="sm" onClick={() => setShowAll(false)}>
                Thu gọn
              </Button>
            </div>
          ) : null}
        </div>
      )}

      <div className="mt-4">
        <CommentForm onSubmit={handleCreate} submitting={submitting} />
      </div>
    </div>
  );
}
