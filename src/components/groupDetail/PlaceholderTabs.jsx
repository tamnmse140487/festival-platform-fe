import React from 'react'
import { MessageCircle, File } from 'lucide-react'

export const ChatTab = () => (
  <div className="text-center py-12">
    <MessageCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
    <h3 className="text-lg font-medium text-gray-900 mb-2">Tính năng chat</h3>
    <p className="text-gray-600">Chức năng chat sẽ được phát triển trong tương lai.</p>
  </div>
)

export const DocumentsTab = () => (
  <div className="text-center py-12">
    <File className="mx-auto h-12 w-12 text-gray-400 mb-4" />
    <h3 className="text-lg font-medium text-gray-900 mb-2">Tài liệu nhóm</h3>
    <p className="text-gray-600">Chức năng quản lý tài liệu sẽ được phát triển trong tương lai.</p>
  </div>
)