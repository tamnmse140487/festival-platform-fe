import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { ArrowLeft, Save } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import { festivalServices } from '../../services/festivalServices';
import { uploadService } from '../../services/uploadServices';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import EditBasicInfoForm from '../../components/festivals/edit/EditBasicInfoForm';
import EditDateTimeForm from '../../components/festivals/edit/EditDateTimeForm';
import EditBoothConfigForm from '../../components/festivals/edit/EditBoothConfigForm';
import EditImageForm from '../../components/festivals/edit/EditImageForm';
import EditMapForm from '../../components/festivals/edit/EditMapForm';
import EditMenuForm from '../../components/festivals/edit/EditMenuForm';
import { convertToVietnamTimeWithFormat } from '../../utils/formatters';

const EditFestivalPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [selectedImages, setSelectedImages] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [selectedMapImage, setSelectedMapImage] = useState(null);
  const [previewMapImage, setPreviewMapImage] = useState(null);
  const [mapLocations, setMapLocations] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [festivalData, setFestivalData] = useState(null);

  const { register, handleSubmit, watch, formState: { errors }, reset } = useForm();

  useEffect(() => {
    loadFestivalData();
  }, [id]);

  const loadFestivalData = async () => {
    try {
      setDataLoading(true);
      const response = await festivalServices.getDetailFestival(parseInt(id));
      const festival = response.data;

      setFestivalData(festival);

      const formData = {
        festivalName: festival.festivalName,
        theme: festival.theme,
        description: festival.description,
        location: festival.location,
        startDate: convertToVietnamTimeWithFormat(festival.startDate),
        endDate: convertToVietnamTimeWithFormat(festival.endDate),
        registrationStartDate: convertToVietnamTimeWithFormat(festival.registrationStartDate),
        registrationEndDate: convertToVietnamTimeWithFormat(festival.registrationEndDate),
        maxFoodBooths: festival.maxFoodBooths,
        maxBeverageBooths: festival.maxBeverageBooths
      };

      if (festival.images) {
        setExistingImages(festival.images);
      }

      if (festival.festivalMaps && festival.festivalMaps.length > 0) {
        const map = festival.festivalMaps[0];
        setPreviewMapImage(map.mapUrl);
        formData.mapName = map.mapName;
        formData.mapType = map.mapType;

        if (map.locations) {
          setMapLocations(map.locations.map(location => ({
            id: location.locationId,
            locationName: location.locationName,
            locationType: location.locationType,
            coordinates: location.coordinates,
            isOccupied: location.isOccupied
          })));
        } else {
          setMapLocations([{
            locationName: '',
            locationType: 'booth',
            coordinates: '',
            isOccupied: false
          }]);
        }
      } else {
        setMapLocations([{
          locationName: '',
          locationType: 'booth',
          coordinates: '',
          isOccupied: false
        }]);
      }

      if (festival.festivalMenus && festival.festivalMenus.length > 0) {
        const menu = festival.festivalMenus[0];
        formData.menuName = menu.menuName;
        formData.menuDescription = menu.description;

        if (menu.menuItems) {
          setMenuItems(menu.menuItems.map(item => ({
            id: item.itemId,
            itemName: item.itemName,
            description: item.description,
            itemType: item.itemType,
            minPrice: item.minPrice,
            maxPrice: item.maxPrice
          })));
        } else {
          setMenuItems([{
            itemName: '',
            description: '',
            itemType: 'food',
            minPrice: 0,
            maxPrice: 0
          }]);
        }
      } else {
        setMenuItems([{
          itemName: '',
          description: '',
          itemType: 'food',
          minPrice: 0,
          maxPrice: 0
        }]);
      }

      reset(formData);

    } catch (error) {
      console.error('Error loading festival data:', error);
      toast.error(error?.response?.data?.detail || 'Không thể tải thông tin lễ hội');
      // navigate('/app/festivals');
    } finally {
      setDataLoading(false);
    }
  };

  const onSubmit = async (data) => {
    setIsLoading(true);

    try {
      let mapImageUrl = previewMapImage;
      if (selectedMapImage) {
        mapImageUrl = await uploadService.uploadImage(selectedMapImage, 'maps');
      }

      const formattedMenuItems = menuItems.map(item => ({
        ...(item.id && { itemId: item.id }),
        itemName: item.itemName,
        description: item.description,
        itemType: item.itemType,
        minPrice: parseFloat(item.minPrice) || 0,
        maxPrice: parseFloat(item.maxPrice) || 0
      }));

      const formattedMapLocations = mapLocations.map(location => ({
        ...(location.id && { locationId: location.id }),
        locationName: location.locationName,
        locationType: location.locationType,
        coordinates: location.coordinates,
        isOccupied: location.isOccupied || false
      }));

      const updateData = {
        festivalId: parseInt(id),
        organizerSchoolId: user.schoolId,
        festivalName: data.festivalName,
        theme: data.theme,
        description: data.description,
        startDate: new Date(data.startDate).toISOString(),
        endDate: new Date(data.endDate).toISOString(),
        registrationStartDate: new Date(data.registrationStartDate).toISOString(),
        registrationEndDate: new Date(data.registrationEndDate).toISOString(),
        location: data.location,
        maxFoodBooths: parseInt(data.maxFoodBooths) || 0,
        maxBeverageBooths: parseInt(data.maxBeverageBooths) || 0,
        festivalMap: {
          mapName: data.mapName,
          mapType: data.mapType,
          mapUrl: mapImageUrl,
          locations: formattedMapLocations
        },
        festivalMenu: {
          menuName: data.menuName,
          description: data.menuDescription,
          menuItems: formattedMenuItems
        },
        newImages: selectedImages.map(img => img.file)
      };

      await festivalServices.editFestival(updateData);

      toast.success('Cập nhật lễ hội thành công!');
      navigate(`/app/festivals`);
    } catch (error) {
      console.error('Error updating festival:', error);
      toast.error(error?.response?.data?.detail || 'Có lỗi xảy ra khi cập nhật lễ hội');
    } finally {
      setIsLoading(false);
    }
  };

  if (dataLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!festivalData) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900">Không tìm thấy lễ hội</h2>
        <Button onClick={() => navigate('/app/festivals')} className="mt-4">
          Quay lại danh sách
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          onClick={() => navigate('/app/festivals')}
          icon={<ArrowLeft size={20} />}
        >
          Quay lại
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Chỉnh sửa lễ hội</h1>
          <p className="text-gray-600 mt-1">Cập nhật thông tin lễ hội "{festivalData.festivalName}"</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <EditBasicInfoForm register={register} errors={errors} />

            <EditDateTimeForm register={register} errors={errors} watch={watch} />

            <EditBoothConfigForm register={register} errors={errors} watch={watch} />

            <EditImageForm
              existingImages={existingImages}
              selectedImages={selectedImages}
              setSelectedImages={setSelectedImages}
              setExistingImages={setExistingImages}
            />

            <EditMapForm
              register={register}
              errors={errors}
              mapLocations={mapLocations}
              setMapLocations={setMapLocations}
              previewMapImage={previewMapImage}
              setPreviewMapImage={setPreviewMapImage}
              selectedMapImage={selectedMapImage}
              setSelectedMapImage={setSelectedMapImage}
            />

            <EditMenuForm
              register={register}
              errors={errors}
              menuItems={menuItems}
              setMenuItems={setMenuItems}
            />
          </div>

          <div className="space-y-6">
            <Card>
              <Card.Header>
                <Card.Title>Hành động</Card.Title>
              </Card.Header>

              <Card.Content>
                <div className="space-y-3">
                  <Button
                    type="submit"
                    fullWidth
                    loading={isLoading}
                    icon={<Save size={20} />}
                  >
                    Cập nhật lễ hội
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    fullWidth
                    onClick={() => navigate(`/app/festivals`)}
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
  );
};

export default EditFestivalPage;