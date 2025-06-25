import React from 'react';

interface ShoppingMomentsProps {
  onMomentSelect: (moment: { name: string; date: string }) => void;
}

export const ShoppingMoments: React.FC<ShoppingMomentsProps> = ({ onMomentSelect }) => {
  const shoppingMoments = [
    { name: 'Black Friday', date: 'November 24' },
    { name: 'Christmas', date: 'December 25' },
    { name: 'EOFY Sales', date: 'June 30' },
    { name: 'Back to School', date: 'January' },
    { name: "Mother's Day", date: 'May 14' },
    { name: "Father's Day", date: 'September 3' },
    { name: 'Australia Day', date: 'January 26' },
    { name: "Valentine's Day", date: 'February 14' },
  ];

  return (
    <div className="mb-8">
      <h3 className="text-xl font-bold mb-6 text-gray-200">QUICK START: SHOPPING MOMENTS</h3>
      <div className="grid grid-cols-4 gap-4">
        {shoppingMoments.map((moment, index) => (
          <button
            key={index}
            onClick={() => onMomentSelect(moment)}
            className="backdrop-blur-sm bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 p-4 rounded-xl text-left transition-all duration-300 hover:shadow-lg hover:shadow-white/5 hover:scale-105"
          >
            <div className="font-bold text-white">{moment.name}</div>
            <div className="text-sm text-gray-400">{moment.date}</div>
          </button>
        ))}
      </div>
    </div>
  );
};
