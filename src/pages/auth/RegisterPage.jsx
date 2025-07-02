import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, School, Mail, Lock, User, Phone, Building, FileText, MapPin, Contact, ArrowLeft, ArrowRight } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { roleServices } from '../../services/roleServices';
import { accountServices } from '../../services/accountServices';
import { supplierServices } from '../../services/supplierServices';
import { toast } from 'react-hot-toast';

const RegisterPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedRoleId, setSelectedRoleId] = useState(null);
  const [availableRoles, setAvailableRoles] = useState([]);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({});

  const { login } = useAuth();
  const navigate = useNavigate();

  const { register, handleSubmit, watch, formState: { errors }, reset, trigger } = useForm();
  const watchPassword = watch('password');

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await roleServices.get();
        const filteredRoles = response.data.filter(role =>
          role.roleName === 'Guest' || role.roleName === 'Supplier'
        );
        setAvailableRoles(filteredRoles);
      } catch (error) {
        toast.error('Không thể tải danh sách vai trò');
      }
    };
    
    fetchRoles();
  }, []);

  const handleRoleSelect = (roleName, roleId) => {
    setSelectedRole(roleName);
    setSelectedRoleId(roleId);
    setStep(2);
    reset();
  };

  const handleNextStep = async (data) => {
    const isValid = await trigger();
    if (isValid) {
      setFormData(prev => ({ ...prev, ...data }));
      setStep(step + 1);
    }
  };

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const completeData = { ...formData, ...data };
      
      const accountData = {
        email: completeData.email,
        password: completeData.password,
        fullName: completeData.fullName,
        roleId: selectedRoleId,
        phoneNumber: completeData.phoneNumber
      };

      const accountResult = await accountServices.create(accountData);

      if (accountResult.success || accountResult.data) {
        const accountId = accountResult.data?.id || accountResult.id;

        if (selectedRole === 'Supplier') {
          const supplierData = {
            accountId: accountId,
            companyName: completeData.companyName,
            businessLicense: completeData.businessLicense,
            category: completeData.category,
            note: completeData.note || '',
            address: completeData.address,
            contactInfo: completeData.contactInfo
          };

          await supplierServices.create(supplierData);
        }

        if (selectedRole === 'Guest') {
          const loginResult = await login({
            email: completeData.email,
            password: completeData.password
          });

          if (loginResult.success) {
            toast.success('Đăng ký và đăng nhập thành công!');
            navigate('/dashboard');
            return;
          }
        }

        toast.success('Đăng ký thành công! Vui lòng đăng nhập.');
        navigate('/auth/login');
      } else {
        toast.error(accountResult.error || 'Có lỗi xảy ra khi tạo tài khoản');
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast.error(error?.response?.data)
      toast.error('Có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderStepOne = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900">Chọn loại tài khoản</h2>
        <p className="mt-2 text-sm text-gray-600">
          Vui lòng chọn loại tài khoản bạn muốn đăng ký
        </p>
      </div>

      <div className="space-y-4">
        {availableRoles.map((role) => (
          <button
            key={role.roleId}
            onClick={() => handleRoleSelect(role.roleName, role.roleId)}
            className="w-full p-6 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 text-left"
          >
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                {role.roleName === 'Guest' ? (
                  <User className="w-6 h-6 text-blue-600" />
                ) : (
                  <Building className="w-6 h-6 text-blue-600" />
                )}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {role.roleName === 'Guest' ? 'Khách' : 'Nhà cung cấp'}
                </h3>
                <p className="text-sm text-gray-600">
                  {role.roleName === 'Guest'
                    ? 'Tài khoản khách để tham gia các hoạt động'
                    : 'Tài khoản nhà cung cấp sản phẩm, nguyên liệu'
                  }
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );

  const renderStepTwo = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={() => setStep(1)}
          className="flex items-center text-blue-600 hover:text-blue-500"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Quay lại
        </button>
        {selectedRole === 'Supplier' && (
          <div className="flex space-x-2">
            <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
            <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
            <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
          </div>
        )}
      </div>

      <div>
        <h2 className="text-2xl font-bold text-gray-900">
          Thông tin cơ bản
        </h2>
        <p className="text-sm text-gray-600 mt-2">
          Nhập thông tin tài khoản của bạn
        </p>
      </div>

      <form className="space-y-6" onSubmit={handleSubmit(selectedRole === 'Guest' ? onSubmit : handleNextStep)}>
        <div>
          <label className="block text-sm font-medium text-gray-700">Họ và tên</label>
          <div className="mt-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <User className="h-5 w-5 text-gray-400" />
            </div>
            <input
              {...register('fullName', {
                required: 'Họ và tên là bắt buộc',
                minLength: { value: 2, message: 'Họ và tên phải có ít nhất 2 ký tự' }
              })}
              type="text"
              className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Nhập họ và tên"
            />
          </div>
          {errors.fullName && (
            <p className="mt-1 text-sm text-red-600">{errors.fullName.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <div className="mt-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-gray-400" />
            </div>
            <input
              {...register('email', {
                required: 'Email là bắt buộc',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Email không hợp lệ'
                }
              })}
              type="email"
              className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Nhập email"
            />
          </div>
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Số điện thoại</label>
          <div className="mt-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Phone className="h-5 w-5 text-gray-400" />
            </div>
            <input
              {...register('phoneNumber', {
                required: 'Số điện thoại là bắt buộc',
                pattern: {
                  value: /^[0-9]{10,11}$/,
                  message: 'Số điện thoại không hợp lệ'
                }
              })}
              type="tel"
              className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Nhập số điện thoại"
            />
          </div>
          {errors.phoneNumber && (
            <p className="mt-1 text-sm text-red-600">{errors.phoneNumber.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Mật khẩu</label>
          <div className="mt-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-gray-400" />
            </div>
            <input
              {...register('password', {
                required: 'Mật khẩu là bắt buộc',
                minLength: { value: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự' }
              })}
              type={showPassword ? 'text' : 'password'}
              className="appearance-none block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Nhập mật khẩu"
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5 text-gray-400" />
              ) : (
                <Eye className="h-5 w-5 text-gray-400" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Xác nhận mật khẩu</label>
          <div className="mt-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-gray-400" />
            </div>
            <input
              {...register('confirmPassword', {
                required: 'Xác nhận mật khẩu là bắt buộc',
                validate: value => value === watchPassword || 'Mật khẩu không khớp'
              })}
              type={showConfirmPassword ? 'text' : 'password'}
              className="appearance-none block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Nhập lại mật khẩu"
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? (
                <EyeOff className="h-5 w-5 text-gray-400" />
              ) : (
                <Eye className="h-5 w-5 text-gray-400" />
              )}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
          )}
        </div>

        {selectedRole === 'Guest' && (
          <div className="flex items-center">
            <input
              {...register('terms', {
                required: 'Bạn phải đồng ý với điều khoản sử dụng'
              })}
              id="terms"
              type="checkbox"
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="terms" className="ml-2 block text-sm text-gray-900">
              Tôi đồng ý với{' '}
              <Link to="/terms" className="text-blue-600 hover:text-blue-500">
                điều khoản sử dụng
              </Link>{' '}
              và{' '}
              <Link to="/privacy" className="text-blue-600 hover:text-blue-500">
                chính sách bảo mật
              </Link>
            </label>
          </div>
        )}
        {selectedRole === 'Guest' && errors.terms && (
          <p className="text-sm text-red-600">{errors.terms.message}</p>
        )}

        <div>
          <button
            type="submit"
            disabled={isLoading}
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : selectedRole === 'Guest' ? (
              'Tạo tài khoản'
            ) : (
              <div className="flex items-center">
                Tiếp tục
                <ArrowRight className="w-4 h-4 ml-2" />
              </div>
            )}
          </button>
        </div>
      </form>
    </div>
  );

  const renderStepThree = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={() => setStep(2)}
          className="flex items-center text-blue-600 hover:text-blue-500"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Quay lại
        </button>
        <div className="flex space-x-2">
          <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
          <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
          <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold text-gray-900">
          Thông tin công ty
        </h2>
        <p className="text-sm text-gray-600 mt-2">
          Nhập thông tin về công ty của bạn
        </p>
      </div>

      <form className="space-y-6" onSubmit={handleSubmit(handleNextStep)}>
        <div>
          <label className="block text-sm font-medium text-gray-700">Tên công ty</label>
          <div className="mt-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Building className="h-5 w-5 text-gray-400" />
            </div>
            <input
              {...register('companyName', {
                required: 'Tên công ty là bắt buộc'
              })}
              type="text"
              className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Nhập tên công ty"
            />
          </div>
          {errors.companyName && (
            <p className="mt-1 text-sm text-red-600">{errors.companyName.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Giấy phép kinh doanh</label>
          <div className="mt-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FileText className="h-5 w-5 text-gray-400" />
            </div>
            <input
              {...register('businessLicense', {
                required: 'Giấy phép kinh doanh là bắt buộc'
              })}
              type="text"
              className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Nhập số giấy phép kinh doanh"
            />
          </div>
          {errors.businessLicense && (
            <p className="mt-1 text-sm text-red-600">{errors.businessLicense.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Lĩnh vực kinh doanh</label>
          <div className="mt-1">
            <select
              {...register('category', {
                required: 'Lĩnh vực kinh doanh là bắt buộc'
              })}
              className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Chọn lĩnh vực</option>
              <option value="food">Thực phẩm & Đồ uống</option>
              <option value="decoration">Trang trí</option>
              <option value="sound">Âm thanh & Ánh sáng</option>
              <option value="entertainment">Giải trí</option>
              <option value="security">Bảo vệ</option>
              <option value="other">Khác</option>
            </select>
          </div>
          {errors.category && (
            <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
          )}
        </div>

        <div>
          <button
            type="submit"
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            <div className="flex items-center">
              Tiếp tục
              <ArrowRight className="w-4 h-4 ml-2" />
            </div>
          </button>
        </div>
      </form>
    </div>
  );

  const renderStepFour = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={() => setStep(3)}
          className="flex items-center text-blue-600 hover:text-blue-500"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Quay lại
        </button>
        <div className="flex space-x-2">
          <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
          <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
          <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold text-gray-900">
          Thông tin liên hệ
        </h2>
        <p className="text-sm text-gray-600 mt-2">
          Nhập thông tin liên hệ và hoàn tất đăng ký
        </p>
      </div>

      <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label className="block text-sm font-medium text-gray-700">Địa chỉ</label>
          <div className="mt-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MapPin className="h-5 w-5 text-gray-400" />
            </div>
            <input
              {...register('address', {
                required: 'Địa chỉ là bắt buộc'
              })}
              type="text"
              className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Nhập địa chỉ công ty"
            />
          </div>
          {errors.address && (
            <p className="mt-1 text-sm text-red-600">{errors.address.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Thông tin liên hệ</label>
          <div className="mt-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Contact className="h-5 w-5 text-gray-400" />
            </div>
            <input
              {...register('contactInfo', {
                required: 'Thông tin liên hệ là bắt buộc'
              })}
              type="text"
              className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Email, số điện thoại, link mạng xã hội"
            />
          </div>
          {errors.contactInfo && (
            <p className="mt-1 text-sm text-red-600">{errors.contactInfo.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Ghi chú</label>
          <div className="mt-1">
            <textarea
              {...register('note')}
              rows={3}
              className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Mô tả thêm về dịch vụ, sản phẩm..."
            />
          </div>
        </div>

        <div className="flex items-center">
          <input
            {...register('terms', {
              required: 'Bạn phải đồng ý với điều khoản sử dụng'
            })}
            id="terms"
            type="checkbox"
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="terms" className="ml-2 block text-sm text-gray-900">
            Tôi đồng ý với{' '}
            <Link to="/terms" className="text-blue-600 hover:text-blue-500">
              điều khoản sử dụng
            </Link>{' '}
            và{' '}
            <Link to="/privacy" className="text-blue-600 hover:text-blue-500">
              chính sách bảo mật
            </Link>
          </label>
        </div>
        {errors.terms && (
          <p className="text-sm text-red-600">{errors.terms.message}</p>
        )}

        <div>
          <button
            type="submit"
            disabled={isLoading}
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              'Tạo tài khoản'
            )}
          </button>
        </div>
      </form>
    </div>
  );

  const renderCurrentStep = () => {
    switch (step) {
      case 1:
        return renderStepOne();
      case 2:
        return renderStepTwo();
      case 3:
        return renderStepThree();
      case 4:
        return renderStepFour();
      default:
        return renderStepOne();
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div>
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
                <School className="w-7 h-7 text-white" />
              </div>
              <div onClick={() => navigate('/')} className='cursor-pointer'>
                <h2 className="text-3xl font-bold text-gray-900">Festival Hub</h2>
                <p className="text-sm text-gray-600">Hệ thống quản lý lễ hội</p>
              </div>
            </div>

            {step === 1 && (
              <p className="mt-8 text-sm text-gray-600">
                Đã có tài khoản?{' '}
                <Link
                  to="/auth/login"
                  className="font-medium text-blue-600 hover:text-blue-500"
                >
                  Đăng nhập ngay
                </Link>
              </p>
            )}
          </div>

          <div className="mt-8">
            {renderCurrentStep()}
          </div>
        </div>
      </div>

      <div className="hidden lg:block relative w-0 flex-1">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600 to-blue-700">
          <div className="absolute inset-0 bg-black bg-opacity-20"></div>
          <div className="relative h-full flex items-center justify-center p-12">
            <div className="text-center text-white">
              <h1 className="text-4xl font-bold mb-6">
                Tham gia cộng đồng Festival Hub
              </h1>
              <p className="text-xl mb-8 opacity-90">
                Kết nối với hàng nghìn trường học trên toàn quốc
              </p>
              <div className="space-y-4 text-sm">
                <div className="bg-white bg-opacity-10 rounded-lg p-4">
                  <p className="opacity-80">
                    "Hệ thống giúp chúng tôi tổ chức lễ hội hiệu quả và chuyên nghiệp hơn"
                  </p>
                  <p className="font-semibold mt-2">- Trường THPT Lê Hồng Phong</p>
                </div>
                <div className="bg-white bg-opacity-10 rounded-lg p-4">
                  <p className="opacity-80">
                    "Học sinh rất thích thú với hệ thống mini games và điểm thưởng"
                  </p>
                  <p className="font-semibold mt-2">- Trường THPT Nguyễn Thái Bình</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;