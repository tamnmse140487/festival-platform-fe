import React from 'react'

const GroupBudget = ({ group }) => {
  return (
    <div className="space-y-6">
      <div className="text-center p-6 bg-blue-50 rounded-lg">
        <div className="text-3xl font-bold text-blue-600 mb-2">
          {group.groupBudget?.toLocaleString() || 0}đ
        </div>
        <div className="text-blue-800 font-medium">Ngân sách hiện tại</div>
      </div>
    </div>
  )
}

export default GroupBudget