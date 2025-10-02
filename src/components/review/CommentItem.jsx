import React from "react";
import { UserIcon } from "lucide-react";
import { convertToVietnamTimeWithFormat } from "../../utils/formatters";

const Avatar = ({ url, name = "Người dùng", size = 32, className = "" }) => {
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

export default function CommentItem({ comment }) {
  const acc = comment?.account || {};
  const name =
    acc.fullName || acc.full_name || `Người dùng #${acc.accountId || ""}`;
  const avatarUrl = acc.avatarUrl || acc.avatar_url || "";

  return (
    <div className="flex gap-3">
      <Avatar url={avatarUrl} name={name} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="font-medium text-gray-900 truncate max-w-[220px] mb-0" title={name}>
            {name}
          </p>
          <span className="text-xs text-gray-500">
            {convertToVietnamTimeWithFormat(comment.createdAt)}
            {comment.isEdit ? " • đã chỉnh sửa" : ""}
          </span>
        </div>
        {comment.content ? (
          <p className="mt-1 text-sm text-gray-800 whitespace-pre-wrap">
            {comment.content}
          </p>
        ) : null}
      </div>
    </div>
  );
}
