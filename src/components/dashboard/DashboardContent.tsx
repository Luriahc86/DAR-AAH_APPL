import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import StatsCards from './StatsCards';
import BloodStockCard from './BloodStockCard';
import LoadingSpinner from '../ui/LoadingSpinner';

interface DashboardStats {
  totalDonors: number;
  totalDonations: number;
  pendingRequests: number;
  criticalStock: number;
}

interface BloodStock {
  blood_type: string;
  quantity: number;
  status: 'abundant' | 'sufficient' | 'limited' | 'critical';
}

const DashboardContent: React.FC = () => {
  const { profile } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalDonors: 0,
    totalDonations: 0,
    pendingRequests: 0,
    criticalStock: 0,
  });
  const [bloodStocks, setBloodStocks] = useState<BloodStock[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch blood stocks
      const { data: stockData, error: stockError } = await supabase
        .from('blood_stock')
        .select('blood_type, quantity, status')
        .order('blood_type');

      if (stockError) throw stockError;

      // Fetch donors count
      const { count: donorCount, error: donorError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'donor')
        .eq('is_active', true);

      if (donorError) throw donorError;

      // Fetch donations count
      const { count: donationCount, error: donationError } = await supabase
        .from('donations')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'completed');

      if (donationError) throw donationError;

      // Fetch pending requests count
      const { count: requestCount, error: requestError } = await supabase
        .from('blood_requests')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      if (requestError) throw requestError;

      // Count critical stock
      const criticalCount = stockData?.filter(stock => stock.status === 'critical').length || 0;

      setStats({
        totalDonors: donorCount || 0,
        totalDonations: donationCount || 0,
        pendingRequests: requestCount || 0,
        criticalStock: criticalCount,
      });

      setBloodStocks(stockData || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">
          Dashboard
        </h1>
        <div className="text-sm text-gray-500">
          Selamat datang, {profile?.full_name}
        </div>
      </div>

      <StatsCards
        totalDonors={stats.totalDonors}
        totalDonations={stats.totalDonations}
        pendingRequests={stats.pendingRequests}
        criticalStock={stats.criticalStock}
      />

      <BloodStockCard stocks={bloodStocks} />

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Aktivitas Terbaru</h3>
        <div className="space-y-4">
          <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">D</span>
              </div>
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-900">Donor baru terdaftar</p>
              <p className="text-xs text-gray-500">2 jam yang lalu</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">S</span>
              </div>
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-900">Stok darah O+ diperbarui</p>
              <p className="text-xs text-gray-500">3 jam yang lalu</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">R</span>
              </div>
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-900">Permintaan darah baru</p>
              <p className="text-xs text-gray-500">5 jam yang lalu</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardContent;