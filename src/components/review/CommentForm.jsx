import React, { useState } from "react";
import Button from "../common/Button";
import { Save } from "lucide-react";

export default function CommentForm({ onSubmit, submitting }) {
  const [value, setValue] = useState("");

  const handleSend = async () => {
    const content = value.trim();
    if (!content) return;
    await onSubmit(content);
    setValue("");
  };

  return (
    <div className="rounded-lg border border-gray-200 p-3">
      <textarea
        rows={3}
        className="w-full rounded-md border border-gray-300 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="Viết bình luận của bạn..."
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
      <div className="mt-3 flex justify-end">
        <Button
          variant="primary"
          disabled={submitting || !value.trim()}
          onClick={handleSend}
          icon={<Save size={16} />}
        >
          {submitting ? "Đang gửi..." : "Gửi bình luận"}
        </Button>
      </div>
    </div>
  );
}
