import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, MapPin, Users, Phone, Mail, Globe, Info, Map, UtensilsCrossed, Store, CheckCircle, DollarSign } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { festivalServices } from '../../../services/festivalServices';
import { festivalSchoolServices } from '../../../services/festivalSchoolServices';
import { imageServices } from '../../../services/imageServices';
import { FESTIVAL_STATUS } from '../../../utils/constants';

import AdminOverviewTab from '../../../components/festivals/admin/AdminOverviewTab';
import AdminMapTab from '../../../components/festivals/admin/AdminMapTab';
import AdminMenuTab from '../../../components/festivals/admin/AdminMenuTab';
import AdminBoothsTab from '../../../components/festivals/admin/AdminBoothsTab';
import AdminApprovalTab from '../../../components/festivals/admin/AdminApprovalTab';
import AdminRevenueTab from '../../../components/festivals/admin/AdminRevenueTab';
import { getStatusBadge } from '../../../utils/helpers';

const AdminFestivalDetail = ({ user }) => {
    const { id } = useParams();
    const [festival, setFestival] = useState(null);
    const [festivalSchool, setFestivalSchool] = useState(null);
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('approval');

    useEffect(() => {
        loadFestival();
    }, [id]);

    const loadFestival = async () => {
        try {
            setLoading(true);
            const [festivalResponse, festivalSchoolResponse, imagesResponse] = await Promise.all([
                festivalServices.get({ festivalId: id }),
                festivalSchoolServices.get({ festivalId: id }),
                imageServices.get({ festivalId: id })
            ]);

            setFestival(festivalResponse.data[0]);
            if (festivalSchoolResponse.data && festivalSchoolResponse.data.length > 0) {
                setFestivalSchool(festivalSchoolResponse.data[0]);
            }
            if (imagesResponse.data && imagesResponse.data.length > 0) {
                setImages(imagesResponse.data);
            }
        } catch (error) {
            console.error('Error loading festival:', error);
            toast.error('Không thể tải thông tin lễ hội');
        } finally {
            setLoading(false);
        }
    };

    const updateFestivalSchoolStatus = (newStatus, approvalDate = null, rejectReason = null) => {
        setFestivalSchool(prev => ({
            ...prev,
            status: newStatus,
            approvalDate,
            rejectReason
        }));
    };

    const getTabsConfig = () => {
        const baseTabs = [
            {
                id: 'approval',
                name: 'Kiểm duyệt',
                icon: CheckCircle,
                component: AdminApprovalTab
            },
            {
                id: 'overview',
                name: 'Tổng quan',
                icon: Info,
                component: AdminOverviewTab
            },
            {
                id: 'map',
                name: 'Bản đồ',
                icon: Map,
                component: AdminMapTab
            },
            {
                id: 'menu',
                name: 'Thực đơn',
                icon: UtensilsCrossed,
                component: AdminMenuTab
            },
            {
                id: 'booths',
                name: 'Các gian hàng',
                icon: Store,
                component: AdminBoothsTab
            }
        ];

        if (festival && festival.status === FESTIVAL_STATUS.COMPLETED) {
            baseTabs.push({
                id: 'revenue',
                name: 'Tổng kết doanh thu',
                icon: DollarSign,
                component: AdminRevenueTab
            });
        }

        return baseTabs;
    };

    const tabs = getTabsConfig();

    const getApprovalStatusBadge = (status) => {
        const badges = {
            'pending': { label: 'Chờ duyệt', class: 'bg-yellow-100 text-yellow-800' },
            'approved': { label: 'Đã duyệt', class: 'bg-green-100 text-green-800' },
            'rejected': { label: 'Đã từ chối', class: 'bg-red-100 text-red-800' }
        };

        const badge = badges[status] || badges.pending;
        return (
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${badge.class}`}>
                {badge.label}
            </span>
        );
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('vi-VN', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!festival) {
        return (
            <div className="text-center py-12">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Không tìm thấy lễ hội</h3>
                <Link
                    to="/app/festivals"
                    className="text-blue-600 hover:text-blue-700"
                >
                    Quay lại danh sách lễ hội
                </Link>
            </div>
        );
    }

    const ActiveTabComponent = tabs.find(tab => tab.id === activeTab)?.component;
    const primaryImage = images.length > 0 ? images[0].imageUrl : "/api/placeholder/800/300";

    return (
        <div className="space-y-6">
            <div className="flex items-center space-x-4">
                <Link
                    to="/app/festivals"
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                    <ArrowLeft size={20} />
                </Link>
                <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                        <h1 className="text-3xl font-bold text-gray-900">{festival.festivalName}</h1>
                        {festivalSchool && getApprovalStatusBadge(festivalSchool.status)}
                        {getStatusBadge(festival.status, 'festival')}

                    </div>
                    <p className="text-gray-600">{festival.theme}</p>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="relative h-64">
                    <img
                        src={primaryImage}
                        alt={festival.festivalName}
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    <div className="absolute bottom-6 left-6 text-white">
                        <h2 className="text-2xl font-bold mb-2">{festival.festivalName}</h2>
                        <div className="flex items-center space-x-4 text-sm">
                            <div className="flex items-center">
                                <Calendar size={16} className="mr-1" />
                                <span>{formatDate(festival.startDate)} - {formatDate(festival.endDate)}</span>
                            </div>
                            <div className="flex items-center">
                                <MapPin size={16} className="mr-1" />
                                <span>{festival.location}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {images.length > 1 && (
                    <div className="p-4 bg-gray-50">
                        <div className="grid grid-cols-4 gap-3">
                            {images.slice(1).map((image) => (
                                <div key={image.imageId} className="relative aspect-video rounded-lg overflow-hidden">
                                    <img
                                        src={image.imageUrl}
                                        alt={image.imageName}
                                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-200 cursor-pointer"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="border-b border-gray-200">
                    <nav className="flex space-x-8 px-6 overflow-x-auto" aria-label="Tabs">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors whitespace-nowrap ${activeTab === tab.id
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                >
                                    <Icon size={16} />
                                    <span>{tab.name}</span>
                                </button>
                            );
                        })}
                    </nav>
                </div>

                <div className="p-6">
                    {ActiveTabComponent && (
                        <ActiveTabComponent
                            festival={festival}
                            festivalSchool={festivalSchool}
                            onStatusUpdate={updateFestivalSchoolStatus}
                            user={user}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminFestivalDetail;