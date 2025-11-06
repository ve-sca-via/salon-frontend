import { Link } from "react-router-dom";

export function MenuItem({ children, to, onClick }) {
  return (
    <Link
      to={to || "#"}
      className="box-border content-stretch flex gap-[10px] items-start p-[5px] relative shrink-0 cursor-pointer hover:opacity-70 transition-opacity"
      onClick={onClick}
    >
      <p className="font-body font-medium leading-[24px] relative shrink-0 text-neutral-black text-[14px] text-center text-nowrap whitespace-pre">
        {children}
      </p>
    </Link>
  );
}

export function MobileMenuItem({ children, to, onClick }) {
  return (
    <Link
      to={to || "#"}
      className="block px-4 py-3 text-neutral-black hover:bg-neutral-gray-600 transition-colors font-body font-medium text-[16px]"
      onClick={onClick}
    >
      {children}
    </Link>
  );
}
