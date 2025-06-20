interface PricingCardProps {
  title: string;
  emoji: string;
  description: string;
  features: Array<{
    emoji: string;
    text: string;
  }>;
  price: string;
  priceSubtext?: string;
  isPopular?: boolean;
  borderColor?: 'gray' | 'purple';
}

export default function PricingCard({
  title,
  emoji,
  description,
  features,
  price,
  priceSubtext,
  isPopular = false,
  borderColor = 'gray'
}: PricingCardProps) {
  const borderClass = borderColor === 'purple' ? 'border-purple-300' : 'border-gray-200';

  // Add animated border for Pro plan
  if (title === 'Pro') {
    return (
      <div className="relative p-[2px] rounded-xl sm:rounded-2xl bg-gradient-to-r from-cyan-500 via-purple-500 to-cyan-500 bg-[length:200%_200%] animate-gradient">
        {/* Most Popular Badge - positioned relative to border container */}
        {isPopular && (
          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-50">
            <span className="bg-gradient-to-r from-cyan-500 to-purple-600 text-white px-4 sm:px-6 py-1 sm:py-2 rounded-full text-xs sm:text-sm font-semibold shadow-lg">Most Popular</span>
          </div>
        )}
        

        
        {/* Card content */}
        <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-8 shadow-lg hover:shadow-xl transition-shadow flex flex-col h-full relative z-10">
          
          <div className="text-center mb-4 sm:mb-6">
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1 sm:mb-2">{emoji} {title}</h3>
            <p className="text-sm sm:text-base text-gray-600">{description}</p>
          </div>
          
          <div className="space-y-2 sm:space-y-3 mb-6 sm:mb-8 flex-grow">
            {features.map((feature, index) => (
              <div key={index} className="flex items-start">
                <span className="text-base sm:text-lg mr-2 sm:mr-3">{feature.emoji}</span>
                <span className="text-sm sm:text-base text-gray-700">{feature.text}</span>
              </div>
            ))}
          </div>
          
          <div className="text-center border-t pt-4 sm:pt-6 mt-auto">
            <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">
              {price}
              {priceSubtext && <span className="text-base sm:text-lg font-normal text-gray-600">{priceSubtext}</span>}
            </div>
            <button className="w-full bg-purple-600 text-white py-2 sm:py-3 px-4 sm:px-6 rounded-lg hover:bg-purple-700 transition-colors font-semibold text-sm sm:text-base">
              Contact Sales
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Regular card for Basic and Enterprise
  return (
    <div className={`bg-white border-2 ${borderClass} rounded-xl sm:rounded-2xl p-4 sm:p-8 shadow-lg hover:shadow-xl transition-shadow flex flex-col h-full relative`}>
      {isPopular && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <span className="bg-purple-600 text-white px-3 sm:px-4 py-1 rounded-full text-xs sm:text-sm font-semibold">Most Popular</span>
        </div>
      )}
      
      <div className="text-center mb-4 sm:mb-6">
        <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1 sm:mb-2">{emoji} {title}</h3>
        <p className="text-sm sm:text-base text-gray-600">{description}</p>
      </div>
      
      <div className="space-y-2 sm:space-y-3 mb-6 sm:mb-8 flex-grow">
        {features.map((feature, index) => (
          <div key={index} className="flex items-start">
            <span className="text-base sm:text-lg mr-2 sm:mr-3">{feature.emoji}</span>
            <span className="text-sm sm:text-base text-gray-700">{feature.text}</span>
          </div>
        ))}
      </div>
      
      <div className="text-center border-t pt-4 sm:pt-6 mt-auto">
        <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">
          {price}
          {priceSubtext && <span className="text-base sm:text-lg font-normal text-gray-600">{priceSubtext}</span>}
        </div>
        <button className="w-full bg-purple-600 text-white py-2 sm:py-3 px-4 sm:px-6 rounded-lg hover:bg-purple-700 transition-colors font-semibold text-sm sm:text-base">
          Contact Sales
        </button>
      </div>
    </div>
  );
} 