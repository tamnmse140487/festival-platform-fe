import React, { useState } from 'react'
import { toast } from 'react-hot-toast'

const ImportListAccountsModal = ({ onClose, onSubmit, schoolId }) => {
    const [selectedFile, setSelectedFile] = useState(null)
    const [uploading, setUploading] = useState(false)

    const handleFileSelect = (event) => {
        const file = event.target.files[0]
        
        if (!file) {
            return
        }

        // Kiểm tra định dạng file
        const allowedTypes = [
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
            'application/vnd.ms-excel' // .xls
        ]
        
        if (!allowedTypes.includes(file.type)) {
            toast.error('Chỉ chấp nhận file Excel (.xlsx, .xls)')
            return
        }

        // Kiểm tra kích thước file (tối đa 10MB)
        const maxSize = 10 * 1024 * 1024 // 10MB
        if (file.size > maxSize) {
            toast.error('File quá lớn. Kích thước tối đa là 10MB')
            return
        }

        setSelectedFile(file)
    }

    const handleRemoveFile = () => {
        setSelectedFile(null)
        // Reset input file
        document.getElementById('excel-file-input').value = ''
    }

    const handleSubmit = async () => {
        if (!selectedFile) {
            toast.error('Vui lòng chọn file Excel')
            return
        }

        if (!schoolId) {
            toast.error('Không tìm thấy thông tin trường học')
            return
        }

        setUploading(true)

        try {
            // Tạo FormData để gửi multipart/form-data
            const formData = new FormData()
            formData.append('ExcelFile', selectedFile)
            formData.append('SchoolId', schoolId)

            await onSubmit(formData)
        } catch (error) {
            console.error('Error importing accounts:', error)
        } finally {
            setUploading(false)
        }
    }

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes'
        const k = 1024
        const sizes = ['Bytes', 'KB', 'MB', 'GB']
        const i = Math.floor(Math.log(bytes) / Math.log(k))
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    }

    return (
        <div className="mt-0-important fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b">
                    <h2 className="text-xl font-semibold text-gray-900">
                        Tạo tài khoản hàng loạt
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                        disabled={uploading}
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-4">
                    {/* File Upload Area */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                            Chọn file Excel
                        </label>
                        
                        {!selectedFile ? (
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                                <div className="space-y-2">
                                    <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                    <div className="text-sm text-gray-600">
                                        <label htmlFor="excel-file-input" className="cursor-pointer text-blue-600 hover:text-blue-500">
                                            Chọn file
                                        </label>
                                        <span> hoặc kéo thả file vào đây</span>
                                    </div>
                                    <p className="text-xs text-gray-500">
                                        Chỉ chấp nhận file Excel (.xlsx, .xls) - Tối đa 10MB
                                    </p>
                                </div>
                                <input
                                    id="excel-file-input"
                                    type="file"
                                    className="hidden"
                                    accept=".xlsx,.xls"
                                    onChange={handleFileSelect}
                                    disabled={uploading}
                                />
                            </div>
                        ) : (
                            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <div className="flex-shrink-0">
                                            <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-900 truncate">
                                                {selectedFile.name}
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                {formatFileSize(selectedFile.size)}
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={handleRemoveFile}
                                        className="text-red-600 hover:text-red-800 transition-colors"
                                        disabled={uploading}
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Instructions */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-blue-800">
                                    Hướng dẫn sử dụng
                                </h3>
                                <div className="mt-2 text-sm text-blue-700">
                                    <ul className="list-disc list-inside space-y-1">
                                        <li>File Excel phải có các cột: Fullname, PhoneNumber, Email, Password, Role</li>
                                        <li>Vai trò chỉ được phép là "Teacher" hoặc "Student"</li>
                                        <li>Email phải là duy nhất trong hệ thống</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end space-x-3 p-6 border-t bg-gray-50">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                        disabled={uploading}
                    >
                        Hủy
                    </button>
                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={!selectedFile || uploading}
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                    >
                        {uploading ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Đang xử lý...
                            </>
                        ) : (
                            'Xác nhận dữ liệu'
                        )}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default ImportListAccountsModal