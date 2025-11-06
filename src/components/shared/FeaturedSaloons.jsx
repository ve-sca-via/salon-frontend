import { useState } from "react";
import { useNavigate } from "react-router-dom";
import OptimizedImage from "./OptimizedImage";
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
    <div className="flex flex-col gap-4 items-center w-full mb-10">
      <div className="flex flex-col gap-2 items-center">
        {/* Title */}
        <h2 className="font-display font-bold text-[32px] leading-[48px] text-neutral-black">
          Featured Saloons
        </h2>

        {/* Icon with Lines */}
        <div className="flex items-center gap-4">
          <div className="h-[1px] w-[50px] bg-neutral-black"></div>
          <ScissorsIcon />
          <div className="h-[1px] w-[50px] bg-neutral-black"></div>
        </div>

        {/* Description */}
        <p className="font-body font-medium text-[16px] leading-[24px] text-neutral-gray-500 text-center max-w-[510px] mt-2">
          Our Barbershop & Tattoo Salon provides classic services combined with
          innovative techniques.
        </p>
      </div>
    </div>
  );
}

// Star Rating Component
function StarRating({ rating = 5 }) {
  return (
    <div className="flex gap-1">
      {[...Array(5)].map((_, index) => (
        <svg
          key={index}
          className="w-[19.2px] h-[16px]"
          fill={index < rating ? "#FFC107" : "#E0E0E0"}
          viewBox="0 0 16 16"
        >
          <path d="M8 0L9.79611 5.52786H15.6085L10.9062 8.94427L12.7023 14.4721L8 11.0557L3.29772 14.4721L5.09383 8.94427L0.391548 5.52786H6.20389L8 0Z" />
        </svg>
      ))}
    </div>
  );
}

// Badge Component for Service Tags
function ServiceBadge({ text }) {
  return (
    <div className="bg-neutral-gray-600 px-[8px] py-[8px] rounded-[4px]">
      <span className="font-body font-normal text-[13px] leading-[16px] text-neutral-black">
        {text}
      </span>
    </div>
  );
}

