import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { User, Phone, Mail, MapPin, Calendar, Heart, Save, Edit } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../ui/LoadingSpinner';
import Notification from '../ui/Notification';

interface ProfileFormData {
  full_name: string;
  phone: string;
  blood_type?: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
  date_of_birth?: string;
  gender?: 'male' | 'female';
  address?: string;
  city?: string;
  emergency_contact?: string;
  emergency_phone?: string;
}

const ProfileContent: React.FC = () => {
  const { profile, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'info' | 'warning';
    message: string;
    isVisible: boolean;
  }>({
    type: 'success',
    message: '',
    isVisible: false,
  });

  const { register, handleSubmit, formState: { errors }, reset } = useForm<ProfileFormData>({
    defaultValues: {
      full_name: profile?.full_name || '',
      phone: profile?.phone || '',
      blood_type: profile?.blood_type || undefined,
      date_of_birth: profile?.date_of_birth || '',
      gender: profile?.gender || undefined,
      address: profile?.address || '',
      city: profile?.city || 'Balikpapan',
      emergency_contact: profile?.emergency_contact || '',
      emergency_phone: profile?.emergency_phone || '',
    }
  });

  const showNotification = (type: 'success' | 'error' | 'info' | 'warning', message: string) => {
    setNotification({ type, message, isVisible: true });
  };

  const onSubmit = async (data: ProfileFormData) => {
    setLoading(true);
    try {
      await updateProfile(data);
      setIsEditing(false);
      showNotification('success', 'Profil berhasil diperbarui');
    } catch (error) {
      console.error('Error updating profile:', error);
      showNotification('error', 'Gagal memperbarui profil');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    reset();
    setIsEditing(false);
  };

  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  return (
    <div className="space-y-6">
      <Notification
        type={notification.type}
        message={notification.message}
        isVisible={notification.isVisible}
        onClose={() => setNotification(prev => ({ ...prev, isVisible: false }))}
      />

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Profil Saya</h1>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit Profil
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6">
          {/* Profile Header */}
          <div className="flex items-center space-x-4 mb-8">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
              <User className="h-10 w-10 text-red-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{profile?.full_name}</h2>
              <p className="text-gray-600">{profile?.email}</p>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mt-1 capitalize">
                {profile?.role}
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Informasi Dasar</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nama Lengkap
                  </label>
                  {isEditing ? (
                    <input
                      {...register('full_name', { required: 'Nama lengkap wajib diisi' })}
                      type="text"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                  ) : (
                    <div className="flex items-center px-4 py-3 bg-gray-50 rounded-lg">
                      <User className="h-4 w-4 text-gray-400 mr-2" />
                      <span>{profile?.full_name}</span>
                    </div>
                  )}
                  {errors.full_name && (
                    <p className="mt-1 text-sm text-red-600">{errors.full_name.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nomor Telepon
                  </label>
                  {isEditing ? (
                    <input
                      {...register('phone')}
                      type="tel"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                  ) : (
                    <div className="flex items-center px-4 py-3 bg-gray-50 rounded-lg">
                      <Phone className="h-4 w-4 text-gray-400 mr-2" />
                      <span>{profile?.phone || 'Belum diisi'}</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <div className="flex items-center px-4 py-3 bg-gray-50 rounded-lg">
                    <Mail className="h-4 w-4 text-gray-400 mr-2" />
                    <span>{profile?.email}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Kota
                  </label>
                  {isEditing ? (
                    <input
                      {...register('city')}
                      type="text"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                  ) : (
                    <div className="flex items-center px-4 py-3 bg-gray-50 rounded-lg">
                      <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                      <span>{profile?.city || 'Belum diisi'}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Medical Information (for donors) */}
            {(profile?.role === 'donor' || profile?.blood_type) && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Informasi Medis</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Golongan Darah
                    </label>
                    {isEditing ? (
                      <select
                        {...register('blood_type')}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      >
                        <option value="">Pilih golongan darah</option>
                        {bloodTypes.map((type) => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    ) : (
                      <div className="flex items-center px-4 py-3 bg-gray-50 rounded-lg">
                        <Heart className="h-4 w-4 text-red-400 mr-2" />
                        <span className="font-bold text-red-600">
                          {profile?.blood_type || 'Belum diisi'}
                        </span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tanggal Lahir
                    </label>
                    {isEditing ? (
                      <input
                        {...register('date_of_birth')}
                        type="date"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      />
                    ) : (
                      <div className="flex items-center px-4 py-3 bg-gray-50 rounded-lg">
                        <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                        <span>{profile?.date_of_birth || 'Belum diisi'}</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Jenis Kelamin
                    </label>
                    {isEditing ? (
                      <select
                        {...register('gender')}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      >
                        <option value="">Pilih jenis kelamin</option>
                        <option value="male">Laki-laki</option>
                        <option value="female">Perempuan</option>
                      </select>
                    ) : (
                      <div className="flex items-center px-4 py-3 bg-gray-50 rounded-lg">
                        <User className="h-4 w-4 text-gray-400 mr-2" />
                        <span>
                          {profile?.gender === 'male' ? 'Laki-laki' : 
                           profile?.gender === 'female' ? 'Perempuan' : 'Belum diisi'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Address Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Alamat</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Alamat Lengkap
                </label>
                {isEditing ? (
                  <textarea
                    {...register('address')}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="Masukkan alamat lengkap"
                  />
                ) : (
                  <div className="px-4 py-3 bg-gray-50 rounded-lg">
                    <span>{profile?.address || 'Belum diisi'}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Emergency Contact */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Kontak Darurat</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nama Kontak Darurat
                  </label>
                  {isEditing ? (
                    <input
                      {...register('emergency_contact')}
                      type="text"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      placeholder="Nama kontak darurat"
                    />
                  ) : (
                    <div className="flex items-center px-4 py-3 bg-gray-50 rounded-lg">
                      <User className="h-4 w-4 text-gray-400 mr-2" />
                      <span>{profile?.emergency_contact || 'Belum diisi'}</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Telepon Kontak Darurat
                  </label>
                  {isEditing ? (
                    <input
                      {...register('emergency_phone')}
                      type="tel"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      placeholder="Nomor telepon kontak darurat"
                    />
                  ) : (
                    <div className="flex items-center px-4 py-3 bg-gray-50 rounded-lg">
                      <Phone className="h-4 w-4 text-gray-400 mr-2" />
                      <span>{profile?.emergency_phone || 'Belum diisi'}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Statistics (for donors) */}
            {profile?.role === 'donor' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Statistik Donor</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-red-50 p-4 rounded-lg">
                    <div className="flex items-center">
                      <Heart className="h-8 w-8 text-red-600 mr-3" />
                      <div>
                        <p className="text-sm text-gray-600">Total Donasi</p>
                        <p className="text-2xl font-bold text-red-600">{profile?.total_donations || 0}</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-center">
                      <Calendar className="h-8 w-8 text-blue-600 mr-3" />
                      <div>
                        <p className="text-sm text-gray-600">Donor Terakhir</p>
                        <p className="text-lg font-semibold text-blue-600">
                          {profile?.last_donation_date || 'Belum pernah'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            {isEditing && (
              <div className="flex justify-end space-x-4 pt-6 border-t">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center"
                >
                  {loading ? (
                    <>
                      <LoadingSpinner size="sm" className="mr-2" />
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Simpan
                    </>
                  )}
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfileContent;