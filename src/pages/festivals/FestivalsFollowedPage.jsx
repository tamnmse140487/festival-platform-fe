import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Calendar,
  MapPin,
  School,
  Image as ImageIcon,
  ArrowRight,
  Loader2,
  Bookmark,
} from "lucide-react";
import { festivalParticipantsServices } from "../../services/festivalParticipantsServices";
import { schoolServices } from "../../services/schoolServices";
import { imageServices } from "../../services/imageServices";
import { convertToVietnamTimeWithFormat } from "../../utils/formatters";
import { getStatusFestivalBadge } from "../../utils/helpers";
import toast from "react-hot-toast";
import { useAuth } from "../../contexts/AuthContext";

const placeholder =
  "https://images.unsplash.com/photo-1485451456034-3f9391c6f291?q=80&w=1200&auto=format&fit=crop";

const formatVN = (iso) => {
  try {
    return convertToVietnamTimeWithFormat(iso);
  } catch {
    const d = new Date(iso);
    return d.toLocaleString("vi-VN", { hour12: false });
  }
};

export default function FestivalsFollowedPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState([]);

  useEffect(() => {
    let alive = true;

    const load = async () => {
      try {
        setLoading(true);

        const res = await festivalParticipantsServices.get({ accountId: user.id });
        const list = Array.isArray(res?.data) ? res.data : [];

        const enriched = await Promise.all(
          list.map(async (p) => {
            const fest = p?.festival || null;
            if (!fest) return null;

            let schoolName = "Đang cập nhật";
            let logoUrl = "";
            try {
              const sRes = await schoolServices.get({ id: fest.schoolId });
              const arr = Array.isArray(sRes?.data) ? sRes.data : [];
              const found =
                arr.find((s) => String(s.schoolId) === String(fest.schoolId)) ||
                arr[0];
              schoolName = found?.schoolName ?? schoolName;
              logoUrl = found?.logoUrl ?? "";
            } catch (e) {
              console.log(e);
            }

            let coverImage = "";
            try {
              const iRes = await imageServices.get({
                festivalId: fest.festivalId,
              });
              const imgs = Array.isArray(iRes?.data) ? iRes.data : [];
              coverImage = imgs[0]?.imageUrl || "";
            } catch (e) {
              console.log(e);
            }

            return {
              participantId: p.id,
              festival: fest,
              school: { name: schoolName, logoUrl },
              coverImage,
            };
          })
        );

        if (!alive) return;
        setRows(enriched.filter(Boolean));
      } catch (e) {
        console.error("Load followed festivals error:", e);
        setRows([]);
      } finally {
        if (alive) setLoading(false);
      }
    };

    load();
    return () => {
      alive = false;
    };
  }, [user?.id]);

  const handleRemove = async (festivalId, accountId) => {
    setRows((prev) => prev.filter((r) => r.festival.festivalId !== festivalId));

    try {
      await festivalParticipantsServices.delete({ festivalId, accountId });
      toast.success("Đã huỷ tham gia lễ hội");
    } catch (err) {
      console.error("Delete error:", err);
      toast.error("Không thể huỷ tham gia lễ hội");
      setRows((prev) => [...prev]);
    }
  };

  const content = useMemo(() => {
    if (loading) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="animate-pulse bg-white rounded-2xl overflow-hidden shadow-sm border"
            >
              <div className="h-40 bg-gray-200" />
              <div className="p-4 space-y-3">
                <div className="h-6 w-2/3 bg-gray-200 rounded" />
                <div className="h-4 w-1/2 bg-gray-200 rounded" />
                <div className="h-4 w-3/4 bg-gray-200 rounded" />
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (!rows.length) {
      return (
        <div className="flex flex-col items-center justify-center py-24">
          <ImageIcon className="w-12 h-12 text-gray-400 mb-3" />
          <h3 className="text-lg font-semibold text-gray-900">
            Chưa có lễ hội nào
          </h3>
          <p className="text-gray-500 mt-1">
            Bạn chưa theo dõi/đăng ký tham gia lễ hội nào.
          </p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {rows.map(({ festival, school, coverImage, participantId }) => (
          <div
            key={participantId}
            onClick={() =>
              navigate(`/app/festivals-followed/${festival.festivalId}`)
            }
            className="relative group text-left bg-white rounded-2xl overflow-hidden shadow-sm border hover:shadow-lg transition-shadow"
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleRemove(festival.festivalId, user.id);
              }}
              className="absolute top-3 right-3 p-2 rounded-full bg-white shadow hover:bg-gray-100 z-10"
              title="Huỷ tham gia"
            >
              <Bookmark className="w-5 h-5 text-yellow-400 fill-yellow-400" />
            </button>

            <div className="relative h-44 w-full">
              <img
                src={coverImage || placeholder}
                alt={festival.festivalName}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium backdrop-blur">
                  {getStatusFestivalBadge(festival.status)}
                </span>
                <ArrowRight className="w-5 h-5 text-white opacity-90 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>

            <div className="p-4">
              <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
                {festival.festivalName}
              </h3>
              {festival.theme && (
                <p className="text-sm text-gray-600 mt-0.5 line-clamp-1">
                  {festival.theme}
                </p>
              )}

              <div className="flex flex-col gap-3 mt-4 p-3 rounded-lg bg-gray-50">
                <p className="text-sm font-medium text-gray-600 whitespace-nowrap mb-0-important">
                  Đơn vị tổ chức:
                </p>

                <div className="flex flex-row items-center">
                  {school.logoUrl ? (
                    <img
                      src={school.logoUrl}
                      alt={school.name}
                      className="w-12 h-12 rounded-full object-cover border shadow-sm"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center border shadow-sm">
                      <School className="w-5 h-5 text-gray-500" />
                    </div>
                  )}

                  <span className="text-base font-semibold text-gray-900 line-clamp-1">
                    {school.name}
                  </span>
                </div>
              </div>

              <div className="mt-4 space-y-2 text-sm">
                <div className="flex items-center text-gray-700">
                  <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                  <span className="line-clamp-1">
                    {formatVN(festival.startDate)} —{" "}
                    {formatVN(festival.endDate)}
                  </span>
                </div>
                <div className="flex items-center text-gray-700">
                  <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                  <span className="line-clamp-1">{festival.location}</span>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between text-sm">
                <div className="text-gray-600">
                  Gian hàng:{" "}
                  <span className="font-semibold text-gray-900">
                    {Number(festival.maxFoodBooths || 0) +
                      Number(festival.maxBeverageBooths || 0)}
                  </span>
                </div>
                <div className="text-gray-600">
                  Người tham gia:{" "}
                  <span className="font-semibold text-gray-900">
                    {festival.totalRegisteredParticipants ?? 0}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }, [loading, rows, navigate]);

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Lễ hội bạn đang theo dõi
          </h1>
          <p className="text-gray-600 mt-1">
            Danh sách các lễ hội mà bạn đã đăng ký/đang theo dõi.
          </p>
        </div>
        {loading && (
          <div className="inline-flex items-center text-sm text-gray-600">
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Đang tải...
          </div>
        )}
      </header>

      {content}
    </div>
  );
}
