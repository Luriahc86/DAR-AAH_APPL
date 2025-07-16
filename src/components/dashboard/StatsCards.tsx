import React from 'react';
import { Heart, Users, Calendar, AlertTriangle } from 'lucide-react';

interface StatsCardsProps {
  totalDonors: number;
  totalDonations: number;
  pendingRequests: number;
  criticalStock: number;
}

const StatsCards: React.FC<StatsCardsProps> = ({
  totalDonors,
  totalDonations,
  pendingRequests,
  criticalStock,
}) => {
  const cards = [
    {
      title: 'Total Donor',
      value: totalDonors,
      icon: Users,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Total Donasi',
      value: totalDonations,
      icon: Heart,
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Permintaan Tertunda',
      value: pendingRequests,
      icon: Calendar,
      color: 'bg-yellow-500',
      bgColor: 'bg-yellow-50',
    },
    {
      title: 'Stok Kritis',
      value: criticalStock,
      icon: AlertTriangle,
      color: 'bg-red-500',
      bgColor: 'bg-red-50',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <div key={index} className={`${card.bgColor} rounded-xl p-6 border border-gray-200`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{card.title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{card.value}</p>
              </div>
              <div className={`${card.color} p-3 rounded-lg`}>
                <Icon className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default StatsCards;