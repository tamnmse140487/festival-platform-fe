import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { ArrowLeft, Save } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import { festivalServices } from '../../services/festivalServices';
import { festivalMapServices } from '../../services/festivalMapServices';
import { mapLocationServices } from '../../services/mapLocationServices';
import { festivalMenuServices } from '../../services/festivalMenuServices';
import { menuItemServices } from '../../services/menuItemServices';
import { uploadService } from '../../services/uploadServices'; 
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import BasicInfoForm from '../../components/festivals/BasicInfoForm';
import DateTimeForm from '../../components/festivals/DateTimeForm'; 
import BoothConfigForm from '../../components/festivals/BoothConfigForm';
import ImageUploadForm from '../../components/festivals/ImageUploadForm';
import MapConfigForm from '../../components/festivals/MapConfigForm';
import MenuConfigForm from '../../components/festivals/MenuConfigForm'; 

const EditFestivalPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [mapLocations, setMapLocations] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [festivalData, setFestivalData] = useState(null);
  const [festivalMap, setFestivalMap] = useState(null);
  const [festivalMenu, setFestivalMenu] = useState(null);

  const { register, handleSubmit, watch, formState: { errors }, reset } = useForm();

  useEffect(() => {
    loadFestivalData();
  }, [id]);

  const loadFestivalData = async () => {
    try {
      setDataLoading(true);
      
      const [
        festivalResponse,
        mapResponse,
        menuResponse
      ] = await Promise.all([
        festivalServices.get({ id: parseInt(id) }),
        festivalMapServices.get({ festivalId: parseInt(id) }),
        festivalMenuServices.get({ festivalId: parseInt(id) })
      ]);

      if (festivalResponse.data && festivalResponse.data.length > 0) {
        const festival = festivalResponse.data[0];
        setFestivalData(festival);
        setPreviewImage(festival.imageUrl);
        
        const formatDateForInput = (dateString) => {
          const date = new Date(dateString);
          return date.toISOString().slice(0, 16);
        };

        reset({
          festivalName: festival.festivalName,
          theme: festival.theme,
          description: festival.description,
          location: festival.location,
          startDate: formatDateForInput(festival.startDate),
          endDate: formatDateForInput(festival.endDate),
          registrationStartDate: formatDateForInput(festival.registrationStartDate),
          registrationEndDate: formatDateForInput(festival.registrationEndDate),
          maxFoodBooths: festival.maxFoodBooths,
          maxBeverageBooths: festival.maxBeverageBooths
        });
      }

      if (mapResponse.data && mapResponse.data.length > 0) {
        const map = mapResponse.data[0];
        setFestivalMap(map);
        
        reset(prev => ({
          ...prev,
          mapName: map.mapName,
          mapType: map.mapType
        }));
        
        const locationsResponse = await mapLocationServices.get({ mapId: map.id });
        setMapLocations(locationsResponse.data || []);
      }

      if (menuResponse.data && menuResponse.data.length > 0) {
        const menu = menuResponse.data[0];
        setFestivalMenu(menu);
        
        reset(prev => ({
          ...prev,
          menuName: menu.menuName,
          menuDescription: menu.description
        }));
        
        const itemsResponse = await menuItemServices.get({ menuId: menu.id });
        setMenuItems(itemsResponse.data || []);
      }

    } catch (error) {
      console.error('Error loading festival data:', error);
      toast.error('Không thể tải thông tin lễ hội');
      navigate('/app/festivals');
    } finally {
      setDataLoading(false);
    }
  };

  const handleImageChange = (file, preview) => {
    setSelectedImage(file);
    setPreviewImage(preview);
  };

  const onSubmit = async (data) => {
    setIsLoading(true);
    
    try {
      let imageUrl = previewImage;
      if (selectedImage) {
        imageUrl = await uploadService.uploadImage(selectedImage, 'festivals');
      }

      const festivalUpdateData = {
        id: parseInt(id),
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
        imageUrl: imageUrl
      };

      await festivalServices.update(festivalUpdateData);

      if (festivalMap) {
        const mapUpdateData = {
          id: festivalMap.id,
          festivalId: parseInt(id),
          mapName: data.mapName,
          mapType: data.mapType,
          mapUrl: imageUrl
        };
        await festivalMapServices.update(mapUpdateData);

        for (const location of mapLocations) {
          if (location.id) {
            await mapLocationServices.update({
              id: location.id,
              mapId: festivalMap.id,
              locationName: location.locationName,
              locationType: location.locationType,
              isOccupied: location.isOccupied || false,
              coordinates: location.coordinates
            });
          } else if (location.locationName.trim()) {
            await mapLocationServices.create({
              mapId: festivalMap.id,
              locationName: location.locationName,
              locationType: location.locationType,
              isOccupied: false,
              coordinates: location.coordinates
            });
          }
        }
      }

      if (festivalMenu) {
        const menuUpdateData = {
          id: festivalMenu.id,
          festivalId: parseInt(id),
          menuName: data.menuName,
          description: data.menuDescription
        };
        await festivalMenuServices.update(menuUpdateData);

        for (const item of menuItems) {
          if (item.id) {
            await menuItemServices.update({
              id: item.id,
              menuId: festivalMenu.id,
              itemName: item.itemName,
              description: item.description,
              itemType: item.itemType,
              basePrice: parseFloat(item.basePrice) || 0
            });
          } else if (item.itemName.trim()) {
            await menuItemServices.create({
              menuId: festivalMenu.id,
              itemName: item.itemName,
              description: item.description,
              itemType: item.itemType,
              basePrice: parseFloat(item.basePrice) || 0
            });
          }
        }
      }

      toast.success('Cập nhật lễ hội thành công!');
      navigate(`/app/festivals/${id}`);
    } catch (error) {
      console.error('Error updating festival:', error);
      toast.error('Có lỗi xảy ra khi cập nhật lễ hội');
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
          onClick={() => navigate(`/app/festivals/${id}`)}
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
            <BasicInfoForm register={register} errors={errors} />
            <DateTimeForm register={register} errors={errors} />
            <BoothConfigForm register={register} errors={errors} watch={watch} />
            {festivalMap && (
              <MapConfigForm 
                register={register} 
                errors={errors} 
                mapLocations={mapLocations}
                setMapLocations={setMapLocations}
              />
            )}
            {festivalMenu && (
              <MenuConfigForm 
                register={register} 
                errors={errors} 
                menuItems={menuItems}
                setMenuItems={setMenuItems}
              />
            )}
          </div>

          <div className="space-y-6">
            <ImageUploadForm 
              previewImage={previewImage}
              onImageChange={handleImageChange}
            />

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
                    onClick={() => navigate(`/app/festivals/${id}`)}
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