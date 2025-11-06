import { Link } from "react-router-dom";
import { DropdownIcon } from "./Icons";

export function MenuItemWithDropdown({ children, items, isOpen, onToggle }) {
  return (
    <div className="relative">
      <div
        className="box-border content-stretch flex gap-[5px] items-center p-[5px] relative shrink-0 cursor-pointer hover:opacity-70 transition-opacity"
        onClick={onToggle}
      >
        <p className="font-body font-medium leading-[24px] relative shrink-0 text-neutral-black text-[14px] text-center text-nowrap whitespace-pre">
          {children}
        </p>
        <div className="flex items-center justify-center relative shrink-0">
          <div
            className={`flex-none transition-transform ${
              isOpen ? "" : "rotate-[180deg]"
            }`}
          >
            <DropdownIcon isOpen={isOpen} />
          </div>
        </div>
      </div>

      {isOpen && items && (
        <div className="absolute top-full left-0 mt-2 bg-white shadow-lg rounded-md py-2 min-w-[160px] z-50">
          {items.map((item, index) => (
            <Link
              key={index}
              to={item.to}
              className="block px-4 py-2 hover:bg-neutral-gray-600 cursor-pointer font-body font-medium text-[14px] text-neutral-black transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export function MobileDropdown({ children, items, isOpen, onToggle, onItemClick }) {
  return (
    <div>
      <button
        className="w-full flex items-center justify-between px-4 py-3 text-neutral-black hover:bg-neutral-gray-600 transition-colors font-body font-medium text-[16px]"
        onClick={onToggle}
      >
        <span>{children}</span>
        <div
          className={`transition-transform ${isOpen ? "" : "rotate-[180deg]"}`}
        >
          <DropdownIcon isOpen={isOpen} />
        </div>
      </button>
      {isOpen && items && (
        <div className="bg-neutral-gray-600/50">
          {items.map((item, index) => (
            <Link
              key={index}
              to={item.to}
              className="block px-8 py-2 text-neutral-black hover:bg-neutral-gray-600 transition-colors font-body text-[14px]"
              onClick={onItemClick}
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
