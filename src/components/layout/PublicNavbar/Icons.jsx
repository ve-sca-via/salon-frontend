export function DropdownIcon({ isOpen }) {
  return (
    <div className="relative size-[20px]">
      <svg
        className="block size-full"
        fill="none"
        preserveAspectRatio="none"
        viewBox="0 0 20 20"
      >
        <g>
          <path
            clipRule="evenodd"
            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
            fill="#000000"
            fillRule="evenodd"
          />
        </g>
      </svg>
    </div>
  );
}

export function HamburgerIcon({ isOpen }) {
  return (
    <div className="w-6 h-6 flex flex-col justify-center items-center gap-1">
      <span
        className={`w-6 h-0.5 bg-neutral-black transition-all ${
          isOpen ? "rotate-45 translate-y-1.5" : ""
        }`}
      ></span>
      <span
        className={`w-6 h-0.5 bg-neutral-black transition-all ${
          isOpen ? "opacity-0" : ""
        }`}
      ></span>
      <span
        className={`w-6 h-0.5 bg-neutral-black transition-all ${
          isOpen ? "-rotate-45 -translate-y-1.5" : ""
        }`}
      ></span>
    </div>
  );
}

export function CalendarIcon() {
  return (
    <div className="relative shrink-0 size-[14px]">
      <svg
        className="block size-full"
        fill="none"
        preserveAspectRatio="none"
        viewBox="0 0 14 14"
      >
        <g>
          <rect
            x="2"
            y="3"
            width="10"
            height="9"
            rx="1"
            stroke="white"
            strokeWidth="1.5"
            fill="none"
          />
          <line
            x1="2"
            y1="5.5"
            x2="12"
            y2="5.5"
            stroke="white"
            strokeWidth="1.5"
          />
          <line
            x1="4.5"
            y1="1"
            x2="4.5"
            y2="4"
            stroke="white"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <line
            x1="9.5"
            y1="1"
            x2="9.5"
            y2="4"
            stroke="white"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </g>
      </svg>
    </div>
  );
}

export function UserIcon() {
  return (
    <div className="relative shrink-0 size-[14px]">
      <svg
        className="block size-full"
        fill="none"
        preserveAspectRatio="none"
        viewBox="0 0 14 14"
      >
        <g>
          <circle
            cx="7"
            cy="4.5"
            r="2.5"
            stroke="white"
            strokeWidth="1.5"
            fill="none"
          />
          <path
            d="M2 12.5c0-2.5 2.24-4.5 5-4.5s5 2 5 4.5"
            stroke="white"
            strokeWidth="1.5"
            strokeLinecap="round"
            fill="none"
          />
        </g>
      </svg>
    </div>
  );
}
