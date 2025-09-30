import React, { useState, useEffect } from 'react';
import Button from '../common/Button';
import Input from '../common/Input';
import { accountServices } from '../../services/accountServices';
import { schoolServices } from '../../services/schoolServices';
import { roleServices } from '../../services/roleServices';
import { uploadService } from '../../services/uploadServices';
import { ROLE_NAME } from '../../utils/constants';
import { Upload } from 'lucide-react';
import toast from 'react-hot-toast';

const CreateSchoolForm = ({ onClose, onSchoolCreated }) => {
    const [formData, setFormData] = useState({
        fullName: '',
        password: '',
        confirmPassword: '',
        email: '',
        phoneNumber: '',
        schoolName: '',
        address: '',
        contactInfo: '',
        logoUrl: '',
        description: ''
    });
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [schoolManagerRole, setSchoolManagerRole] = useState(null);
    const [selectedLogoImage, setSelectedLogoImage] = useState(null);
    const [previewImage, setPreviewImage] = useState(null);

    useEffect(() => {
        loadSchoolManagerRole();
    }, []);

    const loadSchoolManagerRole = async () => {
        try {
            const response = await roleServices.get({ roleName: ROLE_NAME.SCHOOL_MANAGER });
            if (response.data && response.data.length > 0) {
                setSchoolManagerRole(response.data[0]);
            }
        } catch (error) {
            console.error('Error loading school manager role:', error);
        }
    };

    const validateForm = () => {
        const newErrors = {};
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const phoneRegex = /^(0[2-9]|84[2-9])\d{8}$/;

        if (!formData.email) newErrors.email = 'Vui lòng nhập email';
        else if (!emailRegex.test(formData.email)) newErrors.email = 'Email không hợp lệ';

        if (!formData.phoneNumber) newErrors.phoneNumber = 'Vui lòng nhập số điện thoại';
        else if (!phoneRegex.test(formData.phoneNumber)) newErrors.phoneNumber = 'Số điện thoại không hợp lệ';

        if (!formData.password) newErrors.password = 'Vui lòng nhập mật khẩu';
        if (!formData.confirmPassword) newErrors.confirmPassword = 'Vui lòng xác nhận mật khẩu';
        else if (formData.password !== formData.confirmPassword)
            newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';

        if (!formData.schoolName) newErrors.schoolName = 'Vui lòng nhập tên trường';
        if (!formData.address) newErrors.address = 'Vui lòng nhập địa chỉ';
        if (!formData.contactInfo) newErrors.contactInfo = 'Vui lòng nhập thông tin liên hệ';

        return newErrors;
    };

    const handleLogoImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedLogoImage(file);
            const reader = new FileReader();
            reader.onload = (e) => {
                setPreviewImage(e.target.result);
            };
            reader.readAsDataURL(file);
            setErrors(prev => {
                const newErrors = { ...prev };
                if (newErrors.logoUrl) {
                    delete newErrors.logoUrl;
                }
                return newErrors;
            });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const validationErrors = validateForm();
        setErrors(validationErrors);

        if (!schoolManagerRole) {
            setErrors({ form: 'Không thể tải thông tin role School Manager' });
            return;
        }

        if (Object.keys(validationErrors).length > 0) {
            return;
        }

        setIsLoading(true);
        try {
            let logoUrl = formData.logoUrl;

            if (selectedLogoImage) {
                try {
                    logoUrl = await uploadService.uploadAvatarImage(selectedLogoImage);
                } catch (error) {
                    console.error('Error uploading logo:', error);
                    setErrors({ form: 'Có lỗi xảy ra khi upload logo' });
                    setIsLoading(false);
                    return;
                }
            }

            const accountData = {
                fullName: formData.schoolName,
                password: formData.password,
                email: formData.email,
                phoneNumber: formData.phoneNumber,
                roleId: schoolManagerRole.roleId
            };

            const accountResponse = await accountServices.create(accountData);

            if (accountResponse.data && accountResponse.data.id) {
                const schoolData = {
                    schoolName: formData.schoolName,
                    address: formData.address,
                    contactInfo: formData.contactInfo,
                    logoUrl: logoUrl,
                    description: formData.description,
                    accountId: accountResponse.data.id
                };

                const schoolResponse = await schoolServices.create(schoolData);
                if (schoolResponse.data) {
                    const sendMailResponse = await accountServices.sendEmail(formData.email)
                    if (sendMailResponse.data) {
                        toast.success("Tạo trường học thành công!");
                        onSchoolCreated(schoolResponse.data);
                    }
                }

            }
        } catch (error) {
            console.error('Error creating school:', error);
            toast.error(error?.response?.data?.detail || 'Có lỗi xảy ra khi tạo trường học')
            toast.error(error?.response?.data?.message)
            setErrors({ form: error?.response?.data || 'Có lỗi xảy ra khi tạo trường học' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));

        setErrors(prev => {
            const newErrors = { ...prev };
            if (newErrors[field]) {
                delete newErrors[field];
            }
            return newErrors;
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Thông tin tài khoản</h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                        label="Email"
                        type="email"
                        required
                        placeholder="contact@school.edu.vn"
                        value={formData.email}
                        onChange={(e) => handleChange('email', e.target.value)}
                        error={errors.email}
                    />

                    <Input
                        label="Số điện thoại"
                        required
                        placeholder="0xxxxxxxxx"
                        value={formData.phoneNumber}
                        onChange={(e) => handleChange('phoneNumber', e.target.value)}
                        error={errors.phoneNumber}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                        label="Mật khẩu"
                        type="password"
                        required
                        placeholder="Nhập mật khẩu"
                        value={formData.password}
                        onChange={(e) => handleChange('password', e.target.value)}
                        error={errors.password}

                    />

                    <Input
                        label="Nhập lại mật khẩu"
                        type="password"
                        required
                        placeholder="Nhập lại mật khẩu"
                        value={formData.confirmPassword}
                        onChange={(e) => handleChange('confirmPassword', e.target.value)}
                        error={errors.confirmPassword}

                    />

                </div>

            </div>

            <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Thông tin trường học</h4>

                <Input
                    label="Tên trường"
                    required
                    placeholder="Nhập tên trường"
                    value={formData.schoolName}
                    onChange={(e) => handleChange('schoolName', e.target.value)}
                    error={errors.schoolName}
                />

                <Input
                    label="Địa chỉ"
                    required
                    placeholder="Nhập địa chỉ"
                    value={formData.address}
                    onChange={(e) => handleChange('address', e.target.value)}
                    error={errors.address}
                />

                <Input
                    label="Thông tin liên hệ"
                    required
                    placeholder="Zalo, link web, fanpage, ..."
                    value={formData.contactInfo}
                    onChange={(e) => handleChange('contactInfo', e.target.value)}
                    error={errors.contactInfo}
                />

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Logo trường học
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-500 transition-colors">
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleLogoImageChange}
                            className="hidden"
                            id="logo-upload"
                        />
                        <label
                            htmlFor="logo-upload"
                            className="cursor-pointer flex flex-col items-center"
                        >
                            <Upload size={24} className="text-gray-400 mb-2" />
                            <span className="text-sm text-gray-600">
                                Nhấn để tải ảnh lên
                            </span>
                            <span className="text-xs text-gray-400 mt-1">
                                PNG, JPG, GIF tối đa 5MB
                            </span>
                        </label>
                    </div>
                    {previewImage && (
                        <div className="mt-2">
                            <img
                                src={previewImage}
                                alt="Logo preview"
                                className="w-20 h-20 object-cover rounded-lg border border-gray-300"
                            />
                        </div>
                    )}
                    {formData.logoUrl && (
                        <div className="mt-2">
                            <img
                                src={formData.logoUrl}
                                alt="Logo preview"
                                className="w-20 h-20 object-cover rounded-lg border border-gray-300"
                            />
                        </div>
                    )}
                    {errors.logoUrl && (
                        <p className="text-red-500 text-sm mt-1">{errors.logoUrl}</p>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Mô tả
                    </label>
                    <textarea
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        rows={3}
                        placeholder="Nhập mô tả về trường học"
                        value={formData.description}
                        onChange={(e) => handleChange('description', e.target.value)}
                    />
                </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t">
                <Button
                    type="button"
                    variant="outline"
                    onClick={onClose}
                    disabled={isLoading}
                >
                    Hủy
                </Button>
                <Button
                    type="submit"
                    loading={isLoading}
                >
                    Thêm trường học
                </Button>
            </div>
        </form>
    );
};

export default CreateSchoolForm;