import { Link } from "react-router-dom";
import { Menu } from "./Menu";
import { Actions } from "./Actions";
import { HamburgerIcon } from "./Icons";

export function Navigation({ onMenuToggle, isMenuOpen }) {
  return (
    <div className="content-stretch flex gap-[20px] md:gap-[60px] lg:gap-[120px] xl:gap-[237px] items-center justify-between relative w-full max-w-[1296px]">
      <Link
        to="/"
        className="font-display font-bold leading-[24px] relative shrink-0 text-[20px] text-black text-center text-nowrap whitespace-pre"
      >
        Lubist
      </Link>
      <Menu />
      <Actions />

      {/* Mobile Hamburger Menu */}
      <button
        className="lg:hidden p-2 hover:bg-neutral-gray-600 rounded-md transition-colors"
        onClick={onMenuToggle}
        aria-label="Toggle menu"
      >
        <HamburgerIcon isOpen={isMenuOpen} />
      </button>
    </div>
  );
}