// Clock Icon
function ClockIcon() {
  return (
    <svg className="w-[16px] h-[16px]" fill="none" viewBox="0 0 16 16">
      <circle
        cx="8"
        cy="8"
        r="6.66667"
        stroke="#B0B0B0"
        strokeWidth="1.33333"
      />
      <path
        d="M8 4V8L10.6667 9.33333"
        stroke="#B0B0B0"
        strokeWidth="1.33333"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// Map Pin Icon
function MapPinIcon() {
  return (
    <svg className="w-[16px] h-[16px]" fill="none" viewBox="0 0 16 16">
      <path
        d="M8 8.66667C9.10457 8.66667 10 7.77124 10 6.66667C10 5.5621 9.10457 4.66667 8 4.66667C6.89543 4.66667 6 5.5621 6 6.66667C6 7.77124 6.89543 8.66667 8 8.66667Z"
        stroke="#B0B0B0"
        strokeWidth="1.33333"
      />
      <path
        d="M8 14.6667C10.6667 12 13.3333 9.61867 13.3333 6.66667C13.3333 3.71467 10.9467 1.33333 8 1.33333C5.05333 1.33333 2.66667 3.71467 2.66667 6.66667C2.66667 9.61867 5.33333 12 8 14.6667Z"
        stroke="#B0B0B0"
        strokeWidth="1.33333"
      />
    </svg>
  );
}

// Calendar Icon
function CalendarIcon() {
  return (
    <svg className="w-[16px] h-[16px]" fill="none" viewBox="0 0 16 16">
      <path
        d="M5.33333 1.33333V3.33333M10.6667 1.33333V3.33333M2.33333 6.06H13.6667"
        stroke="#FFFFFF"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeMiterlimit="10"
      />
      <path
        d="M14 5.66667V11.3333C14 13.3333 13 14.6667 10.6667 14.6667H5.33333C3 14.6667 2 13.3333 2 11.3333V5.66667C2 3.66667 3 2.33333 5.33333 2.33333H10.6667C13 2.33333 14 3.66667 14 5.66667Z"
        stroke="#FFFFFF"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeMiterlimit="10"
      />
      <path
        d="M7.99699 9.13334H8.00298M5.52954 9.13334H5.53553M5.52954 11.1333H5.53553"
        stroke="#FFFFFF"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// Salon Card Component
function SalonCard({ salon }) {
  const navigate = useNavigate();

  const handleViewSalon = () => {
    navigate(`/salons/${salon.id}`);
  };

  return (
    <div
      className="flex flex-col rounded-[10px] shadow-lg overflow-hidden bg-primary-white w-full max-w-[416px] cursor-pointer hover:shadow-xl transition-shadow"
      onClick={handleViewSalon}
    >
      {/* Card Image */}
      <div className="relative h-[250px] w-full">
        <OptimizedImage
          src={salon.image}
          alt={salon.name}
          className="w-full h-full"
          objectFit="cover"
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-neutral-black/80"></div>

        {/* Rating Badge */}
        <div className="absolute top-5 right-5">
          <StarRating rating={salon.rating} />
        </div>
      </div>

      {/* Card Info */}
      <div className="flex flex-col gap-4 p-5">
        {/* Title */}
        <h3 className="font-body font-semibold text-[20px] leading-[32px] text-neutral-black">
          {salon.name}
        </h3>

        {/* Service Tags */}
        <div className="flex gap-2 flex-wrap">
          {salon.services.map((service, index) => (
            <ServiceBadge key={index} text={service} />
          ))}
        </div>

        {/* Details Container */}
        <div className="flex items-center justify-between">
          {/* Profile Container */}
          <div className="flex items-center gap-3">
            <OptimizedImage
              src={salon.avatar}
              alt={salon.owner}
              className="w-[61px] h-[61px] rounded-[10px]"
              objectFit="cover"
            />
            <div className="flex flex-col gap-2">
              {/* Hours */}
              <div className="flex items-center gap-2">
                <ClockIcon />
                <span className="font-body font-normal text-[14px] leading-[24px] text-neutral-gray-500">
                  {salon.hours}
                </span>
              </div>
              {/* Address */}
              <div className="flex items-center gap-2">
                <MapPinIcon />
                <span className="font-body font-normal text-[14px] leading-[24px] text-neutral-gray-500">
                  {salon.address}
                </span>
              </div>
            </div>
          </div>

          {/* Price */}
          <div className="font-body font-semibold text-[24px] leading-[40px] text-accent-orange">
            ${salon.price}
          </div>
        </div>

        {/* Book Appointment Button */}
        <button
          className="w-full bg-neutral-black text-primary-white rounded-[5px] py-[9px] px-[16px] flex items-center justify-center gap-2 hover:bg-neutral-gray-400 transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            handleViewSalon();
          }}
        >
          <CalendarIcon />
          <span className="font-body font-medium text-[14px] leading-[24px]">
            Book Appointment
          </span>
        </button>
      </div>
    </div>
  );
}

export default function FeaturedSaloons({ salons }) {
  // Default featured salons data if none provided
  const defaultSalons = [
    {
      id: 1,
      name: "Saloon 24 Hair Designers",
      services: ["Deep Pore Cleansing", "Buzz Cut", "Straight Razor Shave"],
      hours: "07:00 AM - 11:00 PM",
      address: "07 Mount Olive Road",
      owner: "John Doe",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=John1",
      image:
        "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800",
      rating: 3,
      price: 70,
    },
    {
      id: 2,
      name: "The Rockstar Barber",
      services: ["Buzz Cut", "Blowout"],
      hours: "08:00 AM - 05:00 PM",
      address: "49 Small Street, Newyork",
      owner: "Mike Smith",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mike1",
      image:
        "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=800",
      rating: 4,
      price: 50,
    },
    {
      id: 3,
      name: "Femina Hairstyle",
      services: ["Pore Cleansing", "Hair Style Manicure"],
      hours: "08:00 AM - 07:00 PM",
      address: "Bungalow Road, Omaha",
      owner: "Sarah Wilson",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah1",
      image: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800",
      rating: 5,
      price: 40,
    },
    {
      id: 4,
      name: "Master Barber",
      services: ["Hair Cut", "Hair Styling"],
      hours: "08:00 AM - 05:00 PM",
      address: "Villa Drive, South",
      owner: "Tom Brown",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Tom1",
      image:
        "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=800",
      rating: 4,
      price: 36,
    },
    {
      id: 5,
      name: "Cut & Colors Hair Dressers",
      services: ["Face Cleansing", "Clean Shaving"],
      hours: "08:00 AM - 06:00 PM",
      address: "Sarall Drive, Lafayette",
      owner: "Emma Davis",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Emma1",
      image: "https://images.unsplash.com/photo-1562322140-8baeececf3df?w=800",
      rating: 5,
      price: 42,
    },
    {
      id: 6,
      name: "Rearhair Stylist",
      services: ["Face Cleansing", "Hair Styling"],
      hours: "08:00 AM - 11:00 PM",
      address: "Nash Street, Southfield",
      owner: "Lisa Johnson",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Lisa1",
      image:
        "https://images.unsplash.com/photo-1633681926022-84c23e8cb2d6?w=800",
      rating: 5,
      price: 55,
    },
  ];

  const displaySalons = salons || defaultSalons;

  return (
    <section className="w-full py-16 bg-white">
      <div className="max-w-[1320px] mx-auto px-4">
        <Header />

        {/* Salons Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displaySalons.map((salon) => (
            <SalonCard key={salon.id} salon={salon} />
          ))}
        </div>
      </div>
    </section>
  );
}
