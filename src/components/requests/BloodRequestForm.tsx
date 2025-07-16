import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Droplets, Building2, User, Calendar, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../ui/LoadingSpinner';
import Modal from '../ui/Modal';

interface BloodRequestData {
  patientName: string;
  bloodType: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
  quantity: number;
  urgency: 'low' | 'normal' | 'high' | 'emergency';
  hospitalId?: string;
  hospitalName?: string;
  contactPerson: string;
  contactPhone: string;
  medicalReason?: string;
  requiredDate: string;
  notes?: string;
}

interface Hospital {
  id: string;
  name: string;
  address: string;
  phone: string;
}

interface BloodRequestFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const BloodRequestForm: React.FC<BloodRequestFormProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hospitals, setHospitals] = useState<Hospital[]>([]);

  const { register, handleSubmit, formState: { errors }, watch, reset } = useForm<BloodRequestData>();

  const selectedHospitalId = watch('hospitalId');

  useEffect(() => {
    if (isOpen) {
      fetchHospitals();
    }
  }, [isOpen]);

  const fetchHospitals = async () => {
    try {
      const { data, error } = await supabase
        .from('hospitals')
        .select('id, name, address, phone')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setHospitals(data || []);
    } catch (error) {
      console.error('Error fetching hospitals:', error);
    }
  };

  const onSubmit = async (data: BloodRequestData) => {
    setLoading(true);
    setError('');

    try {
      const selectedHospital = hospitals.find(h => h.id === data.hospitalId);
      
      const { error: insertError } = await supabase
        .from('blood_requests')
        .insert([{
          requester_id: user?.id,
          patient_name: data.patientName,
          blood_type: data.bloodType,
          quantity: data.quantity,
          urgency: data.urgency,
          hospital_id: data.hospitalId || null,
          hospital_name: selectedHospital?.name || data.hospitalName,
          contact_person: data.contactPerson,
          contact_phone: data.contactPhone,
          medical_reason: data.medicalReason,
          required_date: data.requiredDate,
          notes: data.notes,
          status: 'pending',
        }]);

      if (insertError) throw insertError;

      reset();
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Gagal membuat permintaan darah');
    } finally {
      setLoading(false);
    }
  };

  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  const urgencyOptions = [
    { value: 'low', label: 'Rendah', color: 'text-green-600' },
    { value: 'normal', label: 'Normal', color: 'text-blue-600' },
    { value: 'high', label: 'Tinggi', color: 'text-yellow-600' },
    { value: 'emergency', label: 'Darurat', color: 'text-red-600' },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Permintaan Darah" size="lg">
      <div className="space-y-6">
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center">
            <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Patient Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <User className="h-5 w-5 text-red-600 mr-2" />
              Informasi Pasien
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nama Pasien *
                </label>
                <input
                  {...register('patientName', { required: 'Nama pasien wajib diisi' })}
                  type="text"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Masukkan nama pasien"
                />
                {errors.patientName && (
                  <p className="mt-1 text-sm text-red-600">{errors.patientName.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Golongan Darah *
                </label>
                <select
                  {...register('bloodType', { required: 'Golongan darah wajib diisi' })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  <option value="">Pilih golongan darah</option>
                  {bloodTypes.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
                {errors.bloodType && (
                  <p className="mt-1 text-sm text-red-600">{errors.bloodType.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Jumlah Kantong *
                </label>
                <input
                  {...register('quantity', {
                    required: 'Jumlah kantong wajib diisi',
                    min: { value: 1, message: 'Minimal 1 kantong' },
                    max: { value: 10, message: 'Maksimal 10 kantong' }
                  })}
                  type="number"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Jumlah kantong darah"
                />
                {errors.quantity && (
                  <p className="mt-1 text-sm text-red-600">{errors.quantity.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tingkat Urgensi *
                </label>
                <select
                  {...register('urgency', { required: 'Tingkat urgensi wajib diisi' })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  <option value="">Pilih tingkat urgensi</option>
                  {urgencyOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {errors.urgency && (
                  <p className="mt-1 text-sm text-red-600">{errors.urgency.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tanggal Dibutuhkan *
                </label>
                <input
                  {...register('requiredDate', { required: 'Tanggal dibutuhkan wajib diisi' })}
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
                {errors.requiredDate && (
                  <p className="mt-1 text-sm text-red-600">{errors.requiredDate.message}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Alasan Medis
              </label>
              <textarea
                {...register('medicalReason')}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="Jelaskan alasan medis membutuhkan transfusi darah"
              />
            </div>
          </div>

          {/* Hospital Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Building2 className="h-5 w-5 text-red-600 mr-2" />
              Informasi Rumah Sakit
            </h3>

            {profile?.role === 'hospital' ? (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-800">
                  Permintaan akan dibuat atas nama rumah sakit Anda.
                </p>
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pilih Rumah Sakit
                </label>
                <select
                  {...register('hospitalId')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  <option value="">Pilih rumah sakit</option>
                  {hospitals.map((hospital) => (
                    <option key={hospital.id} value={hospital.id}>
                      {hospital.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {!selectedHospitalId && profile?.role !== 'hospital' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nama Rumah Sakit (jika tidak ada dalam daftar)
                </label>
                <input
                  {...register('hospitalName')}
                  type="text"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Masukkan nama rumah sakit"
                />
              </div>
            )}
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <User className="h-5 w-5 text-red-600 mr-2" />
              Kontak Person
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nama Kontak Person *
                </label>
                <input
                  {...register('contactPerson', { required: 'Nama kontak person wajib diisi' })}
                  type="text"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Nama yang dapat dihubungi"
                />
                {errors.contactPerson && (
                  <p className="mt-1 text-sm text-red-600">{errors.contactPerson.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nomor Telepon *
                </label>
                <input
                  {...register('contactPhone', { required: 'Nomor telepon wajib diisi' })}
                  type="tel"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Nomor telepon yang dapat dihubungi"
                />
                {errors.contactPhone && (
                  <p className="mt-1 text-sm text-red-600">{errors.contactPhone.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Additional Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Catatan Tambahan
            </label>
            <textarea
              {...register('notes')}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="Catatan atau informasi tambahan"
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
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
                  Mengirim...
                </>
              ) : (
                'Kirim Permintaan'
              )}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default BloodRequestForm;