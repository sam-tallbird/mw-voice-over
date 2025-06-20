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
      <div className="relative p-[2px] rounded-2xl bg-gradient-to-r from-cyan-500 via-purple-500 to-cyan-500 bg-[length:200%_200%] animate-gradient">
        {/* Most Popular Badge - positioned relative to border container */}
        {isPopular && (
          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-50">
            <span className="bg-gradient-to-r from-cyan-500 to-purple-600 text-white px-6 py-2 rounded-full text-sm font-semibold shadow-lg">Most Popular</span>
          </div>
        )}
        

        
        {/* Card content */}
        <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow flex flex-col h-full relative z-10">
          
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">{emoji} {title}</h3>
            <p className="text-gray-600">{description}</p>
          </div>
          
          <div className="space-y-3 mb-8 flex-grow">
            {features.map((feature, index) => (
              <div key={index} className="flex items-start">
                <span className="text-lg mr-3">{feature.emoji}</span>
                <span className="text-gray-700">{feature.text}</span>
              </div>
            ))}
          </div>
          
          <div className="text-center border-t pt-6 mt-auto">
            <div className="text-3xl font-bold text-gray-900 mb-4">
              {price}
              {priceSubtext && <span className="text-lg font-normal text-gray-600">{priceSubtext}</span>}
            </div>
            <button className="w-full bg-purple-600 text-white py-3 px-6 rounded-lg hover:bg-purple-700 transition-colors font-semibold">
              Contact Sales
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Regular card for Basic and Enterprise
  return (
    <div className={`bg-white border-2 ${borderClass} rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow flex flex-col h-full relative`}>
      {isPopular && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
          <span className="bg-purple-600 text-white px-4 py-1 rounded-full text-sm font-semibold">Most Popular</span>
        </div>
      )}
      
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">{emoji} {title}</h3>
        <p className="text-gray-600">{description}</p>
      </div>
      
      <div className="space-y-3 mb-8 flex-grow">
        {features.map((feature, index) => (
          <div key={index} className="flex items-start">
            <span className="text-lg mr-3">{feature.emoji}</span>
            <span className="text-gray-700">{feature.text}</span>
          </div>
        ))}
      </div>
      
      <div className="text-center border-t pt-6 mt-auto">
        <div className="text-3xl font-bold text-gray-900 mb-4">
          {price}
          {priceSubtext && <span className="text-lg font-normal text-gray-600">{priceSubtext}</span>}
        </div>
        <button className="w-full bg-purple-600 text-white py-3 px-6 rounded-lg hover:bg-purple-700 transition-colors font-semibold">
          Contact Sales
        </button>
      </div>
    </div>
  );
} 