import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { ArrowLeft, Save } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import { festivalServices } from '../../services/festivalServices';
import { festivalSchoolServices } from '../../services/festivalSchoolServices';
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

const CreateFestivalPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [mapLocations, setMapLocations] = useState([
    { locationName: '', locationType: 'booth', coordinates: '' }
  ]);
  const [menuItems, setMenuItems] = useState([
    { itemName: '', description: '', itemType: 'food', basePrice: 0 }
  ]);

  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: {
      festivalName: '',
      theme: '',
      description: '',
      location: '',
      startDate: '',
      endDate: '',
      registrationStartDate: '',
      registrationEndDate: '',
      maxFoodBooths: '',
      maxBeverageBooths: '',
      mapName: '',
      mapType: 'layout',
      menuName: '',
      menuDescription: ''
    }
  });

  const handleImageChange = (file, preview) => {
    setSelectedImage(file);
    setPreviewImage(preview);
  };

  const onSubmit = async (data) => {
    setIsLoading(true);
    
    try {
      let imageUrl = '';
      if (selectedImage) {
        imageUrl = await uploadService.uploadImage(selectedImage, 'festivals');
      }

      const festivalData = {
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

      const festivalResponse = await festivalServices.create(festivalData);
      const festivalId = festivalResponse.data.id;

      await festivalSchoolServices.create({
        festivalId: festivalId,
        schoolId: user.schoolId
      });

      const mapData = {
        festivalId: festivalId,
        mapName: data.mapName,
        mapType: data.mapType,
        mapUrl: imageUrl
      };
      const mapResponse = await festivalMapServices.create(mapData);
      const mapId = mapResponse.data.id;

      for (const location of mapLocations) {
        if (location.locationName.trim()) {
          await mapLocationServices.create({
            mapId: mapId,
            locationName: location.locationName,
            locationType: location.locationType,
            isOccupied: false,
            coordinates: location.coordinates
          });
        }
      }

      const menuData = {
        festivalId: festivalId,
        menuName: data.menuName,
        description: data.menuDescription
      };
      const menuResponse = await festivalMenuServices.create(menuData);
      const menuId = menuResponse.data.id;

      for (const item of menuItems) {
        if (item.itemName.trim()) {
          await menuItemServices.create({
            menuId: menuId,
            itemName: item.itemName,
            description: item.description,
            itemType: item.itemType,
            basePrice: parseFloat(item.basePrice) || 0
          });
        }
      }

      toast.success('Tạo lễ hội thành công!');
      navigate('/app/festivals');
    } catch (error) {
      console.error('Error creating festival:', error);
      toast.error('Có lỗi xảy ra khi tạo lễ hội');
    } finally {
      setIsLoading(false);
    }
  };

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
          <h1 className="text-3xl font-bold text-gray-900">Tạo lễ hội mới</h1>
          <p className="text-gray-600 mt-1">Điền thông tin để tạo lễ hội cho trường của bạn</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <BasicInfoForm register={register} errors={errors} />
            <DateTimeForm register={register} errors={errors} />
            <BoothConfigForm register={register} errors={errors} watch={watch} />
            <MapConfigForm 
              register={register} 
              errors={errors} 
              mapLocations={mapLocations}
              setMapLocations={setMapLocations}
            />
            <MenuConfigForm 
              register={register} 
              errors={errors} 
              menuItems={menuItems}
              setMenuItems={setMenuItems}
            />
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
                    Tạo lễ hội
                  </Button>
                  
                  <Button
                    type="button"
                    variant="outline"
                    fullWidth
                    onClick={() => navigate('/app/festivals')}
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

export default CreateFestivalPage;