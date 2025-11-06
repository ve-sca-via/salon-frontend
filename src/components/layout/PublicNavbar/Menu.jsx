import { useState } from "react";
import { MenuItem } from "./MenuItem";
import { MenuItemWithDropdown } from "./Dropdown";

export const SERVICES_ITEMS = [
  { label: "Hair Services", to: "/salons?category=hair" },
  { label: "Spa Services", to: "/salons?category=spa" },
  { label: "Nail Services", to: "/salons?category=nails" },
  { label: "Makeup Services", to: "/salons?category=makeup" },
];

export const PAGES_ITEMS = [
  { label: "About Us", to: "/about" },
  { label: "How It Works", to: "/how-it-works" },
  { label: "Testimonials", to: "/testimonials" },
  { label: "FAQ", to: "/faq" },
];

export function Menu({ onItemClick }) {
  const [servicesOpen, setServicesOpen] = useState(false);
  const [pagesOpen, setPagesOpen] = useState(false);

  return (
    <div className="hidden lg:flex content-stretch gap-[20px] items-start relative shrink-0">
      <MenuItem to="/" onClick={onItemClick}>
        Home
      </MenuItem>
      <MenuItem to="/salons" onClick={onItemClick}>
        Browse Salons
      </MenuItem>
      <MenuItemWithDropdown
        items={SERVICES_ITEMS}
        isOpen={servicesOpen}
        onToggle={() => {
          setServicesOpen(!servicesOpen);
          setPagesOpen(false);
        }}
      >
        Services
      </MenuItemWithDropdown>
      <MenuItemWithDropdown
        items={PAGES_ITEMS}
        isOpen={pagesOpen}
        onToggle={() => {
          setPagesOpen(!pagesOpen);
          setServicesOpen(false);
        }}
      >
        More
      </MenuItemWithDropdown>
    </div>
  );
}
