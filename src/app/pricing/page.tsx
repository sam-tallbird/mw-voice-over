import PricingCard from "@/components/PricingCard";
import ComparisonTable from "@/components/ComparisonTable";

export default function PricingPage() {
  const pricingPlans = [
    {
      title: "Basic",
      emoji: "🔹",
      description: "Perfect for individual creators & small projects",
      features: [
        { emoji: "🎤", text: "Up to 20 voice overs/month" },
        { emoji: "⏱️", text: "Max 1.5 min per voice" },
        { emoji: "📥", text: "Download as MP3" },
        { emoji: "🌐", text: "Commercial use license" }
      ],
      price: "20,000 IQD",
      priceSubtext: "/month",
      isPopular: false,
      borderColor: "gray" as const
    },
    {
      title: "Pro",
      emoji: "🔸",
      description: "Built for power users, educators, and content studios",
      features: [
        { emoji: "🎤", text: "Up to 120 voice overs/month" },
        { emoji: "⏱️", text: "Max 1.5 min per voice" },
        { emoji: "🧠", text: "Early access to new voices" },
        { emoji: "📥", text: "Download as WAV & MP3" },
        { emoji: "🌐", text: "Commercial use license" }
      ],
      price: "60,000 IQD",
      priceSubtext: "/month",
      isPopular: true,
      borderColor: "purple" as const
    },
    {
      title: "Enterprise",
      emoji: "🔶",
      description: "Tailored voice AI for big projects and institutions",
      features: [
        { emoji: "🧩", text: "Custom voice quota" },
        { emoji: "🎭", text: "Custom voice styles on request" },
        { emoji: "🗣️", text: "Advanced tone & emotion tweaking" },
        { emoji: "🧑‍💼", text: "Dedicated voice training for brands" },
        { emoji: "🚀", text: "API access + dashboard" },
        { emoji: "🤝", text: "Priority support + onboarding" },
        { emoji: "🛠", text: "Optional private voice model training" }
      ],
      price: "Custom",
      isPopular: false,
      borderColor: "gray" as const
    }
  ];

  const comparisonPlans = [
    { title: "Basic", emoji: "🔹", price: "20,000 IQD", priceSubtext: "/month" },
    { title: "Pro", emoji: "🔸", price: "60,000 IQD", priceSubtext: "/month" },
    { title: "Enterprise", emoji: "🔶", price: "Custom" }
  ];

  const comparisonFeatures = [
    {
      category: "Voice Generation",
      features: [
        { name: "Monthly voice overs", basic: "Up to 20", pro: "Up to 120", enterprise: "Custom quota" },
        { name: "Max duration per voice", basic: "✅", pro: "✅", enterprise: "✅" },
        { name: "Commercial use license", basic: "✅", pro: "✅", enterprise: "✅" }
      ]
    },
    {
      category: "Audio Quality & Formats",
      features: [
        { name: "Download as MP3", basic: "✅", pro: "✅", enterprise: "✅" },
        { name: "Download as WAV", basic: "❌", pro: "✅", enterprise: "✅" }
      ]
    },
    {
      category: "Voice Options & Customization",
      features: [
        { name: "Early access to new voices", basic: "❌", pro: "✅", enterprise: "✅" },
        { name: "Custom voice styles", basic: "❌", pro: "❌", enterprise: "✅" },
        { name: "Advanced tone & emotion tweaking", basic: "❌", pro: "❌", enterprise: "✅" },
        { name: "Dedicated voice training for brands", basic: "❌", pro: "❌", enterprise: "✅" }
      ]
    },
    {
      category: "Platform & Support",
      features: [
        { name: "API access + dashboard", basic: "❌", pro: "❌", enterprise: "✅" },
        { name: "Priority support + onboarding", basic: "❌", pro: "❌", enterprise: "✅" },
        { name: "Private voice model training", basic: "❌", pro: "❌", enterprise: "✅" }
      ]
    }
  ];

  return (
    <div>
      <div className="h-[16rem] w-full bg-white flex flex-col items-center justify-center relative pt-10 ">
        <h1 className="text-7xl font-bold text-center text-gray-900 relative z-20">
          Simple Pricing for Powerful Voices
        </h1>
      </div>
      
      {/* Subheading */}
      <div className="text-center ">
        <p className="text-3xl text-gray-700 max-w-5xl mx-auto leading-tight">
          Whether you're a content creator, a startup, or an enterprise giant — we have a plan that speaks your language.
        </p>
      </div>

      {/* Pricing Cards */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {pricingPlans.map((plan, index) => (
            <PricingCard
              key={index}
              title={plan.title}
              emoji={plan.emoji}
              description={plan.description}
              features={plan.features}
              price={plan.price}
              priceSubtext={plan.priceSubtext}
              isPopular={plan.isPopular}
              borderColor={plan.borderColor}
            />
          ))}
        </div>
      </div>

      {/* Comparison Table */}
      <ComparisonTable 
        plans={comparisonPlans}
        comparisonFeatures={comparisonFeatures}
      />
    </div>
  );
} 