import { useNavigate } from "react-router-dom";
import { useGetCartQuery } from "../../../services/api/cartApi";
import { AppointmentButton } from "./AppointmentButton";
import { AuthButton } from "./AuthButton";
import { FiScissors } from "react-icons/fi";

export function Actions() {
  const navigate = useNavigate();
  const { data: cart } = useGetCartQuery();

  return (
    <div className="hidden lg:flex basis-0 content-stretch gap-[8px] grow items-center justify-end min-h-px min-w-px relative shrink-0">
      {/* Cart Icon */}
      <button
        onClick={() => navigate("/cart")}
        className="relative p-2 hover:bg-neutral-gray-600 rounded-md transition-colors"
      >
        <FiScissors className="w-6 h-6 text-neutral-black" />
        {cart?.item_count > 0 && (
          <span className="absolute -top-1 -right-1 bg-accent-orange text-primary-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
            {cart?.item_count}
          </span>
        )}
      </button>

      <AppointmentButton />
      <AuthButton />
    </div>
  );
}
