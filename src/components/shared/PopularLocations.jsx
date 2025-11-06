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
    <div className="flex flex-col gap-4 items-center w-full mb-12">
      <div className="flex flex-col gap-2 items-center">
        {/* Title */}
        <h2 className="font-display font-bold text-[32px] leading-[48px] text-neutral-black">
          Popular Locations
        </h2>

        {/* Icon with Lines */}
        <div className="flex items-center gap-4">
          <div className="h-[1px] w-[50px] bg-neutral-black"></div>
          <ScissorsIcon />
          <div className="h-[1px] w-[50px] bg-neutral-black"></div>
        </div>

        {/* Description */}
        <p className="font-body font-medium text-[16px] leading-[24px] text-neutral-gray-500 text-center max-w-[510px] mt-2">
          Here's a list of popular locations across India, showcasing diverse
          cities that are sought after for various reasons.
        </p>
      </div>
    </div>
  );
}

// Location Card Component
function LocationCard({ cityName, saloonCount, imageUrl }) {
  return (
    <div className="bg-primary-white rounded-[10px] shadow-lg overflow-hidden w-full max-w-[306px] flex flex-col">
      {/* Image */}
      <div className="h-[197px] w-full">
        <img
          src={imageUrl}
          alt={cityName}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Info Container */}
      <div className="flex flex-col items-center justify-center p-5 text-center">
        <h3 className="font-body font-semibold text-[20px] leading-[32px] text-neutral-black">
          {cityName}
        </h3>
        <p className="font-body font-normal text-[14px] leading-[24px] text-neutral-gray-500">
          {saloonCount}
        </p>
      </div>
    </div>
  );
}

export default function PopularLocations({ locations }) {
  // Default locations data if none provided
  const defaultLocations = [
    {
      id: 1,
      cityName: "Mumbai",
      saloonCount: "52 Saloons",
      imageUrl:
        "https://images.unsplash.com/photo-1649510550074-16195a0c6473?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxNdW1iYWklMjBJbmRpYSUyMGNpdHlzY2FwZXxlbnwxfHx8fDE3NjEzMzczNzB8MA&ixlib=rb-4.1.0&q=80&w=1080",
    },
    {
      id: 2,
      cityName: "Delhi",
      saloonCount: "48 Saloons",
      imageUrl:
        "https://images.unsplash.com/photo-1702818797775-d9656b65e8e8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxEZWxoaSUyMEluZGlhJTIwbGFuZG1hcmtzfGVufDF8fHx8MTc2MTMzNzM3MXww&ixlib=rb-4.1.0&q=80&w=1080",
    },
    {
      id: 3,
      cityName: "Bangalore",
      saloonCount: "45 Saloons",
      imageUrl:
        "https://images.unsplash.com/photo-1687158266948-bf538937c74a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxCYW5nYWxvcmUlMjBJbmRpYSUyMGNpdHl8ZW58MXx8fHwxNzYxMzM3MzcxfDA&ixlib=rb-4.1.0&q=80&w=1080",
    },
    {
      id: 4,
      cityName: "Hyderabad",
      saloonCount: "42 Saloons",
      imageUrl:
        "https://images.unsplash.com/photo-1750834115223-f3a3c2e50c79?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxIeWRlcmFiYWQlMjBJbmRpYXxlbnwxfHx8fDE3NjEzMzczNzF8MA&ixlib=rb-4.1.0&q=80&w=1080",
    },
    {
      id: 5,
      cityName: "Chennai",
      saloonCount: "38 Saloons",
      imageUrl:
        "https://images.unsplash.com/photo-1707047023890-570fbf2989af?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxDaGVubmFpJTIwSW5kaWF8ZW58MXx8fHwxNzYxMzM3MzcyfDA&ixlib=rb-4.1.0&q=80&w=1080",
    },
    {
      id: 6,
      cityName: "Kolkata",
      saloonCount: "35 Saloons",
      imageUrl:
        "https://images.unsplash.com/photo-1591914227599-30b05407ed7b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxLb2xrYXRhJTIwSW5kaWF8ZW58MXx8fHwxNzYxMzM3MzcyfDA&ixlib=rb-4.1.0&q=80&w=1080",
    },
    {
      id: 7,
      cityName: "Jaipur",
      saloonCount: "31 Saloons",
      imageUrl:
        "https://images.unsplash.com/photo-1642993317556-801ffed6ad01?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxKYWlwdXIlMjBJbmRpYXxlbnwxfHx8fDE3NjEzMzczNzJ8MA&ixlib=rb-4.1.0&q=80&w=1080",
    },
    {
      id: 8,
      cityName: "Pune",
      saloonCount: "28 Saloons",
      imageUrl:
        "https://images.unsplash.com/photo-1614716194506-ef3694ae131a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxQdW5lJTIwSW5kaWF8ZW58MXx8fHwxNzYxMzM3MzczfDA&ixlib=rb-4.1.0&q=80&w=1080",
    },
  ];

  const displayLocations = locations || defaultLocations;

  return (
    <section className="w-full py-20 bg-neutral-gray-600">
      <div className="max-w-[1320px] mx-auto px-4">
        <div className="flex flex-col gap-12 items-center">
          <Header />

          {/* Locations Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full place-items-center">
            {displayLocations.map((location) => (
              <LocationCard
                key={location.id}
                cityName={location.cityName}
                saloonCount={location.saloonCount}
                imageUrl={location.imageUrl}
              />
            ))}
          </div>

          {/* View All Button */}
          <button className="bg-accent-orange hover:bg-accent-orange/90 transition-colors px-6 py-3 rounded-[5px] mt-8">
            <span className="font-body font-medium text-[14px] leading-[24px] text-primary-white">
              VIEW ALL 320 LOCATIONS
            </span>
          </button>
        </div>
      </div>
    </section>
  );
}
