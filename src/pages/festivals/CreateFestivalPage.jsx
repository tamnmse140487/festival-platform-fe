import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { ArrowLeft, Save } from "lucide-react";
import { toast } from "react-hot-toast";
import useModal from "antd/es/modal/useModal";
import { useAuth } from "../../contexts/AuthContext";
import { festivalServices } from "../../services/festivalServices";
import { festivalSchoolServices } from "../../services/festivalSchoolServices";
import { festivalMapServices } from "../../services/festivalMapServices";
import { mapLocationServices } from "../../services/mapLocationServices";
import { festivalMenuServices } from "../../services/festivalMenuServices";
import { menuItemServices } from "../../services/menuItemServices";
import { uploadService } from "../../services/uploadServices";
import Button from "../../components/common/Button";
import Card from "../../components/common/Card";
import BasicInfoForm from "../../components/festivals/BasicInfoForm";
import DateTimeForm from "../../components/festivals/DateTimeForm";
import BoothConfigForm from "../../components/festivals/BoothConfigForm";
import FestivalImageUploadForm from "../../components/festivals/FestivalImageUploadForm";
import MapConfigForm from "../../components/festivals/MapConfigForm";
import MenuConfigForm from "../../components/festivals/MenuConfigForm";
import { notificationServices } from "../../services/notificationServices";
import { NOTIFICATION_EVENT } from "../../utils/constants";

