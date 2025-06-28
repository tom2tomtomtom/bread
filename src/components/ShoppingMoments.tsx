import React from 'react';

interface ShoppingMomentsProps {
  onMomentSelect: (moment: { name: string; date: string; brief: string }) => void;
}

export const ShoppingMoments: React.FC<ShoppingMomentsProps> = ({ onMomentSelect }) => {
  const shoppingMoments = [
    { 
      name: 'Black Friday', 
      date: 'November 24',
      brief: 'Black Friday is approaching. Generate creative territories for a major retail campaign targeting deal-seeking consumers. Focus on urgency, value, and limited-time offers. Key messaging should emphasize massive savings, exclusive deals, and the fear of missing out. Target audience includes bargain hunters, early holiday shoppers, and families preparing for Christmas. Competitive context includes every major retailer offering deep discounts. Differentiate through unique product bundles, extended warranties, or early access for loyal customers.'
    },
    { 
      name: 'Christmas', 
      date: 'December 25',
      brief: 'Christmas campaign targeting families and gift-givers during the peak holiday season. Create territories that evoke warmth, tradition, and magical moments. Focus on emotional connection, family gatherings, and the joy of giving. Target audience includes parents, gift-givers, and anyone celebrating Christmas. Key messaging should highlight perfect gifts, creating memories, and bringing families together. Differentiate from competitors through personalization, convenience, or exclusive holiday experiences.'
    },
    { 
      name: 'EOFY Sales', 
      date: 'June 30',
      brief: 'End of Financial Year sales campaign targeting Australian businesses and consumers looking to maximize tax benefits and savings. Generate territories focused on smart financial decisions, business investments, and year-end purchases. Target audience includes business owners, accountants, and savvy consumers. Key messaging should emphasize tax deductions, business growth, and limited-time financial advantages. Competitive landscape includes all major retailers and B2B suppliers offering EOFY specials.'
    },
    { 
      name: 'Back to School', 
      date: 'January',
      brief: 'Back to School campaign targeting parents and students preparing for the new academic year. Create territories around fresh starts, academic success, and being prepared. Focus on quality, durability, and helping students achieve their best. Target audience includes parents with school-age children, university students, and teachers. Key messaging should highlight educational value, quality products, and setting students up for success. Differentiate through educational partnerships, bulk discounts, or learning resources.'
    },
    { 
      name: "Mother's Day", 
      date: 'May 14',
      brief: "Mother's Day campaign celebrating and honoring mothers with thoughtful gifts and experiences. Generate territories that capture appreciation, love, and recognition of mothers' sacrifices. Focus on emotional connection, gratitude, and making mothers feel special. Target audience includes adult children, partners, and families wanting to show appreciation. Key messaging should emphasize love, appreciation, and unique ways to honor mothers. Differentiate through personalization, experiences, or supporting working mothers."
    },
    { 
      name: "Father's Day", 
      date: 'September 3',
      brief: "Father's Day campaign in Australia celebrating fathers and father figures. Create territories around appreciation, masculinity, and recognizing fathers' contributions. Focus on practical gifts, experiences, and quality time. Target audience includes adult children, partners, and families honoring father figures. Key messaging should highlight respect, admiration, and ways to celebrate fatherhood. Differentiate through experiences, practical solutions, or supporting modern fatherhood roles."
    },
    { 
      name: 'Australia Day', 
      date: 'January 26',
      brief: 'Australia Day campaign celebrating Australian culture, values, and community spirit. Generate territories around national pride, mateship, and Australian lifestyle. Focus on bringing communities together, celebrating diversity, and supporting local. Target audience includes Australian families, communities, and anyone celebrating Australian culture. Key messaging should emphasize unity, Australian-made products, and community celebration. Differentiate through local partnerships, Australian suppliers, or community events.'
    },
    { 
      name: "Valentine's Day", 
      date: 'February 14',
      brief: "Valentine's Day campaign targeting couples and romantics celebrating love and relationships. Create territories around romance, intimacy, and expressing love. Focus on thoughtful gestures, memorable experiences, and emotional connection. Target audience includes couples, partners, and singles celebrating self-love. Key messaging should emphasize romance, thoughtfulness, and creating special moments. Differentiate through personalization, unique experiences, or supporting long-distance relationships."
    },
  ];

  return (
    <div className="mb-8">
      <h3 className="text-xl font-bold mb-6 text-gray-200">QUICK START: SHOPPING MOMENTS</h3>
      <p className="text-sm text-gray-400 mb-4">Click any moment to populate your brief field with a complete campaign brief</p>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {shoppingMoments.map((moment, index) => (
          <button
            key={index}
            onClick={() => onMomentSelect(moment)}
            title={`Click to load ${moment.name} campaign brief`}
            className="group relative backdrop-blur-sm bg-white/5 hover:bg-white/10 border border-white/10 hover:border-yellow-400/30 p-4 rounded-xl text-left transition-all duration-300 hover:shadow-lg hover:shadow-yellow-400/10 hover:scale-105"
          >
            <div className="font-bold text-white group-hover:text-yellow-400 transition-colors">{moment.name}</div>
            <div className="text-sm text-gray-400 mb-2">{moment.date}</div>
            <div className="text-xs text-gray-500 group-hover:text-gray-300 transition-colors line-clamp-2">
              {moment.brief.substring(0, 80)}...
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-yellow-400/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-xl"></div>
          </button>
        ))}
      </div>
    </div>
  );
};
