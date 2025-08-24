import React, { useEffect } from "react";
import { Map, Plus, Trash2, Upload } from "lucide-react";
import { toast } from "react-hot-toast";
import Input from "../common/Input";
import Button from "../common/Button";
import Card from "../common/Card";

const MapConfigForm = ({
  register,
  errors,
  mapLocations,
  setMapLocations,
  selectedMapImage,
  previewMapImage,
  onMapImageChange,
  totalBooths,
}) => {
  useEffect(() => {
    if (typeof totalBooths !== "number" || totalBooths < 0) return;
    setMapLocations((prev) => {
      const manual = prev.filter((loc) => !loc.auto);
      let auto = prev.filter((loc) => loc.auto);
      if (auto.length < totalBooths) {
        const toAdd = totalBooths - auto.length;
        const newAuto = Array.from({ length: toAdd }, () => ({
          locationName: "",
          locationType: "booth",
          coordinates: "",
          auto: true,
        }));
        auto = [...auto, ...newAuto];
      }
      if (auto.length > totalBooths) {
        auto = auto.slice(0, totalBooths);
      }
      return [...auto, ...manual];
    });
  }, [totalBooths, setMapLocations]);

  const addLocation = () => {
    setMapLocations([
      ...mapLocations,
      { locationName: "", locationType: "booth", coordinates: "" },
    ]);
  };

  const removeLocation = (index) => {
    if (mapLocations.length > 1) {
      setMapLocations(mapLocations.filter((_, i) => i !== index));
    }
  };

  const updateLocation = (index, field, value) => {
    const updated = mapLocations.map((location, i) =>
      i === index ? { ...location, [field]: value } : location
    );
    setMapLocations(updated);
  };

  const handleMapImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Kích thước ảnh không được vượt quá 5MB");
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => onMapImageChange(file, e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const removeMapImage = () => {
    onMapImageChange(null, null);
  };

  return (
    <Card>
      <Card.Header>
        <Card.Title>Cấu hình bản đồ</Card.Title>
        <Card.Description>
          Thiết lập bản đồ và vị trí cho lễ hội
        </Card.Description>
      </Card.Header>

      <Card.Content>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Tên bản đồ"
              required
              placeholder="Nhập tên bản đồ"
              leftIcon={<Map size={20} />}
              error={errors.mapName?.message}
              {...register("mapName", {
                required: "Tên bản đồ là bắt buộc",
              })}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Loại bản đồ <span className="text-red-500">*</span>
              </label>
              <select
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                {...register("mapType", {
                  required: "Loại bản đồ là bắt buộc",
                })}
              >
                <option value="layout">Sơ đồ bố trí</option>
                <option value="navigation">Bản đồ định hướng</option>
                <option value="overview">Tổng quan</option>
              </select>
              {errors.mapType && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.mapType.message}
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ảnh bản đồ
            </label>
            {previewMapImage ? (
              <div className="relative">
                <img
                  src={previewMapImage}
                  alt="Map Preview"
                  className="w-full h-48 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={removeMapImage}
                  className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                >
                  ×
                </button>
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <div className="mt-4">
                  <label htmlFor="map-image-upload" className="cursor-pointer">
                    <span className="text-sm font-medium text-blue-600 hover:text-blue-500">
                      Tải lên ảnh bản đồ
                    </span>
                    <input
                      id="map-image-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleMapImageChange}
                      className="hidden"
                    />
                  </label>
                  <p className="text-xs text-gray-500 mt-1">
                    PNG, JPG tối đa 5MB
                  </p>
                </div>
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-medium text-gray-900">
                Vị trí trên bản đồ
              </h4>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addLocation}
                icon={<Plus size={16} />}
              >
                Thêm vị trí
              </Button>
            </div>

            <div className="space-y-4">
              {mapLocations.map((location, index) => (
                <div
                  key={index}
                  className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border border-gray-200 rounded-lg"
                >
                  <div>
                    <input
                      type="text"
                      placeholder="Tên vị trí"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={location.locationName}
                      onChange={(e) =>
                        updateLocation(index, "locationName", e.target.value)
                      }
                    />
                  </div>

                  <div>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={location.locationType}
                      onChange={(e) =>
                        updateLocation(index, "locationType", e.target.value)
                      }
                    >
                      <option value="booth">Gian hàng</option>
                      <option value="entrance">Lối vào</option>
                      <option value="stage">Sân khấu</option>
                      <option value="restroom">Nhà vệ sinh</option>
                      <option value="parking">Bãi đỗ xe</option>
                      <option value="other">Khác</option>
                    </select>
                  </div>

                  <div>
                    <input
                      type="text"
                      placeholder="Tọa độ (x,y)"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={location.coordinates}
                      onChange={(e) =>
                        updateLocation(index, "coordinates", e.target.value)
                      }
                    />
                  </div>

                  <div className="flex justify-end">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeLocation(index)}
                      disabled={mapLocations.length === 1}
                      icon={<Trash2 size={16} />}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card.Content>
    </Card>
  );
};

export default MapConfigForm;
