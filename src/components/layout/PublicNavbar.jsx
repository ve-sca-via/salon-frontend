import { useState } from "react";
import { Navigation } from "./PublicNavbar/Navigation";
import { MobileMenu } from "./PublicNavbar/MobileMenu";

export default function PublicNavbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="bg-white shadow-[0px_2px_8px_0px_rgba(0,0,0,0.1)] w-full sticky top-0 z-50">
      <div className="flex flex-col items-center justify-center w-full">
        <div className="box-border content-stretch flex flex-col gap-[10px] items-center justify-center py-[20px] px-[16px] md:px-[20px] relative w-full">
          <Navigation
            onMenuToggle={toggleMobileMenu}
            isMenuOpen={isMobileMenuOpen}
          />
        </div>
      </div>
      <MobileMenu isOpen={isMobileMenuOpen} onClose={closeMobileMenu} />
    </div>
  );
}
