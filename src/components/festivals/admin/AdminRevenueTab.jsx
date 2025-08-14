import React, { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, Store, Wallet, Download, AlertCircle, CheckCircle, Banknote, Calculator, Minus } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { boothServices } from '../../../services/boothServices';
import { boothWalletServices } from '../../../services/boothWalletServices';
import { festivalServices } from '../../../services/festivalServices';
import { accountFestivalWalletsServices } from '../../../services/accountFestivalWalletsServices';
import { accountWalletHistoriesServices } from '../../../services/accountWalletHistoryServices';
import { formatPrice } from '../../../utils/helpers';
import { HISTORY_TYPE, FESTIVAL_STATUS } from '../../../utils/constants';
import { useAuth } from '../../../contexts/AuthContext';

const AdminRevenueTab = ({ festival }) => {
    const { user } = useAuth();
    const [booths, setBooths] = useState([]);
    const [boothRevenues, setBoothRevenues] = useState({});
    const [festivalWallet, setFestivalWallet] = useState(null);
    const [loading, setLoading] = useState(true);
    const [commissionLoading, setCommissionLoading] = useState(false);
    const [commissionRate, setCommissionRate] = useState(10);
    const [showCommissionModal, setShowCommissionModal] = useState(false);
    const [hasCommissionWithdrawn, setHasCommissionWithdrawn] = useState(false);
    const [checkingCommission, setCheckingCommission] = useState(true);
    const [withdrawnCommissionAmount, setWithdrawnCommissionAmount] = useState(0);

    useEffect(() => {
        loadRevenueData();
        checkCommissionStatus();
    }, [festival.festivalId]);

    const loadRevenueData = async () => {
        try {
            setLoading(true);

            const boothsResponse = await boothServices.get({ festivalId: festival.festivalId });
            const boothsData = boothsResponse.data || [];
            setBooths(boothsData);

            const revenuePromises = boothsData.map(async (booth) => {
                try {
                    const walletResponse = await boothWalletServices.get({ boothId: booth.boothId });
                    return {
                        boothId: booth.boothId,
                        revenue: walletResponse.data?.[0]?.totalBalance || 0
                    };
                } catch (error) {
                    console.error(`Error loading revenue for booth ${booth.boothId}:`, error);
                    return { boothId: booth.boothId, revenue: 0 };
                }
            });

            const revenueResults = await Promise.all(revenuePromises);
            const revenueMap = {};
            revenueResults.forEach(result => {
                revenueMap[result.boothId] = result.revenue;
            });
            setBoothRevenues(revenueMap);

            await loadFestivalWallet();

        } catch (error) {
            console.error('Error loading revenue data:', error);
            toast.error('Không thể tải dữ liệu doanh thu');
        } finally {
            setLoading(false);
        }
    };

    const loadFestivalWallet = async () => {
        try {
            const walletResponse = await accountFestivalWalletsServices.get({
                accountId: user.id,
                festivalId: festival.festivalId
            });

            console.log("walletResponse: ", walletResponse)

            if (walletResponse.data && walletResponse.data.length > 0) {
                setFestivalWallet(walletResponse.data[0]);
            }
        } catch (error) {
            console.error('Error loading festival wallet:', error);
        }
    };

    const checkCommissionStatus = async () => {
        try {
            setCheckingCommission(true);
            const historyResponse = await accountWalletHistoriesServices.get({
                type: HISTORY_TYPE.COMMISSION,
                accountId: user.id
            });

            const commissionHistory = historyResponse.data?.find(history =>
                history.description && history.description.includes(festival.festivalName)
            );

            if (commissionHistory) {
                setHasCommissionWithdrawn(true);
                setWithdrawnCommissionAmount(commissionHistory.amount || 0);
            }
        } catch (error) {
            console.error('Error checking commission status:', error);
        } finally {
            setCheckingCommission(false);
        }
    };

    const calculateTotalBoothRevenue = () => {
        return Object.values(boothRevenues).reduce((total, revenue) => total + revenue, 0);
    };

    const calculateCommissionAmount = () => {
        const totalRevenue = festival.totalRevenue || 0;
        return Math.floor(totalRevenue * (commissionRate / 100));
    };

    const calculateProfitAfterCommission = () => {
        const totalRevenue = festival.totalRevenue || 0;
        return totalRevenue - withdrawnCommissionAmount;
    };

    const handleWithdrawCommission = async () => {
        try {
            setCommissionLoading(true);

            const response = await festivalServices.calculateCommission({
                festivalId: festival.festivalId,
                commissionRate: commissionRate
            });

            toast.success('Tiền hoa hồng đã trở về ví phụ của lễ hội này');

            await loadFestivalWallet();

            const commissionAmount = calculateCommissionAmount();
            await accountWalletHistoriesServices.create({
                accountId: user.id,
                description: `Rút hoa hồng từ lễ hội ${festival.festivalName}`,
                amount: commissionAmount,
                type: HISTORY_TYPE.COMMISSION
            });

            setShowCommissionModal(false);
            setHasCommissionWithdrawn(true);
            setWithdrawnCommissionAmount(commissionAmount);
            toast.success('Đã ghi nhận lịch sử rút hoa hồng');

        } catch (error) {
            console.error('Error withdrawing commission:', error);
            toast.error('Có lỗi xảy ra khi rút hoa hồng');
        } finally {
            setCommissionLoading(false);
        }
    };

    const getRevenueStats = () => {
        const totalBoothRevenue = calculateTotalBoothRevenue();
        const totalFestivalRevenue = festival.totalRevenue || 0;
        const profitAfterCommission = calculateProfitAfterCommission();
        const totalBooths = booths.length;
        const activeBooths = booths.filter(booth => booth.status === 'active').length;
        const averageRevenuePerBooth = activeBooths > 0 ? totalBoothRevenue / activeBooths : 0;
        const topBooth = booths.reduce((top, booth) => {
            const revenue = boothRevenues[booth.boothId] || 0;
            const topRevenue = boothRevenues[top?.boothId] || 0;
            return revenue > topRevenue ? booth : top;
        }, null);

        return {
            totalBoothRevenue,
            totalFestivalRevenue,
            profitAfterCommission,
            totalBooths,
            activeBooths,
            averageRevenuePerBooth,
            topBooth,
            topBoothRevenue: topBooth ? boothRevenues[topBooth.boothId] || 0 : 0
        };
    };

    const stats = getRevenueStats();

    if (loading || checkingCommission) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600">Đang tải dữ liệu doanh thu...</span>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-xl text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-blue-100 text-sm font-medium">Tổng doanh thu lễ hội</p>
                            <p className="text-2xl font-bold">{formatPrice(stats.totalFestivalRevenue)}</p>
                            <p className="text-xs text-blue-200">Doanh thu trước khi rút hoa hồng</p>
                        </div>
                        <DollarSign size={32} className="text-blue-200" />
                    </div>
                </div>

                <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 rounded-xl text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-green-100 text-sm font-medium">Doanh thu gian hàng</p>
                            <p className="text-2xl font-bold">{formatPrice(stats.totalBoothRevenue)}</p>
                            <p className="text-xs text-green-200">Tổng từ {stats.activeBooths} gian hàng</p>
                        </div>
                        <Store size={32} className="text-green-200" />
                    </div>
                </div>

                <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-6 rounded-xl text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-purple-100 text-sm font-medium">Lợi nhuận sau hoa hồng</p>
                            <p className="text-2xl font-bold">{formatPrice(stats.profitAfterCommission)}</p>
                            <p className="text-xs text-purple-200">
                                {hasCommissionWithdrawn ? 
                                    `Đã rút ${formatPrice(withdrawnCommissionAmount)}` : 
                                    'Chưa rút hoa hồng'
                                }
                            </p>
                        </div>
                        {hasCommissionWithdrawn ? (
                            <Minus size={32} className="text-purple-200" />
                        ) : (
                            <TrendingUp size={32} className="text-purple-200" />
                        )}
                    </div>
                </div>

                <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-6 rounded-xl text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-orange-100 text-sm font-medium">
                                {hasCommissionWithdrawn ? 'Hoa hồng đã rút' : 'Hoa hồng ước tính'}
                            </p>
                            <p className="text-xl font-bold">
                                {hasCommissionWithdrawn ? 
                                    formatPrice(withdrawnCommissionAmount) : 
                                    formatPrice(calculateCommissionAmount())
                                }
                            </p>
                            <p className="text-xs text-orange-200">
                                {hasCommissionWithdrawn ? 
                                    'Đã chuyển vào ví phụ' : 
                                    `(${commissionRate}%)`
                                }
                            </p>
                        </div>
                        <Calculator size={32} className="text-orange-200" />
                    </div>
                </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                            <Banknote className="text-green-500" size={20} />
                            Rút hoa hồng
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                            Rút hoa hồng từ tổng doanh thu của lễ hội
                        </p>
                    </div>

                    {hasCommissionWithdrawn ? (
                        <div className="flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 rounded-lg">
                            <CheckCircle size={16} className="text-green-600" />
                            <span className="text-sm font-medium text-green-800">Đã rút hoa hồng</span>
                        </div>
                    ) : (
                        <button
                            onClick={() => setShowCommissionModal(true)}
                            disabled={stats.totalFestivalRevenue === 0}
                            className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                        >
                            <Wallet size={16} />
                            Rút hoa hồng
                        </button>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <div className="p-4 bg-gray-50 rounded-lg">
                            <h4 className="font-medium text-gray-900 mb-3">Thông tin doanh thu</h4>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Tổng doanh thu lễ hội:</span>
                                    <span className="font-medium text-blue-600">{formatPrice(stats.totalFestivalRevenue)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Tổng doanh thu các gian hàng:</span>
                                    <span className="font-medium text-green-600">{formatPrice(stats.totalBoothRevenue)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Tỷ lệ hoa hồng:</span>
                                    <span className="font-medium">{commissionRate}%</span>
                                </div>
                                <div className="flex justify-between border-t pt-2">
                                    <span className="text-gray-600">
                                        {hasCommissionWithdrawn ? 'Hoa hồng đã rút:' : 'Hoa hồng ước tính:'}
                                    </span>
                                    <span className="font-bold text-orange-600">
                                        {hasCommissionWithdrawn ? 
                                            formatPrice(withdrawnCommissionAmount) : 
                                            formatPrice(calculateCommissionAmount())
                                        }
                                    </span>
                                </div>
                                <div className="flex justify-between border-t pt-2">
                                    <span className="text-gray-600">Lợi nhuận sau hoa hồng:</span>
                                    <span className="font-bold text-purple-600">{formatPrice(stats.profitAfterCommission)}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {festivalWallet && (
                            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                                <h4 className="font-medium text-blue-900 mb-3">Ví phụ lễ hội</h4>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-blue-700">Tên ví:</span>
                                        <span className="font-medium text-blue-900">{festivalWallet.name}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-blue-700">Số dư hiện tại:</span>
                                        <span className="font-bold text-blue-900">{formatPrice(festivalWallet.balance)}</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {hasCommissionWithdrawn && (
                            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                                <div className="flex items-center gap-2 mb-2">
                                    <CheckCircle size={16} className="text-green-600" />
                                    <span className="font-medium text-green-800">Trạng thái</span>
                                </div>
                                <p className="text-sm text-green-700">
                                    Hoa hồng {formatPrice(withdrawnCommissionAmount)} đã được rút thành công. 
                                    Kiểm tra lịch sử ví để xem chi tiết.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {stats.topBooth && (
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <TrendingUp className="text-yellow-500" size={20} />
                        Gian hàng có doanh thu cao nhất
                    </h3>

                    <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="font-semibold text-gray-900">{stats.topBooth.boothName}</h4>
                                <p className="text-sm text-gray-600">
                                    {stats.topBooth.boothType} • ID: {stats.topBooth.boothId}
                                </p>
                                {stats.topBooth.description && (
                                    <p className="text-sm text-gray-500 mt-1">{stats.topBooth.description}</p>
                                )}
                            </div>
                            <div className="text-right">
                                <p className="text-2xl font-bold text-green-600">{formatPrice(stats.topBoothRevenue)}</p>
                                <p className="text-sm text-gray-600">doanh thu</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-900">Chi tiết doanh thu từng gian hàng</h3>
                        <div className="text-sm text-gray-600">
                            Tổng: {formatPrice(stats.totalBoothRevenue)} từ {stats.activeBooths} gian hàng hoạt động
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Gian hàng
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Loại
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Trạng thái
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Doanh thu
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    % Tổng doanh thu gian hàng
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {booths
                                .sort((a, b) => (boothRevenues[b.boothId] || 0) - (boothRevenues[a.boothId] || 0))
                                .map((booth) => {
                                    const revenue = boothRevenues[booth.boothId] || 0;
                                    const percentage = stats.totalBoothRevenue > 0 ? (revenue / stats.totalBoothRevenue * 100) : 0;

                                    return (
                                        <tr key={booth.boothId} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">{booth.boothName}</div>
                                                    <div className="text-sm text-gray-500">ID: {booth.boothId}</div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                    {booth.boothType}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${booth.status === 'active'
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-gray-100 text-gray-800'
                                                    }`}>
                                                    {booth.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right">
                                                <div className="text-sm font-medium text-gray-900">{formatPrice(revenue)}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right">
                                                <div className="text-sm text-gray-500">{percentage.toFixed(1)}%</div>
                                            </td>
                                        </tr>
                                    );
                                })}
                        </tbody>
                    </table>
                </div>

                {booths.length === 0 && (
                    <div className="text-center py-12">
                        <Store className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có gian hàng</h3>
                        <p className="text-gray-600">Lễ hội này chưa có gian hàng nào hoạt động.</p>
                    </div>
                )}
            </div>

            {showCommissionModal && (
                <div className="mt-0-important fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <Banknote size={20} className="text-green-600" />
                            Rút hoa hồng lễ hội
                        </h3>

                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Tỷ lệ hoa hồng (%)
                            </label>
                            <select
                                value={commissionRate}
                                onChange={(e) => setCommissionRate(parseInt(e.target.value))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            >
                                <option value={5}>5%</option>
                                <option value={10}>10%</option>
                                <option value={15}>15%</option>
                                <option value={20}>20%</option>
                                <option value={25}>25%</option>
                                <option value={30}>30%</option>
                            </select>
                        </div>

                        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                            <h4 className="font-medium text-gray-900 mb-3">Chi tiết rút tiền</h4>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Tổng doanh thu lễ hội:</span>
                                    <span className="font-medium">{formatPrice(stats.totalFestivalRevenue)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Tỷ lệ hoa hồng:</span>
                                    <span className="font-medium">{commissionRate}%</span>
                                </div>
                                <div className="flex justify-between border-t pt-2">
                                    <span className="text-gray-600">Số tiền rút:</span>
                                    <span className="font-bold text-green-600">{formatPrice(calculateCommissionAmount())}</span>
                                </div>
                            </div>
                        </div>

                        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <div className="flex items-start gap-2">
                                <AlertCircle size={16} className="text-yellow-600 mt-0.5" />
                                <div className="text-sm text-yellow-800">
                                    <p className="font-medium mb-1">Lưu ý:</p>
                                    <p>Số tiền hoa hồng sẽ được chuyển vào ví phụ của lễ hội này. Thao tác này không thể hoàn tác.</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex space-x-3">
                            <button
                                onClick={() => setShowCommissionModal(false)}
                                disabled={commissionLoading}
                                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={handleWithdrawCommission}
                                disabled={commissionLoading || calculateCommissionAmount() === 0}
                                className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                            >
                                {commissionLoading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                        Đang xử lý...
                                    </>
                                ) : (
                                    <>
                                        <Wallet size={16} />
                                        Xác nhận rút
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminRevenueTab;