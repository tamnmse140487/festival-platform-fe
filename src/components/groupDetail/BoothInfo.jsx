import React, { useState, useEffect, useMemo } from "react";
import { Store } from "lucide-react";
import { Button, Breadcrumb } from "antd";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

import { boothServices } from "../../services/boothServices";
import { festivalServices } from "../../services/festivalServices";
import { convertToVietnamTimeWithFormat } from "../../utils/formatters";
import { BOOTH_STATUS } from "../../utils/constants";

const BoothInfo = ({ groupId }) => {
  const navigate = useNavigate();
  const [booths, setBooths] = useState([]);
  const [festivalsById, setFestivalsById] = useState({});
  const [loading, setLoading] = useState(false);

  const getStatusBadge = (status) => {
    const statusConfig = {
      [BOOTH_STATUS.APPROVED]: {
        label: "Đã duyệt",
        class: "bg-green-100 text-green-800",
      },
      [BOOTH_STATUS.PENDING]: {
        label: "Chờ duyệt",
        class: "bg-yellow-100 text-yellow-800",
      },
      [BOOTH_STATUS.REJECTED]: {
        label: "Từ chối",
        class: "bg-red-100 text-red-800",
      },
      [BOOTH_STATUS.ACTIVE]: {
        label: "Hoạt động",
        class: "bg-blue-100 text-blue-800",
      },
      [BOOTH_STATUS.CLOSED]: {
        label: "Đã đóng",
        class: "bg-gray-100 text-gray-800",
      },
    };
    const config = statusConfig[status] || statusConfig[BOOTH_STATUS.PENDING];
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded ${config.class}`}>
        {config.label}
      </span>
    );
  };

  const fetchBooths = async () => {
    setLoading(true);
    try {
      const boothResponse = await boothServices.get({ groupId });
      const list = Array.isArray(boothResponse.data) ? boothResponse.data : [];
      setBooths(list);

      const ids = [...new Set(list.map((b) => b.festivalId).filter(Boolean))];
      if (ids.length) {
        const results = await Promise.all(
          ids.map(async (id) => {
            try {
              const res = await festivalServices.get({ festivalId: id });
              return res?.data?.[0] ? [id, res.data[0]] : null;
            } catch {
              return null;
            }
          })
        );
        const map = {};
        results.forEach((pair) => {
          if (pair) map[pair[0]] = pair[1];
        });
        setFestivalsById(map);
      } else {
        setFestivalsById({});
      }
    } catch (e) {
      console.error("Error fetching booths:", e);
      toast.error("Không thể tải danh sách gian hàng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (groupId) fetchBooths();
  }, [groupId]);

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
        <p className="text-gray-600 mt-2">Đang tải danh sách gian hàng...</p>
      </div>
    );
  }

  if (booths.length === 0) {
    return (
      <div className="text-center py-12">
        <Store className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Chưa có gian hàng
        </h3>
        <p className="text-gray-600">Nhóm chưa đăng ký gian hàng nào.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">
          Danh sách gian hàng của nhóm
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {booths.map((item) => {
            const fest = festivalsById[item.festivalId];
            return (
              <div
                key={item.boothId}
                className="group rounded-2xl border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between gap-3">
                  <span
                    className="inline-flex items-center gap-2 max-w-[70%] rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-700 truncate font-bold"
                    title={fest?.festivalName || "—"}
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                    {fest?.festivalName || "—"}
                  </span>
                  {getStatusBadge(item.status)}
                </div>

                <h3
                  className="mt-3 text-sm font-semibold text-gray-900 truncate"
                  title={item.boothName}
                >
                  {item.boothName}
                </h3>

                <div className="mt-2 grid gap-1.5 text-xs">
                  <div className="flex items-center">
                    <span className="w-24 shrink-0 text-gray-500">Loại</span>
                    <span className="text-gray-800 font-medium truncate">
                      {item.boothType}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span className="w-24 shrink-0 text-gray-500">
                      Ngày tạo
                    </span>
                    <span className="text-gray-800 truncate">
                      {convertToVietnamTimeWithFormat(item.registrationDate)}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span className="w-24 shrink-0 text-gray-500">Mã</span>
                    <span className="text-gray-800 truncate">
                      #{item.boothId}
                    </span>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-end">
                  <Button
                    type="primary"
                    className="rounded-xl px-4"
                    onClick={() =>
                      navigate(`/app/groups/${groupId}/booth/${item.boothId}`)
                    }
                  >
                    Xem chi tiết
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default BoothInfo;