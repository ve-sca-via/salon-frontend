import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

// Service Type Icon
function ServiceTypeIcon() {
  return (
    <div className="relative shrink-0 size-[20px]">
      <svg
        className="block size-full"
        fill="none"
        preserveAspectRatio="none"
        viewBox="0 0 20 20"
      >
        <g>
          <path
            d="M3 5a2 2 0 012-2h10a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V5z"
            stroke="currentColor"
            strokeWidth="1.5"
            fill="none"
            className="text-neutral-black"
          />
          <path
            d="M7 9h6M7 12h4"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            className="text-neutral-black"
          />
        </g>
      </svg>
    </div>
  );
}

// Location Icon
function LocationIcon() {
  return (
    <div className="relative shrink-0 size-[20px]">
      <svg
        className="block size-full"
        fill="none"
        preserveAspectRatio="none"
        viewBox="0 0 20 20"
      >
        <g>
          <path
            d="M10 2C7.24 2 5 4.24 5 7c0 3.75 5 9 5 9s5-5.25 5-9c0-2.76-2.24-5-5-5z"
            stroke="currentColor"
            strokeWidth="1.5"
            fill="none"
            className="text-neutral-black"
          />
          <circle
            cx="10"
            cy="7"
            r="1.5"
            fill="currentColor"
            className="text-neutral-black"
          />
        </g>
      </svg>
    </div>
  );
}

// Date Icon
function DateIcon() {
  return (
    <div className="relative shrink-0 size-[20px]">
      <svg
        className="block size-full"
        fill="none"
        preserveAspectRatio="none"
        viewBox="0 0 20 20"
      >
        <g>
          <rect
            x="3"
            y="4"
            width="14"
            height="13"
            rx="2"
            stroke="currentColor"
            strokeWidth="1.5"
            fill="none"
            className="text-neutral-black"
          />
          <path
            d="M3 8h14M7 2v3M13 2v3"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            className="text-neutral-black"
          />
        </g>
      </svg>
    </div>
  );
}

// Search Icon
function SearchIcon() {
  return (
    <div className="relative shrink-0 size-[16px]">
      <svg
        className="block size-full"
        fill="none"
        preserveAspectRatio="none"
        viewBox="0 0 16 16"
      >
        <g>
          <circle
            cx="7"
            cy="7"
            r="5"
            stroke="currentColor"
            strokeWidth="1.5"
            fill="none"
            className="text-white"
          />
          <path
            d="M11 11l3 3"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            className="text-white"
          />
        </g>
      </svg>
    </div>
  );
}

// Chevron Icon
function ChevronIcon() {
  return (
    <svg className="w-4 h-4 text-neutral-black" fill="none" viewBox="0 0 16 16">
      <path
        d="M4 6l4 4 4-4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function SearchBox() {
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  const [serviceType, setServiceType] = useState("");
  const [location, setLocation] = useState("");
  const [date, setDate] = useState("");
  const [isServiceOpen, setIsServiceOpen] = useState(false);

  const serviceTypes = [
    "Hair Services",
    "Spa Services",
    "Nail Services",
    "Makeup Services",
    "Facial",
    "Massage",
  ];

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsServiceOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (serviceType) params.append("service", serviceType);
    if (location) params.append("location", location);
    if (date) params.append("date", date);

    navigate(`/salons?${params.toString()}`);
  };

  return (
    <div className="w-full max-w-[1235px] mx-auto px-4 -mt-16 relative z-20">
      <div className="bg-primary-white rounded-[5px] shadow-[0px_8px_44px_0px_rgba(65,65,65,0.19)] p-6">
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 items-stretch lg:items-center">
          {/* Service Type Dropdown */}
          <div className="flex-1 relative" ref={dropdownRef}>
            <div className="flex gap-3 items-center lg:border-r border-neutral-gray-600 lg:pr-4">
              <ServiceTypeIcon />
              <div className="relative flex-1">
                <button
                  onClick={() => setIsServiceOpen(!isServiceOpen)}
                  className="w-full text-left flex items-center justify-between gap-2 font-body text-[16px] text-neutral-gray-500 focus:outline-none hover:text-neutral-black transition-colors"
                >
                  <span className={serviceType ? "text-neutral-black" : ""}>
                    {serviceType || "Select Service type"}
                  </span>
                  <ChevronIcon />
                </button>

                {isServiceOpen && (
                  <div className="absolute top-full left-0 mt-2 w-full bg-primary-white shadow-lg rounded-md py-2 z-50 border border-neutral-gray-600">
                    {serviceTypes.map((service) => (
                      <button
                        key={service}
                        onClick={() => {
                          setServiceType(service);
                          setIsServiceOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-neutral-gray-600 font-body text-[14px] text-neutral-black transition-colors"
                      >
                        {service}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Location Input */}
          <div className="flex-1">
            <div className="flex gap-3 items-center lg:border-r border-neutral-gray-600 lg:pr-4">
              <LocationIcon />
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Location"
                className="flex-1 font-body text-[16px] text-neutral-black placeholder:text-neutral-gray-500 border-0 outline-none focus:ring-0 p-0 bg-transparent"
              />
            </div>
          </div>

          {/* Date Input */}
          <div className="flex-1">
            <div className="flex gap-3 items-center lg:border-r border-neutral-gray-600 lg:pr-4">
              <DateIcon />
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                placeholder="Add date"
                className="flex-1 font-body text-[16px] text-neutral-black placeholder:text-neutral-gray-500 border-0 outline-none focus:ring-0 p-0 bg-transparent"
              />
            </div>
          </div>

          {/* Search Button */}
          <button
            onClick={handleSearch}
            className="bg-gradient-orange hover:opacity-90 transition-opacity flex gap-2 items-center justify-center px-6 py-3 rounded-md group shrink-0"
          >
            <SearchIcon />
            <span className="font-body font-medium text-[16px] leading-[24px] text-primary-white whitespace-nowrap">
              Search
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
