import { useState } from "react";
import { MenuItem } from "./MenuItem";
import { MenuItemWithDropdown } from "./Dropdown";

export const MORE_ITEMS = [
  { label: "How It Works", to: "/how-it-works" },
  { label: "Testimonials", to: "/testimonials" },
  { label: "FAQ", to: "/faq" },
];

/** @deprecated Use MORE_ITEMS */
export const PAGES_ITEMS = MORE_ITEMS;

export function Menu({ onItemClick }) {
  const [pagesOpen, setPagesOpen] = useState(false);

  return (
    <div className="hidden lg:flex gap-[16px] items-start relative shrink-0">
      <MenuItem to="/" onClick={onItemClick}>
        Home
      </MenuItem>
      <MenuItem to="/salons" onClick={onItemClick}>
        Browse Salons
      </MenuItem>
      <MenuItem to="/about" onClick={onItemClick}>
        About Us
      </MenuItem>
      <MenuItemWithDropdown
        items={MORE_ITEMS}
        isOpen={pagesOpen}
        onToggle={() => setPagesOpen(!pagesOpen)}
      >
        More
      </MenuItemWithDropdown>
    </div>
  );
}