const CreateFestivalPage = () => {
  const navigate = useNavigate();
  const [modal, contextHolder] = useModal();

  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]);
  const [selectedMapImage, setSelectedMapImage] = useState(null);
  const [previewMapImage, setPreviewMapImage] = useState(null);
  const [mapLocations, setMapLocations] = useState([]);
  const [menuItems, setMenuItems] = useState([
    {
      itemName: "",
      description: "",
      itemType: "food",
      minPrice: 0,
      maxPrice: 0,
    },
  ]);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    clearErrors,
    setError,
  } = useForm({
    defaultValues: {
      festivalName: "",
      theme: "",
      description: "",
      location: "",
      startDate: "",
      endDate: "",
      registrationStartDate: "",
      registrationEndDate: "",
      maxFoodBooths: "",
      maxBeverageBooths: "",
      mapName: "",
      mapType: "layout",
      menuName: "",
      menuDescription: "",
    },
  });

  const [formErrors, setFormErrors] = useState([]);
  const [invalidMinPriceIndices, setInvalidMinPriceIndices] = useState([]);

  const totalBooths =
    (parseInt(watch("maxFoodBooths")) || 0) +
    (parseInt(watch("maxBeverageBooths")) || 0);

  const handleImageChange = (images) => {
    setSelectedImages(images);
  };

  const handleMapImageChange = (file, preview) => {
    setSelectedMapImage(file);
    setPreviewMapImage(preview);
  };

  const processCreateFestival = async (data) => {
    setIsLoading(true);

    try {
      const festivalData = {
        organizerSchoolId: user.schoolId,
        festivalName: data.festivalName,
        theme: data.theme,
        description: data.description,
        startDate: new Date(data.startDate).toISOString(),
        endDate: new Date(data.endDate).toISOString(),
        registrationStartDate: new Date(
          data.registrationStartDate
        ).toISOString(),
        registrationEndDate: new Date(data.registrationEndDate).toISOString(),
        location: data.location,
        maxFoodBooths: parseInt(data.maxFoodBooths) || 0,
        maxBeverageBooths: parseInt(data.maxBeverageBooths) || 0,
      };

      const festivalResponse = await festivalServices.create(festivalData);
      const festivalId = festivalResponse.data.festivalId;

      if (selectedImages.length > 0) {
        for (const imageFile of selectedImages) {
          await uploadService.uploadFestivalImage(imageFile.file, festivalId);
        }
      }
      await festivalSchoolServices.create({
        festivalId: festivalId,
        schoolId: user.schoolId,
      });

      let mapUrl = "";
      if (selectedMapImage) {
        mapUrl = await uploadService.uploadImage(selectedMapImage, "maps");
      }
      const mapData = {
        festivalId: festivalId,
        mapName: data.mapName,
        mapType: data.mapType,
        mapUrl: mapUrl,
      };
      const mapResponse = await festivalMapServices.create(mapData);
      const mapId = mapResponse.data.mapId;

      for (const location of mapLocations) {
        if (location.locationName.trim()) {
          await mapLocationServices.create({
            mapId: mapId,
            locationName: location.locationName,
            locationType: location.locationType,
            isOccupied: false,
            coordinates: location.coordinates,
          });
        }
      }
      const menuData = {
        festivalId: festivalId,
        menuName: data.menuName,
        description: data.menuDescription,
      };
      const menuResponse = await festivalMenuServices.create(menuData);
      const menuId = menuResponse.data.menuId;

      for (const item of menuItems) {
        if (item.itemName.trim()) {
          await menuItemServices.create({
            menuId: menuId,
            itemName: item.itemName,
            description: item.description,
            itemType: item.itemType,
            minPrice: parseFloat(item.minPrice) || 0,
            maxPrice: parseFloat(item.maxPrice) || 0,
          });
        }
      }

      try {
        await notificationServices.createByType(NOTIFICATION_EVENT.FESTIVAL_REQUESTED, {
          data: {
            festivalId,
            festivalName: festivalData.festivalName,
            schoolId: user.schoolId,
            schoolName: user.schoolName,
          },
          list_user_id: [1],
        });
      } catch (e) {
        console.warn("Send notification failed:", e?.message || e);
      }

      toast.success("Tạo lễ hội thành công!");
      navigate("/app/festivals");
    } catch (error) {
      console.error("Error creating festival:", error);
      toast.error(error?.response?.data?.detail || error?.response?.data?.message);
      toast.error("Có lỗi xảy ra khi tạo lễ hội");
    } finally {
      setIsLoading(false);
    }
  };

  const validateBusinessRules = (formData) => {
    // toast.error("Có thông tin nhập chưa đúng. Vui lòng kiểm tra lại!")
    const list = [];
    const newInvalidMin = [];

    const food = parseInt(formData.maxFoodBooths) || 0;
    const bev = parseInt(formData.maxBeverageBooths) || 0;
    const total = food + bev;

    if (total < 3) {
      list.push("Tổng số gian hàng (đồ ăn + đồ uống) phải từ 3 trở lên.");
      setError("maxFoodBooths", { type: "manual", message: "Tổng gian hàng (đồ ăn + đồ uống) phải ≥ 3" });
    }

    const namedItems = menuItems
      .map((i, idx) => ({ ...i, _idx: idx }))
      .filter(i => (i.itemName || "").trim() !== "");

    if (namedItems.length < 3) {
      list.push("Thực đơn phải có ít nhất 3 món.");
    }

    namedItems.forEach((i) => {
      const min = parseInt(i.minPrice) || 0;
      if (min <= 5000) newInvalidMin.push(i._idx);
    });
    if (newInvalidMin.length > 0) {
      list.push(
        `Giá tối thiểu của mỗi món phải > 5.000. Sai tại món: ${newInvalidMin
          .map(i => i + 1)
          .join(", ")}.`
      );
    }

    setInvalidMinPriceIndices(newInvalidMin);
    return list;
  };

  const onSubmit = (data) => {

    clearErrors();
    setFormErrors([]);
    setInvalidMinPriceIndices([]);

    const list = validateBusinessRules(data);
    if (list.length > 0) {
      setFormErrors(list);
      return;
    }

    modal.confirm({
      title: "Xác nhận tạo lễ hội",
      content: "Bạn có chắc chắn muốn tạo lễ hội này không?",
      okText: "Xác nhận",
      cancelText: "Hủy bỏ",
      onOk: () => processCreateFestival(data),
    });
  };

  return (
    <>
      {contextHolder}
      <div className="space-y-6">

        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            onClick={() => navigate("/app/festivals")}
            icon={<ArrowLeft size={20} />}
          >
            Quay lại
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Tạo lễ hội mới</h1>
            <p className="text-gray-600 mt-1">
              Điền thông tin để tạo lễ hội cho trường của bạn
            </p>
          </div>
        </div>

        {formErrors.length > 0 && (
          <div className="border border-red-300 bg-red-50 text-red-800 rounded-lg p-4">
            <h3 className="font-semibold mb-2">Vui lòng sửa các trường sau:</h3>
            <ul className="list-disc pl-5 space-y-1">
              {formErrors.map((msg, i) => (
                <li key={i}>{msg}</li>
              ))}
            </ul>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <BasicInfoForm register={register} errors={errors} />
              <DateTimeForm register={register} errors={errors} watch={watch} />
              <BoothConfigForm
                register={register}
                errors={errors}
                watch={watch}
              />
              <FestivalImageUploadForm
                selectedImages={selectedImages}
                onImageChange={handleImageChange}
              />

              <MapConfigForm
                register={register}
                errors={errors}
                mapLocations={mapLocations}
                setMapLocations={setMapLocations}
                selectedMapImage={selectedMapImage}
                previewMapImage={previewMapImage}
                onMapImageChange={handleMapImageChange}
                totalBooths={totalBooths}
              />
              <MenuConfigForm
                register={register}
                errors={errors}
                menuItems={menuItems}
                setMenuItems={setMenuItems}
                invalidMinPriceIndices={invalidMinPriceIndices}
              />
            </div>

            <div className="space-y-6">
              <Card>
                <Card.Header>
                  <Card.Title>Hành động</Card.Title>
                </Card.Header>

                <Card.Content>
                  <div className="space-y-3">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
                    >
                      {isLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          <span>Đang xử lý...</span>
                        </>
                      ) : (
                        <>
                          <Save size={20} />
                          <span>Tạo lễ hội</span>
                        </>
                      )}
                    </button>

                    <Button
                      type="button"
                      variant="outline"
                      fullWidth
                      onClick={() => navigate("/app/festivals")}
                      disabled={isLoading}
                    >
                      Hủy bỏ
                    </Button>
                  </div>
                </Card.Content>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </>
  );
};

export default CreateFestivalPage;
