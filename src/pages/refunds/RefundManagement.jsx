import React, { useEffect, useMemo, useState } from "react";
import {
  Table,
  Tag,
  Button,
  Dropdown,
  Popconfirm,
  Input,
  Avatar,
  Modal,
  Descriptions,
  Divider,
} from "antd";
import {
  MoreOutlined,
  CheckCircleOutlined,
  DeleteOutlined,
  ReloadOutlined,
  SearchOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import { toast } from "react-hot-toast";
import { requestServices } from "../../services/requestServices";
import { boothServices } from "../../services/boothServices";
import { convertToVietnamTimeWithFormat } from "../../utils/formatters";

import {
  HISTORY_TYPE,
  REQUEST_STATUS,
  REQUEST_STATUS_LABEL,
  REQUEST_TYPE,
  REQUEST_TYPE_LABEL,
} from "../../utils/constants";
import { accountWalletHistoriesServices } from "../../services/accountWalletHistoryServices";
import { walletServices } from "../../services/walletServices";
import { vietqrServices } from "../../services/atmServices";

const { Search } = Input;

const RefundManagement = () => {
  const [loading, setLoading] = useState(false);
  const [requests, setRequests] = useState([]);
  const [processingIds, setProcessingIds] = useState(new Set());
  const [deletingIds, setDeletingIds] = useState(new Set());
  const [searchText, setSearchText] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedReq, setSelectedReq] = useState(null);
  const [banksMap, setBanksMap] = useState({});

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const list = await vietqrServices.getBanks();
        if (!mounted) return;
        const map = {};
        list.forEach((b) => {
          const short = String(b.shortName || "").toUpperCase();
          if (short) map[short] = { logo: b.logo, shortName: b.shortName };
        });
        setBanksMap(map);
      } catch {}
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await requestServices.get({ type: REQUEST_TYPE.REFUND });
      let data = Array.isArray(res?.data) ? res.data : [];
      data = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setRequests(data);
    } catch (e) {
      toast.error("Không thể tải danh sách yêu cầu hoàn tiền");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const normalize = (v = "") =>
    String(v)
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "")
      .toLowerCase()
      .trim();

  const filtered = useMemo(() => {
    const q = normalize(searchText);
    return requests.filter((r) => {
      if (!q) return true;
      const name = normalize(r?.account?.fullName || "");
      const email = normalize(r?.account?.email || "");
      const msg = normalize(r?.message || "");
      return (
        name.includes(q) ||
        email.includes(q) ||
        msg.includes(q) ||
        String(r?.id || "").includes(q)
      );
    });
  }, [requests, searchText]);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, currentPage, pageSize]);

  const markProcessed = async (record) => {
    const id = record.id;
    setProcessingIds((prev) => new Set(prev).add(id));
    try {
      let parsed = {};
      if (record?.data) {
        try {
          parsed = JSON.parse(record.data);
        } catch {
          parsed = {};
        }
      }
      const walletId = parsed?.walletId;
      const balance = parsed?.balance || 0;
      const accountId = record?.accountId ?? record?.account?.id;
      if (!walletId) throw new Error("Thiếu liên kết ví trong dữ liệu yêu cầu");

      await requestServices.update({
        requestId: id,
        status: REQUEST_STATUS.PROCESSED,
      });

      await walletServices.update({ walletId, balance: 0 });

      await accountWalletHistoriesServices.create({
        accountId,
        description: `Ví của bạn bị trừ ${balance} VNĐ vì Admin đã chuyển tiền vào tài khoản ngân hàng của bạn`,
        amount: balance,
        type: HISTORY_TYPE.REFUND,
      });

      // ✅ Cập nhật ngay selectedReq để modal đổi UI tức thì
      setSelectedReq((prev) =>
        prev && (prev.id === id || prev.requestId === id)
          ? {
              ...prev,
              status: REQUEST_STATUS.PROCESSED,
              updatedAt: new Date().toISOString(),
            }
          : prev
      );

      // (tuỳ chọn) đồng bộ lại list ngoài
      fetchRequests();

      toast.success("Đã xử lý hoàn tiền và cập nhật trạng thái");
    } catch (e) {
      const msg =
        e?.response?.data?.detail ||
        e?.response?.data?.message ||
        e?.message ||
        "Cập nhật trạng thái thất bại";
      toast.error(msg);
    } finally {
      setProcessingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  const handleDelete = async (id) => {
    setDeletingIds((prev) => new Set(prev).add(id));
    try {
      await requestServices.delete({ id });
      toast.success("Xóa yêu cầu thành công");
      fetchRequests();
    } catch (e) {
      toast.error("Xóa yêu cầu thất bại");
    } finally {
      setDeletingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  const statusTag = (status) => {
    const map = {
      [REQUEST_STATUS.PENDING]: {
        color: "gold",
        text: REQUEST_STATUS_LABEL[REQUEST_STATUS.PENDING],
      },
      [REQUEST_STATUS.PROCESSED]: {
        color: "green",
        text: REQUEST_STATUS_LABEL[REQUEST_STATUS.PROCESSED],
      },
    };
    const s = map[status] || { color: "default", text: status };
    return <Tag color={s.color}>{s.text}</Tag>;
  };

  const typeTag = (type) => {
    const map = {
      [REQUEST_TYPE.REFUND]: {
        color: "blue",
        text: REQUEST_TYPE_LABEL[REQUEST_TYPE.REFUND],
      },
    };
    const t = map[type] || { color: "default", text: type };
    return <Tag color={t.color}>{t.text}</Tag>;
  };

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 80,
      sorter: (a, b) => a.id - b.id,
    },
    {
      title: "Người yêu cầu",
      key: "account",
      render: (_, record) => {
        const acc = record.account || {};
        return (
          <div className="flex items-center gap-2">
            <Avatar src={acc.avatarUrl} alt={acc.fullName}>
              {(acc.fullName || "U").charAt(0)}
            </Avatar>
            <div className="flex flex-col">
              <span className="font-medium">{acc.fullName || "Không rõ"}</span>
              <span className="text-gray-500 text-xs">{acc.email || ""}</span>
            </div>
          </div>
        );
      },
    },
    {
      title: "Loại",
      dataIndex: "type",
      key: "type",
      render: (t) => typeTag(t),
      filters: [
        {
          text: REQUEST_TYPE_LABEL[REQUEST_TYPE.REFUND],
          value: REQUEST_TYPE.REFUND,
        },
      ],
      onFilter: (value, record) => record.type === value,
      width: 120,
    },
    {
      title: "Thông điệp",
      dataIndex: "message",
      key: "message",
      ellipsis: true,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (s) => statusTag(s),
      filters: [
        {
          text: REQUEST_STATUS_LABEL[REQUEST_STATUS.PENDING],
          value: REQUEST_STATUS.PENDING,
        },
        {
          text: REQUEST_STATUS_LABEL[REQUEST_STATUS.PROCESSED],
          value: REQUEST_STATUS.PROCESSED,
        },
      ],
      onFilter: (value, record) => record.status === value,
      width: 160,
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (d) => convertToVietnamTimeWithFormat(d),
      sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
      width: 180,
    },
    {
      title: "Cập nhật",
      dataIndex: "updatedAt",
      key: "updatedAt",
      render: (d) => convertToVietnamTimeWithFormat(d),
      sorter: (a, b) => new Date(a.updatedAt) - new Date(b.updatedAt),
      width: 180,
    },
    {
      title: "Hành động",
      key: "actions",
      width: 120,
      render: (_, record) => {
        const isProc = processingIds.has(record.id);
        const isDel = deletingIds.has(record.id);

        const items = [
          {
            key: "view",
            label: (
              <span>
                <EyeOutlined /> Xem chi tiết
              </span>
            ),
            onClick: () => {
              setSelectedReq(record);
              setDetailOpen(true);
            },
          },
          ...(record.status === REQUEST_STATUS.PENDING
            ? [
                {
                  key: "process",
                  label: (
                    <span>
                      <CheckCircleOutlined /> Đánh dấu đã xử lý
                    </span>
                  ),
                  onClick: () => markProcessed(record),
                },
              ]
            : []),
          {
            key: "delete",
            danger: true,
            label: (
              <Popconfirm
                title="Xóa yêu cầu"
                description="Bạn có chắc chắn muốn xóa yêu cầu này?"
                okText="Xóa"
                cancelText="Hủy"
                okButtonProps={{ danger: true, loading: isDel }}
                onConfirm={() => handleDelete(record.id)}
                onClick={(e) => e.stopPropagation()}
              >
                <span>
                  <DeleteOutlined /> Xóa
                </span>
              </Popconfirm>
            ),
          },
        ];

        return (
          <Dropdown
            trigger={["click"]}
            placement="bottomRight"
            menu={{
              items: items.map((it) => ({
                ...it,
                disabled:
                  (it.key === "process" && isProc) ||
                  (it.key === "delete" && isDel),
              })),
            }}
          >
            <Button
              type="text"
              icon={<MoreOutlined />}
              loading={isProc || isDel}
            />
          </Dropdown>
        );
      },
    },
  ];

  const handlePageChange = (page, size) => {
    setCurrentPage(page);
    setPageSize(size);
  };

  const parsedData = (() => {
    if (!selectedReq?.data) return {};
    try {
      return JSON.parse(selectedReq.data);
    } catch {
      return {};
    }
  })();

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Quản lý yêu cầu hoàn tiền
          </h1>
          <p className="text-gray-600">
            Xem, xử lý, và xóa các yêu cầu hoàn tiền của người dùng.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Search
            allowClear
            placeholder="Tìm theo tên, email, ID, nội dung..."
            prefix={<SearchOutlined />}
            onSearch={(v) => {
              setSearchText(v);
              setCurrentPage(1);
            }}
            onChange={(e) => {
              setSearchText(e.target.value);
              setCurrentPage(1);
            }}
            style={{ maxWidth: 360 }}
          />
          <Button
            icon={<ReloadOutlined />}
            onClick={fetchRequests}
            loading={loading}
          >
            Làm mới
          </Button>
        </div>
      </div>

      <Table
        rowKey="id"
        loading={loading}
        dataSource={paginatedData}
        columns={columns}
        pagination={{
          current: currentPage,
          pageSize,
          total: filtered.length,
          showSizeChanger: true,
          showQuickJumper: true,
          pageSizeOptions: ["10", "20", "50", "100"],
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} của ${total} yêu cầu`,
          onChange: handlePageChange,
          onShowSizeChange: handlePageChange,
        }}
        scroll={{ x: 900 }}
        locale={{ emptyText: "Không có yêu cầu nào" }}
      />

      <Modal
        open={detailOpen}
        title={`Chi tiết yêu cầu #${selectedReq?.id ?? ""}`}
        onCancel={() => {
          setDetailOpen(false);
          setSelectedReq(null);
        }}
        footer={[
          selectedReq?.status === REQUEST_STATUS.PENDING ? (
            <Button
              key="process"
              type="primary"
              icon={<CheckCircleOutlined />}
              onClick={() => markProcessed(selectedReq)}
              loading={processingIds.has(selectedReq?.id)}
            >
              Đánh dấu đã xử lý
            </Button>
          ) : null,
          <Button
            key="close"
            onClick={() => {
              setDetailOpen(false);
              setSelectedReq(null);
            }}
          >
            Đóng
          </Button>,
        ].filter(Boolean)}
        width={720}
      >
        <Descriptions bordered column={1} size="small">
          <Descriptions.Item label="Trạng thái">
            {statusTag(selectedReq?.status)}
          </Descriptions.Item>
          <Descriptions.Item label="Loại">
            {typeTag(selectedReq?.type)}
          </Descriptions.Item>
          <Descriptions.Item label="Thông điệp">
            {selectedReq?.message || ""}
          </Descriptions.Item>
          <Descriptions.Item label="Ngày tạo">
            {convertToVietnamTimeWithFormat(selectedReq?.createdAt)}
          </Descriptions.Item>
          <Descriptions.Item label="Cập nhật">
            {convertToVietnamTimeWithFormat(selectedReq?.updatedAt)}
          </Descriptions.Item>
          <Descriptions.Item label="Người yêu cầu">
            <div className="flex items-center gap-2">
              <Avatar src={selectedReq?.account?.avatarUrl}>
                {(selectedReq?.account?.fullName || "U").charAt(0)}
              </Avatar>
              <div className="flex flex-col">
                <span className="font-medium">
                  {selectedReq?.account?.fullName || "Không rõ"}
                </span>
                <span className="text-gray-500 text-xs">
                  {selectedReq?.account?.email || ""}
                </span>
              </div>
            </div>
          </Descriptions.Item>
          <Descriptions.Item label="Số điện thoại">
            {selectedReq?.account?.phoneNumber || ""}
          </Descriptions.Item>
          <Descriptions.Item label="Lớp">
            {selectedReq?.account?.className || ""}
          </Descriptions.Item>
        </Descriptions>

        <Divider />

        {(() => {
          const short = String(
            selectedReq?.account?.atmName || ""
          ).toUpperCase();
          const bank = banksMap[short];
          return (
            <Descriptions
              title="Thông tin chuyển khoản"
              bordered
              column={1}
              size="small"
            >
              <Descriptions.Item label="Ngân hàng">
                {bank ? (
                  <div className="flex items-center gap-2">
                    <img
                      src={bank.logo}
                      alt={bank.shortName}
                      className="w-6 h-6 object-contain"
                    />
                    <span className="font-medium">{bank.shortName}</span>
                  </div>
                ) : (
                  selectedReq?.account?.atmName || "—"
                )}
              </Descriptions.Item>
              <Descriptions.Item label="Số tài khoản">
                {selectedReq?.account?.accountBankNumber || "—"}
              </Descriptions.Item>
            </Descriptions>
          );
        })()}
      </Modal>
    </div>
  );
};

export default RefundManagement;
