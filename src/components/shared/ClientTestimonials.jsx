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
            fill="#E9EAEB"
            fillRule="evenodd"
          />
          <path
            clipRule="evenodd"
            d={svgPaths.p278c7db0}
            fill="#E9EAEB"
            fillRule="evenodd"
          />
          <path
            clipRule="evenodd"
            d={svgPaths.pd7a6390}
            fill="#E9EAEB"
            fillRule="evenodd"
          />
          <path
            clipRule="evenodd"
            d={svgPaths.p33bb100}
            fill="#E9EAEB"
            fillRule="evenodd"
          />
          <path
            clipRule="evenodd"
            d={svgPaths.p153dbd00}
            fill="#E9EAEB"
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
    <div className="flex flex-col gap-4 items-center w-full">
      <div className="flex flex-col gap-2 items-center">
        {/* Title */}
        <h2 className="font-display font-bold text-[32px] leading-[48px] text-primary-white">
          What Our Clients Say
        </h2>

        {/* Icon with Lines */}
        <div className="flex items-center gap-4">
          <div className="h-[1px] w-[50px] bg-neutral-gray-600"></div>
          <ScissorsIcon />
          <div className="h-[1px] w-[50px] bg-neutral-gray-600"></div>
        </div>

        {/* Description */}
        <p className="font-body font-medium text-[16px] leading-[24px] text-neutral-gray-600 text-center max-w-[510px] mt-2">
          Trusted by businesses and professionals across India. Real
          testimonials from our valued clients.
        </p>
      </div>
    </div>
  );
}

// Quote Icon
function QuoteIcon() {
  return (
    <svg className="w-[40px] h-[32px]" fill="none" viewBox="0 0 40 32">
      <path
        d="M0 17.92V32h14.08V17.92H7.04V7.04h7.04V0H0v17.92z"
        fill="#F89C02"
      />
      <path
        d="M25.92 17.92V32H40V17.92h-7.04V7.04H40V0H25.92v17.92z"
        fill="#F89C02"
      />
    </svg>
  );
}

// Testimonial Content
function TestimonialContent() {
  return (
    <div className="flex flex-col gap-[18px] items-center">
      <QuoteIcon />
      <p className="font-body font-semibold text-[20px] leading-[32px] text-primary-white text-center max-w-[654px]">
        "Outstanding platform for connecting businesses with talented
        professionals. The interface is incredibly intuitive and makes project
        management seamless. Perfect for India's growing freelance economy!"
      </p>
    </div>
  );
}

// Client Info
function ClientInfo() {
  return (
    <div className="flex flex-col items-center gap-1 text-center">
      <h4 className="font-body font-semibold text-[20px] leading-[32px] text-neutral-gray-600">
        Priya Sharma
      </h4>
      <p className="font-body font-normal text-[16px] leading-[24px] text-neutral-gray-600">
        Bangalore, India
      </p>
    </div>
  );
}

// Client Avatars
function ClientAvatars() {
  const avatars = [
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Client1",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Client2",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Client3",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Client4",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Client5",
  ];

  return (
    <div className="flex gap-[17px] items-center justify-center">
      {avatars.map((avatar, index) => (
        <div
          key={index}
          className="w-[58px] h-[58px] rounded-full overflow-hidden border-4 border-primary-white shadow-lg"
        >
          <img
            src={avatar}
            alt={`Client ${index + 1}`}
            className="w-full h-full object-cover"
          />
        </div>
      ))}
    </div>
  );
}

export default function ClientTestimonials() {
  return (
    <section className="relative w-full py-20  bg-neutral-black overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 opacity-10">
        <img
          src="https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1600"
          alt=""
          className="w-full h-full object-cover"
        />
      </div>

      {/* Content */}
      <div className="relative max-w-[1296px] mx-auto px-4">
        <div className="flex flex-col gap-12 items-center">
          <Header />

          <div className="flex flex-col gap-6 items-center">
            <TestimonialContent />
            <ClientInfo />
          </div>

          <ClientAvatars />
        </div>
      </div>
    </section>
  );
}
