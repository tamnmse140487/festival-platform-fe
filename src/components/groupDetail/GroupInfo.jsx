import React from 'react'
import { convertToVietnamTimeWithFormat } from '../../utils/formatters'

const GroupInfo = ({ group, members }) => {

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="text-sm font-medium text-gray-500">Tên nhóm</label>
          <p className="text-gray-900 mt-1">{group.groupName}</p>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-500">Lớp</label>
          <p className="text-gray-900 mt-1">{group.className}</p>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-500">Số thành viên</label>
          <p className="text-gray-900 mt-1">{members.length} thành viên</p>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-500">Ngân sách</label>
          <p className="text-gray-900 mt-1">{group.groupBudget?.toLocaleString() || 0}đ</p>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-500">Ngày tạo</label>
          <p className="text-gray-900 mt-1">{convertToVietnamTimeWithFormat(group.creationDate)}</p>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-500">Trạng thái</label>
          <p className="text-gray-900 mt-1">{group.status === 'active' ? 'Hoạt động' : 'Tạm dừng'}</p>
        </div>
      </div>
    </div>
  )
}

export default GroupInfo