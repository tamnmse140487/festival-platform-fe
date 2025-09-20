import React, { useState, useEffect } from 'react';
import { Modal, Descriptions, Tag, Avatar, Spin } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { schoolServices } from '../../services/schoolServices';
import { supplierServices } from '../../services/supplierServices';
import { schoolAccountRelationServices } from '../../services/schoolAccountRelationServices';
import { convertToVietnamTimeWithFormat } from '../../utils/formatters';

const AccountDetailModal = ({ account, roles, visible, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [detailData, setDetailData] = useState({
    schoolInfo: null,
    supplierInfo: null,
    relationInfo: null
  });

  useEffect(() => {
    if (visible && account) {
      fetchDetailData();
    }
  }, [visible, account]);

  const fetchDetailData = async () => {
    if (!account) return;

    setLoading(true);
    try {
      const role = roles.find(r => r.roleId === account.roleId);
      const roleName = role?.roleName?.toLowerCase();

      let data = {
        schoolInfo: null,
        supplierInfo: null,
        relationInfo: null
      };

      if (roleName === 'schoolmanager') {
        const schoolResponse = await schoolServices.get({ accountId: account.id });
        const schoolData = schoolResponse.data.find(school => school.accountId === account.id);
        data.schoolInfo = schoolData;
      } else if (roleName === 'supplier' ) {
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
    } catch (error) {
      console.error('Error fetching detail data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRoleInfo = (roleId) => {
    const role = roles.find(r => r.roleId === roleId);
    if (!role) return { name: 'Không xác định', color: 'default' };

    let color = 'default';
    const roleName = role.roleName.toLowerCase();
    switch (roleName) {
      case 'admin': color = 'red'; break;
      case 'schoolmanager': color = 'purple'; break;
      case 'teacher': color = 'blue'; break;
      case 'student': color = 'green'; break;
      case 'supplier': color = 'orange'; break;
      case 'user': color = 'cyan'; break;
    }

    return { name: role.roleName, color };
  };

  if (!account) return null;

  const roleInfo = getRoleInfo(account.roleId);

  return (
    <Modal
      title="Thông tin chi tiết tài khoản"
      open={visible}
      onCancel={onClose}
      footer={null}
      width={800}
    >
      <Spin spinning={loading}>
        <div className="space-y-6">
          <div className="flex items-center space-x-4 mb-6">
            <Avatar size={64} src={account.avatarUrl} icon={<UserOutlined />} />
            <div>
              <h3 className="text-lg font-semibold">{account.fullName}</h3>
              <Tag color={roleInfo.color}>{roleInfo.name}</Tag>
            </div>
          </div>

          <Descriptions bordered column={2}>
            <Descriptions.Item label="ID" span={1}>{account.id}</Descriptions.Item>
            <Descriptions.Item label="Email" span={1}>{account.email}</Descriptions.Item>
            <Descriptions.Item label="Số điện thoại" span={1}>
              {account.phoneNumber || 'Chưa cập nhật'}
            </Descriptions.Item>
            <Descriptions.Item label="Vai trò" span={1}>
              <Tag color={roleInfo.color}>{roleInfo.name}</Tag>
            </Descriptions.Item>
            {account.className && (
              <Descriptions.Item label="Lớp học" span={1}>{account.className}</Descriptions.Item>
            )}
            {/* <Descriptions.Item label="Trạng thái" span={1}>
              <Tag color={account.status ? 'green' : 'red'}>
                {account.status ? 'Hoạt động' : 'Không hoạt động'}
              </Tag>
            </Descriptions.Item> */}
            <Descriptions.Item label="Ngày tạo" span={2}>
              {convertToVietnamTimeWithFormat(account.createdAt)}
            </Descriptions.Item>
            {account.updatedAt && (
              <Descriptions.Item label="Cập nhật lần cuối" span={2}>
                {convertToVietnamTimeWithFormat(account.updatedAt)}
              </Descriptions.Item>
            )}
          </Descriptions>

          {detailData.schoolInfo && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-3">Thông tin trường học</h4>
              <Descriptions bordered size="small">
                <Descriptions.Item label="Tên trường" span={2}>
                  {detailData.schoolInfo.schoolName}
                </Descriptions.Item>
                <Descriptions.Item label="Địa chỉ" span={2}>
                  {detailData.schoolInfo.address}
                </Descriptions.Item>
                <Descriptions.Item label="Liên hệ" span={2}>
                  {detailData.schoolInfo.contactInfo}
                </Descriptions.Item>
                <Descriptions.Item label="Mô tả" span={2}>
                  {detailData.schoolInfo.description}
                </Descriptions.Item>
              </Descriptions>
            </div>
          )}

          {detailData.supplierInfo && (
            <div className="mt-6 p-4 bg-green-50 rounded-lg">
              <h4 className="font-medium text-green-900 mb-3">Thông tin nhà cung cấp</h4>
              <Descriptions bordered size="small">
                <Descriptions.Item label="Tên công ty" span={2}>
                  {detailData.supplierInfo.companyName}
                </Descriptions.Item>
                <Descriptions.Item label="Giấy phép kinh doanh" span={2}>
                  {detailData.supplierInfo.businessLicense}
                </Descriptions.Item>
                <Descriptions.Item label="Danh mục" span={1}>
                  {detailData.supplierInfo.category}
                </Descriptions.Item>
                <Descriptions.Item label="Địa chỉ" span={1}>
                  {detailData.supplierInfo.address}
                </Descriptions.Item>
              </Descriptions>
            </div>
          )}

          {detailData.relationInfo && (
            <div className="mt-6 p-4 bg-purple-50 rounded-lg">
              <h4 className="font-medium text-purple-900 mb-3">Thông tin trường học</h4>
              <Descriptions bordered size="small">
                <Descriptions.Item label="Tên trường" span={2}>
                  {detailData.relationInfo.school.schoolName}
                </Descriptions.Item>
                <Descriptions.Item label="Vai trò" span={1}>
                  {detailData.relationInfo.relation.relationType === "teacher" ? "Giáo viên" : "Học sinh"}
                </Descriptions.Item>
                <Descriptions.Item label="Địa chỉ trường" span={1}>
                  {detailData.relationInfo.school.address}
                </Descriptions.Item>
                <Descriptions.Item label="Liên hệ trường" span={2}>
                  {detailData.relationInfo.school.contactInfo}
                </Descriptions.Item>
              </Descriptions>
            </div>
          )}
        </div>
      </Spin>
    </Modal>
  );
};

export default AccountDetailModal;