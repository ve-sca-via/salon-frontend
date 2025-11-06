import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { AppointmentButton } from "./AppointmentButton";
import { AuthButton } from "./AuthButton";

export function Actions() {
  const navigate = useNavigate();
  const cart = useSelector((state) => state.cart);

  return (
    <div className="hidden lg:flex basis-0 content-stretch gap-[8px] grow items-center justify-end min-h-px min-w-px relative shrink-0">
      {/* Cart Icon */}
      <button
        onClick={() => navigate("/cart")}
        className="relative p-2 hover:bg-neutral-gray-600 rounded-md transition-colors"
      >
        <svg
          className="w-6 h-6 text-neutral-black"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
        {cart.itemCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-accent-orange text-primary-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
            {cart.itemCount}
          </span>
        )}
      </button>

      <AppointmentButton />
      <AuthButton />
    </div>
  );
}
