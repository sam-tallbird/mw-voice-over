import React from 'react';

interface Plan {
  title: string;
  emoji: string;
  price: string;
  priceSubtext?: string;
}

interface Feature {
  name: string;
  basic: string;
  pro: string;
  enterprise: string;
}

interface FeatureCategory {
  category: string;
  features: Feature[];
}

interface ComparisonTableProps {
  plans: Plan[];
  comparisonFeatures: FeatureCategory[];
}

export default function ComparisonTable({ plans, comparisonFeatures }: ComparisonTableProps) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-8 sm:pb-16">
      <div className="text-center mb-6 sm:mb-12">
        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2 sm:mb-4">Compare Plans</h2>
        <p className="text-lg sm:text-xl text-gray-600">See what's included in each plan</p>
      </div>

      <div className="bg-white rounded-lg sm:rounded-2xl shadow-lg overflow-hidden border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left py-6 sm:py-12 px-3 sm:px-6 font-semibold text-gray-900 w-1/4"></th>
                {plans.map((plan, index) => (
                  <th key={index} className="text-center py-6 sm:py-12 px-2 sm:px-4 font-semibold text-gray-900 relative w-1/4">
                    <div className="flex flex-col items-center justify-center h-full">
                      <div className="text-2xl sm:text-3xl mb-1 sm:mb-3">{plan.emoji}</div>
                      <div className="text-sm sm:text-xl font-bold text-gray-900">{plan.title}</div>
                      <div className="text-xs sm:text-sm font-normal text-gray-600 mt-1 sm:mt-2">
                        {plan.price}{plan.priceSubtext}
                      </div>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {comparisonFeatures.map((category, categoryIndex) => (
                <React.Fragment key={`category-${categoryIndex}`}>
                  <tr className="bg-gray-50">
                    <td colSpan={4} className="py-3 sm:py-4 px-3 sm:px-6 font-semibold text-gray-900 text-base sm:text-lg border-t border-gray-200">
                      {category.category}
                    </td>
                  </tr>
                  {category.features.map((feature, featureIndex) => (
                    <tr key={`feature-${categoryIndex}-${featureIndex}`} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 sm:py-4 px-3 sm:px-6 text-gray-700 text-xs sm:text-base font-medium">{feature.name}</td>
                      <td className="py-3 sm:py-4 px-2 sm:px-6 text-center text-base sm:text-lg">
                        {feature.basic.includes('Up to') || feature.basic.includes('Custom') ? (
                          <span className="text-xs sm:text-sm font-medium text-gray-700">{feature.basic}</span>
                        ) : (
                          feature.basic
                        )}
                      </td>
                      <td className="py-3 sm:py-4 px-2 sm:px-6 text-center text-base sm:text-lg">
                        {feature.pro.includes('Up to') || feature.pro.includes('Custom') ? (
                          <span className="text-xs sm:text-sm font-medium text-gray-700">{feature.pro}</span>
                        ) : (
                          feature.pro
                        )}
                      </td>
                      <td className="py-3 sm:py-4 px-2 sm:px-6 text-center text-base sm:text-lg">
                        {feature.enterprise.includes('Up to') || feature.enterprise.includes('Custom') ? (
                          <span className="text-xs sm:text-sm font-medium text-gray-700">{feature.enterprise}</span>
                        ) : (
                          feature.enterprise
                        )}
                      </td>
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 