import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Switch, Upload, Avatar, message } from 'antd';
import { UploadOutlined, UserOutlined } from '@ant-design/icons';
import { accountServices } from '../../services/accountServices';
import { schoolServices } from '../../services/schoolServices';
import { supplierServices } from '../../services/supplierServices';
import { schoolAccountRelationServices } from '../../services/schoolAccountRelationServices';
import { uploadService } from '../../services/uploadServices';
import toast from 'react-hot-toast';

const AccountEditModal = ({ account, roles, visible, onClose, onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState(null);
  const [previewAvatar, setPreviewAvatar] = useState(null);
  const [originalData, setOriginalData] = useState({});
  const [detailData, setDetailData] = useState({
    schoolInfo: null,
    supplierInfo: null,
    relationInfo: null
  });

  useEffect(() => {
    if (visible && account) {
      fetchDetailData();
    } else {
      resetForm();
    }
  }, [visible, account]);

  const resetForm = () => {
    form.resetFields();
    setSelectedAvatar(null);
    setPreviewAvatar(null);
    setOriginalData({});
    setDetailData({
      schoolInfo: null,
      supplierInfo: null,
      relationInfo: null
    });
  };

  const fetchDetailData = async () => {
    if (!account) return;

    setDataLoading(true);
    try {
      const role = roles.find(r => r.roleId === account.roleId);
      const roleName = role?.roleName?.toLowerCase();

      let data = {
        schoolInfo: null,
        supplierInfo: null,
        relationInfo: null
      };

      if (roleName === 'schoolmanager' ) {
        const schoolResponse = await schoolServices.get({ accountId: account.id });
        const schoolData = schoolResponse.data.find(school => school.accountId === account.id);
        data.schoolInfo = schoolData;
      } else if (roleName === 'supplier') {
        const supplierResponse = await supplierServices.get({ supplierId: account.supplierId });
        data.supplierInfo = supplierResponse.data[0];
      } else if (roleName === 'student' || roleName === 'teacher') {
        const relationResponse = await schoolAccountRelationServices.get({ accountId: account.id });
        if (relationResponse.data[0]?.schoolId) {
          const schoolResponse = await schoolServices.get({ id: relationResponse.data[0].schoolId });
          data.relationInfo = {
            relation: relationResponse.data[0],
            school: schoolResponse.data[0]
          };
        }
      }

      setDetailData(data);

      const formData = {
        fullName: account.fullName,
        email: account.email,
        phoneNumber: account.phoneNumber,
        status: account.status,
        className: account.className
      };

      if (data.schoolInfo) {
        formData.schoolContactInfo = data.schoolInfo.contactInfo;
        formData.schoolDescription = data.schoolInfo.description;
      }

      setOriginalData({
        ...account,
        schoolInfo: data.schoolInfo,
        supplierInfo: data.supplierInfo,
        relationInfo: data.relationInfo
      });

      form.setFieldsValue(formData);
      setPreviewAvatar(account.avatarUrl);

    } catch (error) {
      console.error('Error fetching detail data:', error);
      toast.error('Không thể tải thông tin chi tiết');
    } finally {
      setDataLoading(false);
    }
  };

  const handleAvatarChange = (info) => {
    const file = info.file.originFileObj || info.file;
    setSelectedAvatar(file);
    setPreviewAvatar(URL.createObjectURL(file));
  };

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      let avatarUrl = originalData.avatarUrl;

      if (selectedAvatar) {
        avatarUrl = await uploadService.uploadAvatarImage(selectedAvatar);
      }

      const accountUpdateData = {};

      if (values.fullName !== originalData.fullName) {
        accountUpdateData.fullName = values.fullName;
      }
      
      if (values.phoneNumber !== originalData.phoneNumber) {
        accountUpdateData.phoneNumber = values.phoneNumber;
      }
      
      if (values.status !== originalData.status) {
        accountUpdateData.status = values.status;
      }
      
      if (avatarUrl !== originalData.avatarUrl) {
        accountUpdateData.avatarUrl = avatarUrl;
      }

      const role = roles.find(r => r.roleId === account.roleId);
      const roleName = role?.roleName?.toLowerCase();
      
      if (roleName === 'student' && values.className !== originalData.className) {
        accountUpdateData.className = values.className;
      }

      if (Object.keys(accountUpdateData).length > 0) {
        accountUpdateData.updatedAt = new Date().toISOString();
        await accountServices.update({ id: account.id }, accountUpdateData);
      }

      if (roleName === 'schoolmanager' && detailData.schoolInfo) {
        const schoolUpdateData = { id: detailData.schoolInfo.schoolId };
        
        if (values.schoolContactInfo !== detailData.schoolInfo.contactInfo) {
          schoolUpdateData.contactInfo = values.schoolContactInfo;
        }
        
        if (values.schoolDescription !== detailData.schoolInfo.description) {
          schoolUpdateData.description = values.schoolDescription;
        }
        
        if (avatarUrl !== originalData.avatarUrl) {
          schoolUpdateData.logoUrl = avatarUrl;
        }

        if (Object.keys(schoolUpdateData).length > 1) {
          console.log("schoolUpdateData: ", schoolUpdateData)
          await schoolServices.update(schoolUpdateData);
        }
      }

      toast.success('Cập nhật tài khoản thành công!');
      onSuccess();
    } catch (error) {
      console.error('Error updating account:', error);
      toast.error('Có lỗi xảy ra khi cập nhật tài khoản');
      toast.error(error?.response?.data?.message);
    } finally {
      setLoading(false);
    }
  };

  const getRoleDisplayName = (roleId) => {
    const role = roles.find(r => r.roleId === roleId);
    return role?.roleName || 'Không xác định';
  };

  const role = roles.find(r => r.roleId === account?.roleId);
  const roleName = role?.roleName?.toLowerCase();

  return (
    <Modal
      title="Chỉnh sửa tài khoản"
      open={visible}
      onCancel={onClose}
      onOk={() => form.submit()}
      confirmLoading={loading}
      okText="Cập nhật"
      cancelText="Hủy"
      width={700}
      style={{top: 20}}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        disabled={dataLoading}
      >
        <div className="text-center mb-6">
          <Avatar 
            size={80} 
            src={previewAvatar} 
            icon={<UserOutlined />}
            className="mb-3"
          />
          <Upload
            beforeUpload={() => false}
            onChange={handleAvatarChange}
            showUploadList={false}
            accept="image/*"
          >
            <div className="text-blue-600 cursor-pointer hover:text-blue-800">
              <UploadOutlined /> Thay đổi ảnh đại diện
            </div>
          </Upload>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Form.Item
            label="Họ và tên"
            name="fullName"
            rules={[
              { required: true, message: 'Họ tên là bắt buộc' },
              { min: 2, message: 'Họ tên phải có ít nhất 2 ký tự' }
            ]}
          >
            <Input placeholder="Nhập họ và tên" />
          </Form.Item>

          <Form.Item label="Email" name="email">
            <Input disabled />
          </Form.Item>

          <Form.Item
            label="Số điện thoại"
            name="phoneNumber"
            rules={[
              { pattern: /^[0-9]{10,11}$/, message: 'Số điện thoại không hợp lệ' }
            ]}
          >
            <Input placeholder="Nhập số điện thoại" />
          </Form.Item>

          {roleName === 'student' && (
            <Form.Item
              label="Lớp học"
              name="className"
            >
              <Input placeholder="Nhập lớp học" />
            </Form.Item>
          )}

          <Form.Item label="Vai trò">
            <Input value={getRoleDisplayName(account?.roleId)} disabled />
          </Form.Item>

          {/* <Form.Item
            label="Trạng thái"
            name="status"
            valuePropName="checked"
          >
            <Switch 
              checkedChildren="Hoạt động" 
              unCheckedChildren="Không hoạt động" 
            />
          </Form.Item> */}
        </div>

        {roleName === 'schoolmanager' && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-4">Thông tin trường học</h4>
            <div className="space-y-4">
              <Form.Item
                label="Liên hệ"
                name="schoolContactInfo"
              >
                <Input placeholder="Nhập thông tin liên hệ" />
              </Form.Item>

              <Form.Item
                label="Mô tả"
                name="schoolDescription"
              >
                <Input.TextArea 
                  rows={3} 
                  placeholder="Nhập mô tả về trường" 
                />
              </Form.Item>
            </div>
          </div>
        )}
      </Form>
    </Modal>
  );
};

export default AccountEditModal;