import React, { useEffect, useState } from 'react';
import { Users, Heart, Calendar, Building2, CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../ui/LoadingSpinner';
import Notification from '../ui/Notification';

interface AdminStats {
  totalUsers: number;
  pendingDonors: number;
  activeRequests: number;
  totalHospitals: number;
}

interface PendingDonor {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  blood_type: string;
  created_at: string;
  status: string;
}

interface BloodRequest {
  id: string;
  patient_name: string;
  blood_type: string;
  quantity: number;
  urgency: string;
  hospital_name: string;
  status: string;
  created_at: string;
}

const AdminContent: React.FC = () => {
  const { profile } = useAuth();
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    pendingDonors: 0,
    activeRequests: 0,
    totalHospitals: 0,
  });
  const [pendingDonors, setPendingDonors] = useState<PendingDonor[]>([]);
  const [bloodRequests, setBloodRequests] = useState<BloodRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'info' | 'warning';
    message: string;
    isVisible: boolean;
  }>({
    type: 'success',
    message: '',
    isVisible: false,
  });

  useEffect(() => {
    if (profile?.role === 'admin') {
      fetchAdminData();
    }
  }, [profile]);

  const fetchAdminData = async () => {
    try {
      // Fetch stats
      const [usersResult, donorsResult, requestsResult, hospitalsResult] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('donor_registrations').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('blood_requests').select('*', { count: 'exact', head: true }).in('status', ['pending', 'approved']),
        supabase.from('hospitals').select('*', { count: 'exact', head: true }).eq('is_active', true),
      ]);

      setStats({
        totalUsers: usersResult.count || 0,
        pendingDonors: donorsResult.count || 0,
        activeRequests: requestsResult.count || 0,
        totalHospitals: hospitalsResult.count || 0,
      });

      // Fetch pending donors
      const { data: donorsData, error: donorsError } = await supabase
        .from('donor_registrations')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(10);

      if (donorsError) throw donorsError;
      setPendingDonors(donorsData || []);

      // Fetch blood requests
      const { data: requestsData, error: requestsError } = await supabase
        .from('blood_requests')
        .select('*')
        .in('status', ['pending', 'approved'])
        .order('created_at', { ascending: false })
        .limit(10);

      if (requestsError) throw requestsError;
      setBloodRequests(requestsData || []);

    } catch (error) {
      console.error('Error fetching admin data:', error);
      showNotification('error', 'Gagal mengambil data admin');
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (type: 'success' | 'error' | 'info' | 'warning', message: string) => {
    setNotification({ type, message, isVisible: true });
  };

  const handleDonorApproval = async (donorId: string, approved: boolean) => {
    try {
      const { error } = await supabase
        .from('donor_registrations')
        .update({
          status: approved ? 'approved' : 'rejected',
          approved_by: profile?.id,
          approved_at: new Date().toISOString(),
        })
        .eq('id', donorId);

      if (error) throw error;

      showNotification('success', `Donor ${approved ? 'disetujui' : 'ditolak'} berhasil`);
      fetchAdminData();
    } catch (error) {
      console.error('Error updating donor status:', error);
      showNotification('error', 'Gagal memperbarui status donor');
    }
  };

  const handleRequestApproval = async (requestId: string, approved: boolean) => {
    try {
      const { error } = await supabase
        .from('blood_requests')
        .update({
          status: approved ? 'approved' : 'cancelled',
        })
        .eq('id', requestId);

      if (error) throw error;

      showNotification('success', `Permintaan ${approved ? 'disetujui' : 'dibatalkan'} berhasil`);
      fetchAdminData();
    } catch (error) {
      console.error('Error updating request status:', error);
      showNotification('error', 'Gagal memperbarui status permintaan');
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'emergency': return 'text-red-600 bg-red-100';
      case 'high': return 'text-yellow-600 bg-yellow-100';
      case 'normal': return 'text-blue-600 bg-blue-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (profile?.role !== 'admin') {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Akses Terbatas</h2>
        <p className="text-gray-600">Anda tidak memiliki akses ke halaman admin.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Notification
        type={notification.type}
        message={notification.message}
        isVisible={notification.isVisible}
        onClose={() => setNotification(prev => ({ ...prev, isVisible: false }))}
      />

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-blue-50 rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Pengguna</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalUsers}</p>
            </div>
            <div className="bg-blue-500 p-3 rounded-lg">
              <Users className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Donor Pending</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.pendingDonors}</p>
            </div>
            <div className="bg-yellow-500 p-3 rounded-lg">
              <Clock className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-red-50 rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Permintaan Aktif</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.activeRequests}</p>
            </div>
            <div className="bg-red-500 p-3 rounded-lg">
              <Heart className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-green-50 rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Rumah Sakit</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalHospitals}</p>
            </div>
            <div className="bg-green-500 p-3 rounded-lg">
              <Building2 className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Donors */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Donor Menunggu Persetujuan</h3>
          </div>
          <div className="p-6">
            {pendingDonors.length === 0 ? (
              <p className="text-gray-500 text-center py-4">Tidak ada donor yang menunggu persetujuan</p>
            ) : (
              <div className="space-y-4">
                {pendingDonors.map((donor) => (
                  <div key={donor.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{donor.full_name}</h4>
                        <p className="text-sm text-gray-600">{donor.email}</p>
                        <p className="text-sm text-gray-600">{donor.phone}</p>
                        <div className="flex items-center mt-2">
                          <span className="text-lg font-bold text-red-600 mr-2">{donor.blood_type}</span>
                          <span className="text-xs text-gray-500">
                            {new Date(donor.created_at).toLocaleDateString('id-ID')}
                          </span>
                        </div>
                      </div>
                      <div className="flex space-x-2 ml-4">
                        <button
                          onClick={() => handleDonorApproval(donor.id, true)}
                          className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors"
                          title="Setujui"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDonorApproval(donor.id, false)}
                          className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                          title="Tolak"
                        >
                          <XCircle className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Blood Requests */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Permintaan Darah Aktif</h3>
          </div>
          <div className="p-6">
            {bloodRequests.length === 0 ? (
              <p className="text-gray-500 text-center py-4">Tidak ada permintaan darah aktif</p>
            ) : (
              <div className="space-y-4">
                {bloodRequests.map((request) => (
                  <div key={request.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{request.patient_name}</h4>
                        <p className="text-sm text-gray-600">{request.hospital_name}</p>
                        <div className="flex items-center mt-2 space-x-4">
                          <span className="text-lg font-bold text-red-600">{request.blood_type}</span>
                          <span className="text-sm text-gray-600">{request.quantity} kantong</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getUrgencyColor(request.urgency)}`}>
                            {request.urgency}
                          </span>
                        </div>
                        <span className="text-xs text-gray-500">
                          {new Date(request.created_at).toLocaleDateString('id-ID')}
                        </span>
                      </div>
                      {request.status === 'pending' && (
                        <div className="flex space-x-2 ml-4">
                          <button
                            onClick={() => handleRequestApproval(request.id, true)}
                            className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors"
                            title="Setujui"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleRequestApproval(request.id, false)}
                            className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                            title="Tolak"
                          >
                            <XCircle className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminContent;