import { useNavigate } from "react-router-dom";
import { useGetCartQuery } from "../../../services/api/cartApi";
import { useGetProductCartQuery } from "../../../services/api/productCartApi";
import { AppointmentButton } from "./AppointmentButton";
import { AuthButton } from "./AuthButton";
import { FiScissors, FiShoppingBag } from "react-icons/fi";

export function Actions() {
  const navigate = useNavigate();
  const { data: cart } = useGetCartQuery();
  const { data: productCart } = useGetProductCartQuery();

  return (
    <div className="hidden lg:flex basis-0 gap-[8px] grow items-center justify-end min-h-px min-w-px relative shrink-0">
      {/* Service Cart Icon */}
      <button
        onClick={() => navigate("/cart")}
        className="relative p-2 hover:bg-neutral-gray-600 rounded-md transition-colors"
        title="Services Cart"
      >
        <FiScissors className="w-5 h-5 text-neutral-black" />
        {cart?.item_count > 0 && (
          <span className="absolute -top-1 -right-1 bg-accent-orange text-primary-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
            {cart?.item_count}
          </span>
        )}
      </button>

      {/* Product Cart Icon */}
      <button
        onClick={() => navigate("/product-cart")}
        className="relative p-2 hover:bg-neutral-gray-600 rounded-md transition-colors"
        title="Product Cart"
      >
        <FiShoppingBag className="w-5 h-5 text-neutral-black" />
        {productCart?.item_count > 0 && (
          <span className="absolute -top-1 -right-1 bg-accent-orange text-primary-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
            {productCart?.item_count}
          </span>
        )}
      </button>

      <AppointmentButton />
      <AuthButton />
    </div>
  );
}
