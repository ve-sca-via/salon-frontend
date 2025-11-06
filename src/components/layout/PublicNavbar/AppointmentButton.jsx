import { useNavigate } from "react-router-dom";
import { CalendarIcon } from "./Icons";

export function AppointmentButton() {
  const navigate = useNavigate();

  return (
    <button
      className="hidden lg:flex bg-gradient-orange box-border content-stretch gap-[8px] items-center justify-center px-[16px] py-[8px] relative rounded-[5px] shrink-0 cursor-pointer hover:opacity-90 transition-opacity"
      onClick={() => navigate("/salons")}
    >
      <CalendarIcon />
      <p className="font-body font-medium leading-[24px] relative shrink-0 text-[14px] text-center text-nowrap text-white whitespace-pre">
        Book Appointment
      </p>
    </button>
  );
}
