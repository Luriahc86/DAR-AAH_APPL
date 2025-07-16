import React, { useEffect, useState } from 'react';
import { Plus, Search, Filter, Calendar, Building2, User, Phone } from 'lucide-react';
import { format } from 'date-fns';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../ui/LoadingSpinner';
import BloodRequestForm from './BloodRequestForm';
import Notification from '../ui/Notification';

interface BloodRequest {
  id: string;
  patient_name: string;
  blood_type: string;
  quantity: number;
  urgency: 'low' | 'normal' | 'high' | 'emergency';
  hospital_name: string;
  contact_person: string;
  contact_phone: string;
  medical_reason: string;
  required_date: string;
  status: 'pending' | 'approved' | 'fulfilled' | 'cancelled';
  created_at: string;
  requester: {
    full_name: string;
  };
}

const RequestsContent: React.FC = () => {
  const { profile } = useAuth();
  const [requests, setRequests] = useState<BloodRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showRequestModal, setShowRequestModal] = useState(false);
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
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      let query = supabase
        .from('blood_requests')
        .select(`
          *,
          requester:profiles!blood_requests_requester_id_fkey(full_name)
        `)
        .order('created_at', { ascending: false });

      // If not admin, only show user's own requests
      if (profile?.role !== 'admin') {
        query = query.eq('requester_id', profile?.id);
      }

      const { data, error } = await query;

      if (error) throw error;
      setRequests(data || []);
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (type: 'success' | 'error' | 'info' | 'warning', message: string) => {
    setNotification({ type, message, isVisible: true });
  };

  const handleRequestSuccess = () => {
    showNotification('success', 'Permintaan darah berhasil dikirim!');
    fetchRequests();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-blue-100 text-blue-800';
      case 'fulfilled':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Menunggu';
      case 'approved':
        return 'Disetujui';
      case 'fulfilled':
        return 'Terpenuhi';
      case 'cancelled':
        return 'Dibatalkan';
      default:
        return 'Unknown';
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'low':
        return 'text-green-600';
      case 'normal':
        return 'text-blue-600';
      case 'high':
        return 'text-yellow-600';
      case 'emergency':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getUrgencyLabel = (urgency: string) => {
    switch (urgency) {
      case 'low':
        return 'Rendah';
      case 'normal':
        return 'Normal';
      case 'high':
        return 'Tinggi';
      case 'emergency':
        return 'Darurat';
      default:
        return 'Unknown';
    }
  };

  const filteredRequests = requests.filter((request) => {
    const matchesSearch = 
      request.patient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.blood_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.hospital_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.contact_person.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || request.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

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

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Permintaan Darah</h1>
        <button
          onClick={() => setShowRequestModal(true)}
          className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" />
          Buat Permintaan
        </button>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Cari pasien, golongan darah, atau rumah sakit..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
          >
            <option value="all">Semua Status</option>
            <option value="pending">Menunggu</option>
            <option value="approved">Disetujui</option>
            <option value="fulfilled">Terpenuhi</option>
            <option value="cancelled">Dibatalkan</option>
          </select>
        </div>
      </div>

      {/* Requests Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredRequests.map((request) => (
          <div key={request.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{request.patient_name}</h3>
                <div className="flex items-center space-x-4 mt-1">
                  <div className="text-2xl font-bold text-red-600">{request.blood_type}</div>
                  <span className={`text-sm font-medium ${getUrgencyColor(request.urgency)}`}>
                    {getUrgencyLabel(request.urgency)}
                  </span>
                </div>
              </div>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                {getStatusLabel(request.status)}
              </span>
            </div>

            <div className="space-y-3">
              <div className="flex items-center text-sm text-gray-600">
                <Building2 className="h-4 w-4 mr-2" />
                {request.hospital_name || 'Rumah sakit tidak disebutkan'}
              </div>
              
              <div className="flex items-center text-sm text-gray-600">
                <User className="h-4 w-4 mr-2" />
                {request.contact_person}
              </div>
              
              <div className="flex items-center text-sm text-gray-600">
                <Phone className="h-4 w-4 mr-2" />
                {request.contact_phone}
              </div>
              
              <div className="flex items-center text-sm text-gray-600">
                <Calendar className="h-4 w-4 mr-2" />
                Dibutuhkan: {format(new Date(request.required_date), 'dd MMM yyyy')}
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-500">
                  Jumlah: <span className="font-medium text-gray-900">{request.quantity} kantong</span>
                </div>
                <div className="text-xs text-gray-400">
                  {format(new Date(request.created_at), 'dd MMM yyyy, HH:mm')}
                </div>
              </div>
              
              {request.medical_reason && (
                <div className="mt-2">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Alasan medis:</span> {request.medical_reason}
                  </p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredRequests.length === 0 && (
        <div className="text-center py-12">
          <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">Belum ada permintaan darah</p>
        </div>
      )}

      {/* Request Modal */}
      <BloodRequestForm
        isOpen={showRequestModal}
        onClose={() => setShowRequestModal(false)}
        onSuccess={handleRequestSuccess}
      />
    </div>
  );
};

export default RequestsContent;