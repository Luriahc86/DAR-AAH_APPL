import React, { useEffect, useState } from 'react';
import { Plus, Search, Filter } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../ui/LoadingSpinner';
import Modal from '../ui/Modal';
import Notification from '../ui/Notification';

interface BloodStock {
  id: string;
  blood_type: string;
  quantity: number;
  reserved_quantity: number;
  status: 'abundant' | 'sufficient' | 'limited' | 'critical';
  location: string;
  batch_number: string;
  notes: string;
  last_updated: string;
}

const BloodStockContent: React.FC = () => {
  const { profile } = useAuth();
  const [stocks, setStocks] = useState<BloodStock[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingStock, setEditingStock] = useState<BloodStock | null>(null);
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
    fetchBloodStocks();
  }, []);

  const fetchBloodStocks = async () => {
    try {
      const { data, error } = await supabase
        .from('blood_stock')
        .select('*')
        .order('blood_type');

      if (error) throw error;
      setStocks(data || []);
    } catch (error) {
      console.error('Error fetching blood stocks:', error);
      showNotification('error', 'Gagal mengambil data stok darah');
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (type: 'success' | 'error' | 'info' | 'warning', message: string) => {
    setNotification({ type, message, isVisible: true });
  };

  const handleUpdateStock = async (stockId: string, newQuantity: number) => {
    try {
      const { error } = await supabase
        .from('blood_stock')
        .update({ 
          quantity: newQuantity,
          last_updated: new Date().toISOString()
        })
        .eq('id', stockId);

      if (error) throw error;
      
      await fetchBloodStocks();
      showNotification('success', 'Stok darah berhasil diperbarui');
    } catch (error) {
      console.error('Error updating blood stock:', error);
      showNotification('error', 'Gagal memperbarui stok darah');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'abundant':
        return 'bg-green-100 text-green-800';
      case 'sufficient':
        return 'bg-blue-100 text-blue-800';
      case 'limited':
        return 'bg-yellow-100 text-yellow-800';
      case 'critical':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'abundant':
        return 'Berlimpah';
      case 'sufficient':
        return 'Cukup';
      case 'limited':
        return 'Terbatas';
      case 'critical':
        return 'Kritis';
      default:
        return 'Unknown';
    }
  };

  const filteredStocks = stocks.filter((stock) => {
    const matchesSearch = stock.blood_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         stock.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || stock.status === filterStatus;
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
        <h1 className="text-2xl font-bold text-gray-900">Stok Darah</h1>
        {profile?.role === 'admin' && (
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            Tambah Stok
          </button>
        )}
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Cari golongan darah atau lokasi..."
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
            <option value="abundant">Berlimpah</option>
            <option value="sufficient">Cukup</option>
            <option value="limited">Terbatas</option>
            <option value="critical">Kritis</option>
          </select>
        </div>
      </div>

      {/* Stock Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStocks.map((stock) => (
          <div key={stock.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="text-3xl font-bold text-red-600">{stock.blood_type}</div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(stock.status)}`}>
                {getStatusLabel(stock.status)}
              </span>
            </div>
            
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Tersedia:</span>
                <span className="font-medium">{stock.quantity} kantong</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Direservasi:</span>
                <span className="font-medium">{stock.reserved_quantity} kantong</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Lokasi:</span>
                <span className="font-medium">{stock.location}</span>
              </div>
            </div>

            {profile?.role === 'admin' && (
              <div className="space-y-2">
                <input
                  type="number"
                  placeholder="Jumlah baru"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      const newQuantity = parseInt((e.target as HTMLInputElement).value);
                      if (!isNaN(newQuantity) && newQuantity >= 0) {
                        handleUpdateStock(stock.id, newQuantity);
                        (e.target as HTMLInputElement).value = '';
                      }
                    }
                  }}
                />
                <button
                  onClick={() => {
                    setEditingStock(stock);
                    setShowModal(true);
                  }}
                  className="w-full px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                >
                  Edit Detail
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredStocks.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">Tidak ada stok darah yang ditemukan</p>
        </div>
      )}

      {/* Modal for adding/editing stock */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingStock(null);
        }}
        title={editingStock ? 'Edit Stok Darah' : 'Tambah Stok Darah'}
        size="md"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            {editingStock ? 'Edit informasi stok darah' : 'Tambah stok darah baru'}
          </p>
          {/* Form would go here */}
        </div>
      </Modal>
    </div>
  );
};

export default BloodStockContent;