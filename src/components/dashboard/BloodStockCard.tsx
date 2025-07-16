import React from 'react';
import { Droplets, TrendingUp, TrendingDown } from 'lucide-react';

interface BloodStock {
  blood_type: string;
  quantity: number;
  status: 'abundant' | 'sufficient' | 'limited' | 'critical';
}

interface BloodStockCardProps {
  stocks: BloodStock[];
}

const BloodStockCard: React.FC<BloodStockCardProps> = ({ stocks }) => {
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

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Stok Darah</h3>
        <Droplets className="h-6 w-6 text-red-600" />
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stocks.map((stock) => (
          <div key={stock.blood_type} className="bg-gray-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-red-600 mb-1">
              {stock.blood_type}
            </div>
            <div className="text-lg font-semibold text-gray-900 mb-2">
              {stock.quantity} kantong
            </div>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(stock.status)}`}>
              {stock.status === 'critical' || stock.status === 'limited' ? (
                <TrendingDown className="h-3 w-3 mr-1" />
              ) : (
                <TrendingUp className="h-3 w-3 mr-1" />
              )}
              {getStatusLabel(stock.status)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BloodStockCard;