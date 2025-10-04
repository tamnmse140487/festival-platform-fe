import React, { useEffect, useMemo, useRef, useState } from "react";
import {
    Modal,
    Form,
    Input,
    Select,
    Button as AntButton,
    Upload,
    Divider,
    Typography,
    Space,
    Tag,
    InputNumber,
    message,
    Popconfirm,
} from "antd";
import { UploadOutlined, DeleteOutlined } from "@ant-design/icons";
import { MapPin, Plus } from "lucide-react";
import { mapLocationServices } from "../../../services/mapLocationServices";
import { festivalServices } from "../../../services/festivalServices";
import { boothServices } from "../../../services/boothServices";
import { boothMenuItemServices } from "../../../services/boothMenuItemServices";
import { uploadService } from "../../../services/uploadServices";
import { imageServices } from "../../../services/imageServices";
import { menuItemServices } from "../../../services/menuItemServices";
import { festivalMapServices } from "../../../services/festivalMapServices";
import toast from "react-hot-toast";
import { BOOTH_STATUS } from "../../../utils/constants";

const { TextArea } = Input;
const { Title, Text } = Typography;

export default function BoothEditModal({
    open,
    onClose,
    onUpdated,
    booth,
    festivalId,
    mapId,
}) {
    const [form] = Form.useForm();
    const initialExistingRef = useRef([]);
    const [submitting, setSubmitting] = useState(false);
    const [mapUrl, setMapUrl] = useState(null);

    const [pickLocationOpen, setPickLocationOpen] = useState(false);
    const [locations, setLocations] = useState([]);
    const [selectedLocation, setSelectedLocation] = useState(null);

    const [pickMenuOpen, setPickMenuOpen] = useState(false);
    const [festivalMenuItems, setFestivalMenuItems] = useState([]);
    const [selectedNewItems, setSelectedNewItems] = useState([]);
    const [newItemPrices, setNewItemPrices] = useState({});
    const [newItemQuantities, setNewItemQuantities] = useState({});
    const [newItemImages, setNewItemImages] = useState({});
    const [removedExistingIds, setRemovedExistingIds] = useState(new Set());

    const [existingItems, setExistingItems] = useState([]);

    useEffect(() => {
        if (!open || !booth) return;

        form.setFieldsValue({
            boothName: booth?.boothName || "",
            boothType: booth?.boothType || "",
            description: booth?.description || "",
        });
        setSelectedLocation(booth?.location || null);
        setRemovedExistingIds(new Set());
        setSelectedNewItems([]);
        setNewItemPrices({});
        setNewItemQuantities({});
        setNewItemImages({});

        const rawExisting =
            (booth?.boothMenuItems || []).map((it) => ({
                boothMenuItemId: it.boothMenuItemId,
                customPrice: it.customPrice,
                quantityLimit: it.quantityLimit,
                status: it.status,
                imageUrl: it.imageUrl || it?.image?.imageUrl || null,
                menuItemId: it.menuItemId,
                itemName: it.itemName,
                description: it.description,
                itemType: it.itemType,
            })) || [];

        (async () => {
            const enriched = await Promise.all(
                rawExisting.map(async (x) => {
                    let imageUrl = x.imageUrl;
                    if (!imageUrl && x.boothMenuItemId) {
                        try {
                            const imgRes = await imageServices.get({
                                boothMenuItemId: x.boothMenuItemId,
                            });
                            const img = Array.isArray(imgRes?.data)
                                ? imgRes.data.find(
                                    (im) => im.boothMenuItemId === x.boothMenuItemId
                                )
                                : null;
                            if (img?.imageUrl) imageUrl = img.imageUrl;
                        } catch { }
                    }

                    let itemName = x.itemName;
                    let description = x.description;
                    let itemType = x.itemType;

                    if ((!itemName || !itemType) && x.menuItemId) {
                        try {
                            const metaRes = await menuItemServices.get({
                                itemId: x.menuItemId,
                            });
                            const meta = metaRes?.data?.[0] || null;
                            if (meta) {
                                itemName = meta.itemName ?? itemName;
                                description = meta.description ?? description;
                                itemType = meta.itemType ?? itemType;
                            }
                        } catch { }
                    }

                    return {
                        ...x,
                        imageUrl,
                        itemName,
                        description,
                        itemType,
                    };
                })
            );

            setExistingItems(enriched);

            initialExistingRef.current = enriched.map((e) => ({
                boothMenuItemId: e.boothMenuItemId,
                customPrice: e.customPrice,
                quantityLimit: e.quantityLimit,
            }));
        })();
    }, [open, booth, form]);

    const alreadyHadMenuItemIds = useMemo(
        () => new Set((booth?.boothMenuItems || []).map((x) => Number(x.menuItemId))),
        [booth?.boothMenuItems]
    );

    const openPickLocation = async () => {
        const [mapResp, locResp] = await Promise.all([
            festivalId ? festivalMapServices.get({ festivalId }) : Promise.resolve(null),
            mapId ? mapLocationServices.get({ mapId }) : Promise.resolve(null),
        ]);
        setMapUrl(mapResp?.data?.[0]?.mapUrl || null);
        setLocations(Array.isArray(locResp?.data) ? locResp.data : []);
        setPickLocationOpen(true);
    };

    const loadFestivalMenuItems = async () => {
        if (!festivalId) return;
        const resp = await festivalServices.get({ festivalId });
        const fm = resp?.data?.[0]?.festivalMenus || [];
        const allItems = fm.flatMap((m) => m.menuItems || []).filter(Boolean) || [];
        const filtered = allItems.filter(
            (mi) => !alreadyHadMenuItemIds.has(Number(mi.itemId))
        );
        setFestivalMenuItems(filtered);
    };

    const handleSelectNewItems = (ids) => {
        setSelectedNewItems(ids);
        setNewItemPrices((prev) => {
            const next = { ...prev };
            ids.forEach((id) => {
                if (next[id] == null) next[id] = undefined;
            });
            return next;
        });
        setNewItemQuantities((prev) => {
            const next = { ...prev };
            ids.forEach((id) => {
                if (next[id] == null) next[id] = undefined;
            });
            return next;
        });
    };

    const removeNewItem = (itemId) => {
        setSelectedNewItems((prev) => prev.filter((id) => id !== itemId));
        setNewItemPrices((prev) => {
            const n = { ...prev };
            delete n[itemId];
            return n;
        });
        setNewItemQuantities((prev) => {
            const n = { ...prev };
            delete n[itemId];
            return n;
        });
        setNewItemImages((prev) => {
            const n = { ...prev };
            delete n[itemId];
            return n;
        });
    };

    const toggleRemoveExisting = (boothMenuItemId) => {
        setRemovedExistingIds((prev) => {
            const n = new Set(prev);
            if (n.has(boothMenuItemId)) n.delete(boothMenuItemId);
            else n.add(boothMenuItemId);
            return n;
        });
    };

    const onSubmit = async () => {
        try {
            const values = await form.validateFields();
            if (!selectedLocation) {
                toast.error("Vui lòng chọn vị trí gian hàng");
                return;
            }

            setSubmitting(true);

            const boothId = booth?.boothId;

            if (removedExistingIds.size > 0) {
                const delPromises = existingItems
                    .filter((it) => removedExistingIds.has(it.boothMenuItemId))
                    .map((it) => boothMenuItemServices.delete({ id: it.boothMenuItemId }).catch(() => { }));
                await Promise.all(delPromises);
            }

            const changedExisting = existingItems
                .filter((it) => !removedExistingIds.has(it.boothMenuItemId))
                .filter((it) => {
                    const snap = initialExistingRef.current.find(s => s.boothMenuItemId === it.boothMenuItemId);
                    if (!snap) return false;
                    return Number(snap.customPrice) !== Number(it.customPrice)
                        || Number(snap.quantityLimit) !== Number(it.quantityLimit);
                });

            if (changedExisting.length > 0) {
                const updPromises = changedExisting.map((it) =>
                    boothMenuItemServices.update({
                        id: it.boothMenuItemId,
                        customPrice: it.customPrice,
                        quantityLimit: it.quantityLimit,
                    }).catch(() => { })
                );
                await Promise.all(updPromises);
            }

            const keptNewItemIds = selectedNewItems.filter(
                (id) => newItemPrices[id] != null && newItemQuantities[id] != null
            );

            let createdNewItems = [];
            if (keptNewItemIds.length > 0) {
                const createPromises = keptNewItemIds.map((menuItemId) =>
                    boothMenuItemServices.create({
                        boothId,
                        menuItemId,
                        quantityLimit: newItemQuantities[menuItemId],
                        customPrice: newItemPrices[menuItemId],
                    })
                );
                const createResponses = await Promise.all(createPromises);

                const uploadPromises = createResponses.map(async (res, idx) => {
                    const menuItemId = keptNewItemIds[idx];
                    const fileList = newItemImages[menuItemId];
                    let uploadedUrl = null;

                    if (fileList && fileList.length > 0) {
                        const file = fileList[0].originFileObj || fileList[0];
                        const boothMenuItemId = res?.data?.boothMenuItemId;
                        try {
                            await uploadService.uploadBoothMenuItemImage(file, boothMenuItemId);
                        } catch { }
                    }

                    createdNewItems.push({
                        boothMenuItemId: res?.data?.boothMenuItemId,
                        menuItemId,
                        customPrice: newItemPrices[menuItemId],
                        quantityLimit: newItemQuantities[menuItemId],
                        status: "active",
                        imageUrl: uploadedUrl,
                    });
                });

                await Promise.all(uploadPromises);
            }

            let updatedBoothResp = null;
            try {
                updatedBoothResp = await boothServices.updateBooth(
                    { boothId: boothId },
                    {
                        boothName: values.boothName,
                        boothType: values.boothType,
                        description: values.description,
                        location: {
                            locationId: selectedLocation.locationId,
                        },
                        status: BOOTH_STATUS.PENDING
                    }
                );

            } catch { }

            const keptExistingForUI = existingItems
                .filter((it) => !removedExistingIds.has(it.boothMenuItemId))
                .map((it) => ({
                    boothMenuItemId: it.boothMenuItemId,
                    customPrice: it.customPrice,
                    quantityLimit: it.quantityLimit,
                    status: it.status,
                    imageUrl: it.imageUrl || null,
                    menuItemId: it.menuItemId,
                    itemName: it.itemName,
                    description: it.description,
                    itemType: it.itemType,
                }));

            const createdForUI = createdNewItems.map((it) => ({
                boothMenuItemId: it.boothMenuItemId,
                customPrice: it.customPrice,
                quantityLimit: it.quantityLimit,
                status: it.status,
                imageUrl: it.imageUrl || null,
                menuItemId: it.menuItemId,
            }));

            const apiBooth = updatedBoothResp?.data?.data || {};

            const partial = {
                boothName: apiBooth.boothName ?? values.boothName,
                boothType: apiBooth.boothType ?? values.boothType,
                description: apiBooth.description ?? values.description,
                location: apiBooth.location ?? {
                    locationId: selectedLocation.locationId,
                    locationName: selectedLocation.locationName,
                    locationType: selectedLocation.locationType,
                    coordinates: selectedLocation.coordinates,
                },
                boothMenuItems: [
                    ...keptExistingForUI,
                    ...createdForUI,
                ],
            };

            toast.success("Cập nhật gian hàng thành công");
            onUpdated(apiBooth);
        } catch (err) {
            toast.error(err?.response?.data?.detail || err?.response?.data?.message);
            toast.error("Không thể cập nhật gian hàng");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Modal
            open={open}
            onCancel={onClose}
            title="Chỉnh sửa gian hàng"
            width={1200}
            footer={
                <Space>
                    <AntButton onClick={onClose}>Hủy</AntButton>
                    <AntButton type="primary" loading={submitting} onClick={onSubmit}>
                        Cập nhật
                    </AntButton>
                </Space>
            }
            destroyOnClose
            maskClosable={false}
            style={{ top: 10 }}
        >
            <Form layout="vertical" form={form}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <Form.Item
                            label="Tên gian hàng"
                            name="boothName"
                            rules={[{ required: true, message: "Vui lòng nhập tên gian hàng" }]}
                        >
                            <Input placeholder="Nhập tên gian hàng" />
                        </Form.Item>

                        <Form.Item
                            label="Loại gian hàng"
                            name="boothType"
                            rules={[{ required: true, message: "Vui lòng chọn loại gian hàng" }]}
                        >
                            <Select
                                options={[
                                    { value: "food", label: "Đồ ăn" },
                                    { value: "beverage", label: "Đồ uống" },
                                ]}
                                placeholder="Chọn loại"
                            />
                        </Form.Item>

                        <Form.Item label="Mô tả" name="description">
                            <TextArea placeholder="Mô tả gian hàng" rows={6} />
                        </Form.Item>

                        <div className="rounded-md border border-gray-200 p-4">
                            <div className="flex items-center justify-between">
                                <Title level={5} style={{ margin: 0 }}>
                                    Vị trí gian hàng
                                </Title>
                                <AntButton onClick={openPickLocation}>Chọn vị trí mới</AntButton>

                            </div>

                            <div className="mt-3 text-center">
                                {selectedLocation ? (
                                    <Space direction="vertical" align="center">
                                        <MapPin />
                                        <Text strong>
                                            {selectedLocation.locationName}-{selectedLocation.coordinates}
                                        </Text>
                                        <Text type="secondary">
                                            {selectedLocation.locationType === "booth"
                                                ? "Gian hàng"
                                                : selectedLocation.locationType}
                                        </Text>
                                    </Space>
                                ) : (
                                    <Text type="secondary">Chưa chọn vị trí</Text>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">

                        <div className="rounded-md border border-gray-200 p-4">
                            <div className="flex items-center justify-between">
                                <Title level={5} style={{ margin: 0 }}>
                                    Menu gian hàng
                                </Title>
                                <AntButton
                                    icon={<Plus size={16} />}
                                    onClick={async () => {
                                        await loadFestivalMenuItems();
                                        setPickMenuOpen(true);
                                    }}
                                >
                                    Chọn món mới
                                </AntButton>
                            </div>

                            <div className="mt-4 space-y-4">
                                {existingItems.length === 0 ? (
                                    <Text type="secondary">Chưa có món nào.</Text>
                                ) : (
                                    existingItems.map((it) => {
                                        const isRemoved = removedExistingIds.has(it.boothMenuItemId);
                                        return (
                                            <div
                                                key={it.boothMenuItemId}
                                                className={`border rounded-md p-4 grid grid-cols-1 md:grid-cols-2 gap-6 items-start ${isRemoved ? "opacity-60" : ""
                                                    }`}
                                            >
                                                <div className="space-y-2">
                                                    <div className="flex items-center gap-2">
                                                        <Text strong>#ID: {it.boothMenuItemId}</Text>
                                                        {it.itemName ? <Tag color="blue">{it.itemName}</Tag> : null}
                                                    </div>
                                                    {it.description ? (
                                                        <p className="text-sm text-gray-600">{it.description}</p>
                                                    ) : null}
                                                    {it.imageUrl ? (
                                                        <img
                                                            src={it.imageUrl}
                                                            alt={it.itemName || "menu-item"}
                                                            className="w-full h-32 object-cover rounded-md border"
                                                        />
                                                    ) : null}
                                                </div>

                                                <div className="space-y-3">
                                                    <div>
                                                        <Text type="secondary">Giá bán</Text>
                                                        <InputNumber
                                                            min={0}
                                                            value={it.customPrice}
                                                            disabled={isRemoved}
                                                            style={{ width: "100%" }}
                                                            onChange={(v) =>
                                                                setExistingItems((prev) =>
                                                                    prev.map((x) =>
                                                                        x.boothMenuItemId === it.boothMenuItemId
                                                                            ? { ...x, customPrice: Number(v || 0) }
                                                                            : x
                                                                    )
                                                                )
                                                            }
                                                            formatter={(v) =>
                                                                `${Number(v || 0).toLocaleString()} đ`
                                                            }
                                                            parser={(v) =>
                                                                String(v || "").replace(/[^\d]/g, "")
                                                            }
                                                        />
                                                    </div>

                                                    <div>
                                                        <Text type="secondary">Giới hạn SL</Text>
                                                        <InputNumber
                                                            min={0}
                                                            value={it.quantityLimit}
                                                            disabled={isRemoved}
                                                            style={{ width: "100%" }}
                                                            onChange={(v) =>
                                                                setExistingItems((prev) =>
                                                                    prev.map((x) =>
                                                                        x.boothMenuItemId === it.boothMenuItemId
                                                                            ? { ...x, quantityLimit: Number(v || 0) }
                                                                            : x
                                                                    )
                                                                )
                                                            }
                                                        />
                                                    </div>

                                                    <div className="text-right">
                                                        <Popconfirm
                                                            title={
                                                                isRemoved
                                                                    ? "Hoàn tác bỏ món này?"
                                                                    : "Bỏ món này khỏi gian hàng?"
                                                            }
                                                            onConfirm={() =>
                                                                toggleRemoveExisting(it.boothMenuItemId)
                                                            }
                                                            okText="Xác nhận"
                                                            cancelText="Hủy"
                                                        >
                                                            <AntButton
                                                                icon={<DeleteOutlined />}
                                                                danger={!isRemoved}
                                                                type={isRemoved ? "default" : "dashed"}
                                                            >
                                                                {isRemoved ? "Hoàn tác" : "Bỏ món"}
                                                            </AntButton>
                                                        </Popconfirm>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>

                            {selectedNewItems.length > 0 && (
                                <>
                                    <Divider />
                                    <Title level={5} style={{ margin: 0 }}>
                                        Món mới chọn thêm
                                    </Title>
                                    <div className="mt-4 space-y-4">
                                        {selectedNewItems.map((id) => {
                                            const meta = festivalMenuItems.find((m) => m.itemId === id);
                                            return (
                                                <div
                                                    key={id}
                                                    className="border rounded-md p-4 grid grid-cols-1 md:grid-cols-2 gap-6 items-start"
                                                >
                                                    <div className="space-y-2">
                                                        <div className="flex items-center gap-2">
                                                            <Tag color="green">Mới</Tag>
                                                            <Text strong>
                                                                {meta?.itemName} • {meta?.itemType}
                                                            </Text>
                                                        </div>
                                                        {meta?.description ? (
                                                            <p className="text-sm text-gray-600">
                                                                {meta.description}
                                                            </p>
                                                        ) : null}
                                                        <Upload
                                                            beforeUpload={() => false}
                                                            fileList={newItemImages[id] || []}
                                                            onChange={({ fileList }) =>
                                                                setNewItemImages((prev) => ({
                                                                    ...prev,
                                                                    [id]: fileList,
                                                                }))
                                                            }
                                                            maxCount={1}
                                                            listType="picture"
                                                        >
                                                            <AntButton icon={<UploadOutlined />}>
                                                                Tải ảnh
                                                            </AntButton>
                                                        </Upload>
                                                    </div>

                                                    <div className="space-y-3">
                                                        <div>
                                                            <Text type="secondary">Giá bán</Text>
                                                            <InputNumber
                                                                min={0}
                                                                value={newItemPrices[id]}
                                                                style={{ width: "100%" }}
                                                                onChange={(v) =>
                                                                    setNewItemPrices((prev) => ({
                                                                        ...prev,
                                                                        [id]: Number(v || 0),
                                                                    }))
                                                                }
                                                                formatter={(v) =>
                                                                    `${Number(v || 0).toLocaleString()} đ`
                                                                }
                                                                parser={(v) =>
                                                                    String(v || "").replace(/[^\d]/g, "")
                                                                }
                                                            />
                                                        </div>

                                                        <div>
                                                            <Text type="secondary">Giới hạn SL</Text>
                                                            <InputNumber
                                                                min={0}
                                                                value={newItemQuantities[id]}
                                                                style={{ width: "100%" }}
                                                                onChange={(v) =>
                                                                    setNewItemQuantities((prev) => ({
                                                                        ...prev,
                                                                        [id]: Number(v || 0),
                                                                    }))
                                                                }
                                                            />
                                                        </div>

                                                        <div className="text-right">
                                                            <AntButton danger onClick={() => removeNewItem(id)}>
                                                                Bỏ món này
                                                            </AntButton>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </Form>

            <Modal
                open={pickLocationOpen}
                onCancel={() => setPickLocationOpen(false)}
                title="Chọn vị trí trên bản đồ"
                width={860}
                footer={null}
                destroyOnClose
            >
                {mapUrl && (
                    <div className="mb-4">
                        <img
                            src={mapUrl}
                            alt="Festival Map"
                            className="w-full max-h-80 object-contain rounded-md border"
                        />
                        <div className="mt-2 text-xs text-gray-500">
                            Màu sắc trạng thái: <Tag color="green">Còn trống</Tag>
                            <Tag color="red">Đã đặt</Tag>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {locations.map((loc) => {
                        const occupied = !!loc.isOccupied;
                        const isSelected =
                            selectedLocation && selectedLocation.locationId === loc.locationId;

                        return (
                            <div
                                key={loc.locationId}
                                className={`border rounded-md p-4 cursor-pointer transition ${isSelected ? "border-blue-500" : "border-gray-200"
                                    } ${occupied ? "opacity-60 cursor-not-allowed" : "hover:shadow"}`}
                                onClick={() => {
                                    if (occupied) return;
                                    setSelectedLocation(loc);
                                    setPickLocationOpen(false);
                                }}
                            >
                                <Space direction="vertical">
                                    <Text strong>
                                        {loc.locationName}-{loc.coordinates}
                                    </Text>
                                    <Tag color={occupied ? "red" : "green"}>
                                        {occupied ? "Đã đặt" : "Còn trống"}
                                    </Tag>
                                </Space>
                            </div>
                        );
                    })}
                </div>
            </Modal>


            <Modal
                open={pickMenuOpen}
                onCancel={() => setPickMenuOpen(false)}
                title="Chọn món mới từ thực đơn lễ hội"
                width={920}
                footer={
                    <Space>
                        <AntButton onClick={() => setPickMenuOpen(false)}>Đóng</AntButton>
                        <AntButton
                            type="primary"
                            onClick={() => setPickMenuOpen(false)}
                            disabled={selectedNewItems.length === 0}
                        >
                            Xác nhận
                        </AntButton>
                    </Space>
                }
                destroyOnClose
            >
                <Form layout="vertical">
                    <Form.Item label="Chọn món">
                        <Select
                            mode="multiple"
                            value={selectedNewItems}
                            onChange={(vals) => handleSelectNewItems(vals)}
                            placeholder="Chọn các món muốn thêm"
                            options={festivalMenuItems.map((mi) => ({
                                value: mi.itemId,
                                label: `${mi.itemName}`,
                            }))}
                        />
                    </Form.Item>
                </Form>
            </Modal>
        </Modal>
    );
}
