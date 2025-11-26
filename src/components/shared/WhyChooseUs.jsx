import svgPaths from "../../utils/svgPaths";

// Scissors Icon for Header
function ScissorsIcon() {
  return (
    <div className="relative shrink-0 size-[24px]">
      <svg
        className="block size-full"
        fill="none"
        preserveAspectRatio="none"
        viewBox="0 0 24 24"
      >
        <g>
          <path
            clipRule="evenodd"
            d={svgPaths.p25acb880}
            fill="#242B3A"
            fillRule="evenodd"
          />
          <path
            clipRule="evenodd"
            d={svgPaths.p278c7db0}
            fill="#242B3A"
            fillRule="evenodd"
          />
          <path
            clipRule="evenodd"
            d={svgPaths.pd7a6390}
            fill="#242B3A"
            fillRule="evenodd"
          />
          <path
            clipRule="evenodd"
            d={svgPaths.p33bb100}
            fill="#242B3A"
            fillRule="evenodd"
          />
          <path
            clipRule="evenodd"
            d={svgPaths.p153dbd00}
            fill="#242B3A"
            fillRule="evenodd"
          />
        </g>
      </svg>
    </div>
  );
}

// Header Component
function Header() {
  return (
    <div className="flex flex-col gap-4 items-center w-full mb-16">
      <div className="flex flex-col gap-2 items-center">
        {/* Title */}
        <h2 className="font-display font-bold text-[32px] leading-[48px] text-neutral-black">
          Why Choose Lubist?
        </h2>

        {/* Icon with Lines */}
        <div className="flex items-center gap-4">
          <div className="h-[1px] w-[50px] bg-neutral-black"></div>
          <ScissorsIcon />
          <div className="h-[1px] w-[50px] bg-neutral-black"></div>
        </div>

        {/* Description */}
        <p className="font-body font-medium text-[16px] leading-[24px] text-neutral-gray-500 text-center max-w-[510px] mt-2">
          Making beauty and wellness accessible, reliable, and delightful for everyone
        </p>
      </div>
    </div>
  );
}

// Feature Icons
function SearchIcon() {
  return (
    <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 64 64">
      <circle cx="26" cy="26" r="18" stroke="#F89C02" strokeWidth="4" />
      <line
        x1="40"
        y1="40"
        x2="54"
        y2="54"
        stroke="#F89C02"
        strokeWidth="4"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CalendarCheckIcon() {
  return (
    <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 64 64">
      <rect
        x="10"
        y="14"
        width="44"
        height="40"
        rx="4"
        stroke="#F89C02"
        strokeWidth="4"
      />
      <line x1="10" y1="24" x2="54" y2="24" stroke="#F89C02" strokeWidth="4" />
      <line
        x1="20"
        y1="10"
        x2="20"
        y2="18"
        stroke="#F89C02"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <line
        x1="44"
        y1="10"
        x2="44"
        y2="18"
        stroke="#F89C02"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <polyline
        points="24,36 28,40 40,30"
        stroke="#F89C02"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

function StarIcon() {
  return (
    <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 64 64">
      <path
        d="M32 8L37.6 24.8H55.2L41.6 35.2L47.2 52L32 41.6L16.8 52L22.4 35.2L8.8 24.8H26.4L32 8Z"
        stroke="#F89C02"
        strokeWidth="4"
        fill="none"
      />
    </svg>
  );
}

function MapPinIcon() {
  return (
    <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 64 64">
      <path
        d="M32 10C22 10 14 18 14 28C14 42 32 54 32 54C32 54 50 42 50 28C50 18 42 10 32 10Z"
        stroke="#F89C02"
        strokeWidth="4"
      />
      <circle
        cx="32"
        cy="28"
        r="6"
        stroke="#F89C02"
        strokeWidth="4"
        fill="none"
      />
    </svg>
  );
}

// Feature Card Component
function FeatureCard({ icon, title, description }) {
  return (
    <div className="bg-primary-white p-8 rounded-[10px] shadow-lg text-center hover:shadow-xl transition-shadow group">
      <div className="mb-6 transform group-hover:scale-110 transition-transform duration-300">
        {icon}
      </div>
      <h3 className="font-body font-semibold text-[20px] leading-[32px] text-neutral-black mb-3">
        {title}
      </h3>
      <p className="font-body font-normal text-[16px] leading-[24px] text-neutral-gray-500">
        {description}
      </p>
    </div>
  );
}

export default function WhyChooseUs() {
  const features = [
    {
      icon: <SearchIcon />,
      title: "Discover Verified Salons",
      description:
        "Find trusted, verified salons near you with authentic reviews and real-time availability",
    },
    {
      icon: <CalendarCheckIcon />,
      title: "Book in Seconds",
      description:
        "No calls, no confusion. Book appointments instantly and manage them easily online",
    },
    {
      icon: <StarIcon />,
      title: "Compare & Choose",
      description:
        "Compare services, prices, and reviews to make the best decision for your needs",
    },
    {
      icon: <MapPinIcon />,
      title: "Stress-Free Experience",
      description:
        "Remove waiting lines and uncertainty with our simple, fast booking platform",
    },
  ];

  return (
    <section className="w-full py-20 bg-bg-secondary">
      <div className="max-w-[1320px] mx-auto px-4">
        <Header />

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
