// import { useState } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import { useSelector, useDispatch } from "react-redux";
// import { logout } from "../../store/slices/authSlice";
// import { clearCart } from "../../store/slices/cartSlice";
// import { toast } from "react-toastify";

// function MenuItem({ children, to, onClick }) {
//   return (
//     <Link
//       to={to || "#"}
//       className="box-border content-stretch flex gap-[10px] items-start p-[5px] relative shrink-0 cursor-pointer hover:opacity-70 transition-opacity"
//       onClick={onClick}
//     >
//       <p className="font-body font-medium leading-[24px] relative shrink-0 text-neutral-black text-[14px] text-center text-nowrap whitespace-pre">
//         {children}
//       </p>
//     </Link>
//   );
// }

// function MobileMenuItem({ children, to, onClick }) {
//   return (
//     <Link
//       to={to || "#"}
//       className="block px-4 py-3 text-neutral-black hover:bg-neutral-gray-600 transition-colors font-body font-medium text-[16px]"
//       onClick={onClick}
//     >
//       {children}
//     </Link>
//   );
// }

// function DropdownIcon({ isOpen }) {
//   return (
//     <div className="relative size-[20px]">
//       <svg
//         className="block size-full"
//         fill="none"
//         preserveAspectRatio="none"
//         viewBox="0 0 20 20"
//       >
//         <g>
//           <path
//             clipRule="evenodd"
//             d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
//             fill="#000000"
//             fillRule="evenodd"
//           />
//         </g>
//       </svg>
//     </div>
//   );
// }

// function MenuItemWithDropdown({ children, items, isOpen, onToggle }) {
//   return (
//     <div className="relative">
//       <div
//         className="box-border content-stretch flex gap-[5px] items-center p-[5px] relative shrink-0 cursor-pointer hover:opacity-70 transition-opacity"
//         onClick={onToggle}
//       >
//         <p className="font-body font-medium leading-[24px] relative shrink-0 text-neutral-black text-[14px] text-center text-nowrap whitespace-pre">
//           {children}
//         </p>
//         <div className="flex items-center justify-center relative shrink-0">
//           <div
//             className={`flex-none transition-transform ${
//               isOpen ? "" : "rotate-[180deg]"
//             }`}
//           >
//             <DropdownIcon isOpen={isOpen} />
//           </div>
//         </div>
//       </div>

//       {isOpen && items && (
//         <div className="absolute top-full left-0 mt-2 bg-white shadow-lg rounded-md py-2 min-w-[160px] z-50">
//           {items.map((item, index) => (
//             <Link
//               key={index}
//               to={item.to}
//               className="block px-4 py-2 hover:bg-neutral-gray-600 cursor-pointer font-body font-medium text-[14px] text-neutral-black transition-colors"
//             >
//               {item.label}
//             </Link>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// }

// function MobileDropdown({ children, items, isOpen, onToggle, onItemClick }) {
//   return (
//     <div>
//       <button
//         className="w-full flex items-center justify-between px-4 py-3 text-neutral-black hover:bg-neutral-gray-600 transition-colors font-body font-medium text-[16px]"
//         onClick={onToggle}
//       >
//         <span>{children}</span>
//         <div
//           className={`transition-transform ${isOpen ? "" : "rotate-[180deg]"}`}
//         >
//           <DropdownIcon isOpen={isOpen} />
//         </div>
//       </button>
//       {isOpen && items && (
//         <div className="bg-neutral-gray-600/50">
//           {items.map((item, index) => (
//             <Link
//               key={index}
//               to={item.to}
//               className="block px-8 py-2 text-neutral-black hover:bg-neutral-gray-600 transition-colors font-body text-[14px]"
//               onClick={onItemClick}
//             >
//               {item.label}
//             </Link>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// }

// function Menu({ onItemClick }) {
//   const [servicesOpen, setServicesOpen] = useState(false);
//   const [pagesOpen, setPagesOpen] = useState(false);

//   const servicesItems = [
//     { label: "Hair Services", to: "/salons?category=hair" },
//     { label: "Spa Services", to: "/salons?category=spa" },
//     { label: "Nail Services", to: "/salons?category=nails" },
//     { label: "Makeup Services", to: "/salons?category=makeup" },
//   ];

//   const pagesItems = [
//     { label: "About Us", to: "/about" },
//     { label: "How It Works", to: "/how-it-works" },
//     { label: "Testimonials", to: "/testimonials" },
//     { label: "FAQ", to: "/faq" },
//   ];

//   return (
//     <div className="hidden lg:flex content-stretch gap-[20px] items-start relative shrink-0">
//       <MenuItem to="/" onClick={onItemClick}>
//         Home
//       </MenuItem>
//       <MenuItem to="/salons" onClick={onItemClick}>
//         Browse Salons
//       </MenuItem>
//       <MenuItemWithDropdown
//         items={servicesItems}
//         isOpen={servicesOpen}
//         onToggle={() => {
//           setServicesOpen(!servicesOpen);
//           setPagesOpen(false);
//         }}
//       >
//         Services
//       </MenuItemWithDropdown>
//       <MenuItemWithDropdown
//         items={pagesItems}
//         isOpen={pagesOpen}
//         onToggle={() => {
//           setPagesOpen(!pagesOpen);
//           setServicesOpen(false);
//         }}
//       >
//         More
//       </MenuItemWithDropdown>
//     </div>
//   );
// }

// function MobileMenu({ isOpen, onClose }) {
//   const [servicesOpen, setServicesOpen] = useState(false);
//   const [pagesOpen, setPagesOpen] = useState(false);
//   const navigate = useNavigate();
//   const dispatch = useDispatch();
//   const { isAuthenticated, user } = useSelector((state) => state.auth);

//   const servicesItems = [
//     { label: "Hair Services", to: "/salons?category=hair" },
//     { label: "Spa Services", to: "/salons?category=spa" },
//     { label: "Nail Services", to: "/salons?category=nails" },
//     { label: "Makeup Services", to: "/salons?category=makeup" },
//   ];

//   const pagesItems = [
//     { label: "About Us", to: "/about" },
//     { label: "How It Works", to: "/how-it-works" },
//     { label: "Testimonials", to: "/testimonials" },
//     { label: "FAQ", to: "/faq" },
//   ];

//   const handleLogout = async () => {
//     try {
//       console.log("Mobile logout button clicked");
//       onClose();

//       // Clear JWT tokens from localStorage
//       localStorage.removeItem('access_token');
//       localStorage.removeItem('refresh_token');
//       console.log("Tokens cleared from localStorage");

//       // Clear Redux state
//       dispatch(logout());
//       dispatch(clearCart());
//       console.log("Redux state cleared");

//       toast.success("Logged out successfully", {
//         position: "top-center",
//         autoClose: 2000,
//         style: {
//           backgroundColor: "#000000",
//           color: "#fff",
//           fontFamily: "DM Sans, sans-serif",
//         },
//       });

//       navigate("/");
//       console.log("Navigated to home");
//     } catch (error) {
//       console.error("Mobile logout error:", error);
//       toast.error("Error logging out", {
//         position: "top-center",
//         autoClose: 2000,
//         style: {
//           backgroundColor: "#EF4444",
//           color: "#fff",
//           fontFamily: "DM Sans, sans-serif",
//         },
//       });
//     }
//   };

//   const truncateName = (name) => {
//     if (!name) return "User";
//     if (name.length <= 20) return name;
//     return name.substring(0, 20) + "...";
//   };

//   const getRoleBasedDashboard = () => {
//     switch (user?.role) {
//       case 'customer':
//         return '/customer/dashboard';
//       case 'vendor':
//       case 'salon':
//         return '/vendor/dashboard';
//       case 'relationship_manager':
//         return '/hmr/dashboard';
//       case 'admin':
//         return '/admin/dashboard';
//       default:
//         return '/';
//     }
//   };

//   if (!isOpen) return null;

//   return (
//     <div className="lg:hidden bg-white border-t border-neutral-gray-600 shadow-lg">
//       <div className="flex flex-col">
//         <MobileMenuItem to="/" onClick={onClose}>
//           Home
//         </MobileMenuItem>
//         <MobileMenuItem to="/salons" onClick={onClose}>
//           Browse Salons
//         </MobileMenuItem>

//         <MobileDropdown
//           items={servicesItems}
//           isOpen={servicesOpen}
//           onToggle={() => {
//             setServicesOpen(!servicesOpen);
//             setPagesOpen(false);
//           }}
//           onItemClick={onClose}
//         >
//           Services
//         </MobileDropdown>

//         <MobileDropdown
//           items={pagesItems}
//           isOpen={pagesOpen}
//           onToggle={() => {
//             setPagesOpen(!pagesOpen);
//             setServicesOpen(false);
//           }}
//           onItemClick={onClose}
//         >
//           More
//         </MobileDropdown>

//         <div className="border-t border-neutral-gray-600 mt-2 pt-2 px-4 pb-4 space-y-2">
//           <button
//             className="w-full bg-gradient-orange flex gap-2 items-center justify-center px-4 py-3 rounded-md hover:opacity-90 transition-opacity"
//             onClick={() => {
//               navigate("/salons");
//               onClose();
//             }}
//           >
//             <span className="font-body font-medium text-[14px] text-white">
//               Book Appointment
//             </span>
//           </button>

//           {isAuthenticated && user ? (
//             <>
//               <div className="text-center py-2">
//                 <p className="font-body text-sm text-neutral-black">
//                   Welcome,{" "}
//                   <span className="font-medium">{truncateName(user.full_name)}</span>
//                 </p>
//               </div>
//               <button
//                 className="w-full bg-primary-600 flex gap-2 items-center justify-center px-4 py-3 rounded-md hover:opacity-90 transition-opacity"
//                 onClick={() => {
//                   navigate(getRoleBasedDashboard());
//                   onClose();
//                 }}
//               >
//                 <span className="font-body font-medium text-[14px] text-white">
//                   Go to Dashboard
//                 </span>
//               </button>
//               <button
//                 className="w-full bg-neutral-black flex gap-2 items-center justify-center px-4 py-3 rounded-md hover:opacity-90 transition-opacity"
//                 onClick={handleLogout}
//               >
//                 <span className="font-body font-medium text-[14px] text-white">
//                   Logout
//                 </span>
//               </button>
//             </>
//           ) : (
//             <button
//               className="w-full bg-neutral-black flex gap-2 items-center justify-center px-4 py-3 rounded-md hover:opacity-90 transition-opacity"
//               onClick={() => {
//                 navigate("/login");
//                 onClose();
//               }}
//             >
//               <span className="font-body font-medium text-[14px] text-white">
//                 Login / Sign Up
//               </span>
//             </button>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }

// function HamburgerIcon({ isOpen }) {
//   return (
//     <div className="w-6 h-6 flex flex-col justify-center items-center gap-1">
//       <span
//         className={`w-6 h-0.5 bg-neutral-black transition-all ${
//           isOpen ? "rotate-45 translate-y-1.5" : ""
//         }`}
//       ></span>
//       <span
//         className={`w-6 h-0.5 bg-neutral-black transition-all ${
//           isOpen ? "opacity-0" : ""
//         }`}
//       ></span>
//       <span
//         className={`w-6 h-0.5 bg-neutral-black transition-all ${
//           isOpen ? "-rotate-45 -translate-y-1.5" : ""
//         }`}
//       ></span>
//     </div>
//   );
// }

// function CalendarIcon() {
//   return (
//     <div className="relative shrink-0 size-[14px]">
//       <svg
//         className="block size-full"
//         fill="none"
//         preserveAspectRatio="none"
//         viewBox="0 0 14 14"
//       >
//         <g>
//           <rect
//             x="2"
//             y="3"
//             width="10"
//             height="9"
//             rx="1"
//             stroke="white"
//             strokeWidth="1.5"
//             fill="none"
//           />
//           <line
//             x1="2"
//             y1="5.5"
//             x2="12"
//             y2="5.5"
//             stroke="white"
//             strokeWidth="1.5"
//           />
//           <line
//             x1="4.5"
//             y1="1"
//             x2="4.5"
//             y2="4"
//             stroke="white"
//             strokeWidth="1.5"
//             strokeLinecap="round"
//           />
//           <line
//             x1="9.5"
//             y1="1"
//             x2="9.5"
//             y2="4"
//             stroke="white"
//             strokeWidth="1.5"
//             strokeLinecap="round"
//           />
//         </g>
//       </svg>
//     </div>
//   );
// }

// function AppointmentButton() {
//   const navigate = useNavigate();

//   return (
//     <button
//       className="hidden lg:flex bg-gradient-orange box-border content-stretch gap-[8px] items-center justify-center px-[16px] py-[8px] relative rounded-[5px] shrink-0 cursor-pointer hover:opacity-90 transition-opacity"
//       onClick={() => navigate("/salons")}
//     >
//       <CalendarIcon />
//       <p className="font-body font-medium leading-[24px] relative shrink-0 text-[14px] text-center text-nowrap text-white whitespace-pre">
//         Book Appointment
//       </p>
//     </button>
//   );
// }

// function UserIcon() {
//   return (
//     <div className="relative shrink-0 size-[14px]">
//       <svg
//         className="block size-full"
//         fill="none"
//         preserveAspectRatio="none"
//         viewBox="0 0 14 14"
//       >
//         <g>
//           <circle
//             cx="7"
//             cy="4.5"
//             r="2.5"
//             stroke="white"
//             strokeWidth="1.5"
//             fill="none"
//           />
//           <path
//             d="M2 12.5c0-2.5 2.24-4.5 5-4.5s5 2 5 4.5"
//             stroke="white"
//             strokeWidth="1.5"
//             strokeLinecap="round"
//             fill="none"
//           />
//         </g>
//       </svg>
//     </div>
//   );
// }

// function AuthButton() {
//   const navigate = useNavigate();
//   const dispatch = useDispatch();
//   const { isAuthenticated, user } = useSelector((state) => state.auth);
//   const [showDropdown, setShowDropdown] = useState(false);

//   const handleLogout = async () => {
//     try {
//       console.log("Logout button clicked");
//       setShowDropdown(false);

//       // Clear JWT tokens from localStorage
//       localStorage.removeItem('access_token');
//       localStorage.removeItem('refresh_token');
//       console.log("Tokens cleared from localStorage");

//       // Clear Redux state
//       dispatch(logout());
//       dispatch(clearCart());
//       console.log("Redux state cleared");

//       toast.success("Logged out successfully", {
//         position: "top-center",
//         autoClose: 2000,
//         style: {
//           backgroundColor: "#000000",
//           color: "#fff",
//           fontFamily: "DM Sans, sans-serif",
//         },
//       });

//       navigate("/");
//       console.log("Navigated to home");
//     } catch (error) {
//       console.error("Logout error:", error);
//       toast.error("Error logging out", {
//         position: "top-center",
//         autoClose: 2000,
//         style: {
//           backgroundColor: "#EF4444",
//           color: "#fff",
//           fontFamily: "DM Sans, sans-serif",
//         },
//       });
//     }
//   };

//   const truncateName = (name) => {
//     if (!name) return "User";
//     if (name.length <= 15) return name;
//     return name.substring(0, 15) + "...";
//   };

//   const getRoleBasedDashboard = () => {
//     switch (user?.role) {
//       case 'customer':
//         return '/customer/dashboard';
//       case 'vendor':
//       case 'salon':
//         return '/vendor/dashboard';
//       case 'relationship_manager':
//         return '/hmr/dashboard';
//       case 'admin':
//         return '/admin/dashboard';
//       default:
//         return '/';
//     }
//   };

//   if (isAuthenticated && user) {
//     return (
//       <div className="relative">
//         <button
//           className="hidden lg:flex bg-neutral-black box-border content-stretch gap-[8px] items-center justify-center px-[16px] py-[8px] relative rounded-[5px] shrink-0 cursor-pointer hover:opacity-90 transition-opacity"
//           onClick={() => setShowDropdown(!showDropdown)}
//         >
//           <UserIcon />
//           <p className="font-body font-medium leading-[24px] relative shrink-0 text-[14px] text-center text-nowrap text-white whitespace-pre">
//             {truncateName(user.full_name)}
//           </p>
//         </button>

//         {showDropdown && (
//           <>
//             <div
//               className="fixed inset-0 z-10"
//               onClick={() => setShowDropdown(false)}
//             ></div>
//             <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-20 border border-neutral-gray-600">
//               <button
//                 onClick={() => {
//                   navigate(getRoleBasedDashboard());
//                   setShowDropdown(false);
//                 }}
//                 className="block w-full text-left px-4 py-2 text-sm text-neutral-black hover:bg-neutral-gray-600 font-body font-semibold"
//               >
//                 Dashboard
//               </button>
//               <button
//                 onClick={() => {
//                   navigate("/my-bookings");
//                   setShowDropdown(false);
//                 }}
//                 className="block w-full text-left px-4 py-2 text-sm text-neutral-black hover:bg-neutral-gray-600 font-body"
//               >
//                 My Bookings
//               </button>
//               <button
//                 onClick={() => {
//                   navigate("/cart");
//                   setShowDropdown(false);
//                 }}
//                 className="block w-full text-left px-4 py-2 text-sm text-neutral-black hover:bg-neutral-gray-600 font-body"
//               >
//                 My Cart
//               </button>
//               <button
//                 onClick={handleLogout}
//                 className="block w-full text-left px-4 py-2 text-sm text-neutral-black hover:bg-neutral-gray-600 font-body border-t border-neutral-gray-600"
//               >
//                 Logout
//               </button>
//             </div>
//           </>
//         )}
//       </div>
//     );
//   }

//   return (
//     <button
//       className="hidden lg:flex bg-neutral-black box-border content-stretch gap-[8px] items-center justify-center px-[16px] py-[8px] relative rounded-[5px] shrink-0 cursor-pointer hover:opacity-90 transition-opacity"
//       onClick={() => navigate("/login")}
//     >
//       <UserIcon />
//       <p className="font-body font-medium leading-[24px] relative shrink-0 text-[14px] text-center text-nowrap text-white whitespace-pre">
//         Login / Sign Up
//       </p>
//     </button>
//   );
// }

// function Actions() {
//   const navigate = useNavigate();
//   const cart = useSelector((state) => state.cart);

//   return (
//     <div className="hidden lg:flex basis-0 content-stretch gap-[8px] grow items-center justify-end min-h-px min-w-px relative shrink-0">
//       {/* Cart Icon */}
//       <button
//         onClick={() => navigate("/cart")}
//         className="relative p-2 hover:bg-neutral-gray-600 rounded-md transition-colors"
//       >
//         <svg
//           className="w-6 h-6 text-neutral-black"
//           fill="none"
//           viewBox="0 0 24 24"
//           stroke="currentColor"
//         >
//           <path
//             strokeLinecap="round"
//             strokeLinejoin="round"
//             strokeWidth={2}
//             d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
//           />
//         </svg>
//         {cart.itemCount > 0 && (
//           <span className="absolute -top-1 -right-1 bg-accent-orange text-primary-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
//             {cart.itemCount}
//           </span>
//         )}
//       </button>

//       <AppointmentButton />
//       <AuthButton />
//     </div>
//   );
// }

// function Navigation({ onMenuToggle, isMenuOpen }) {
//   return (
//     <div className="content-stretch flex gap-[20px] md:gap-[60px] lg:gap-[120px] xl:gap-[237px] items-center justify-between relative w-full max-w-[1296px]">
//       <Link
//         to="/"
//         className="font-display font-bold leading-[24px] relative shrink-0 text-[20px] text-black text-center text-nowrap whitespace-pre"
//       >
//         SalonHub
//       </Link>
//       <Menu />
//       <Actions />

//       {/* Mobile Hamburger Menu */}
//       <button
//         className="lg:hidden p-2 hover:bg-neutral-gray-600 rounded-md transition-colors"
//         onClick={onMenuToggle}
//         aria-label="Toggle menu"
//       >
//         <HamburgerIcon isOpen={isMenuOpen} />
//       </button>
//     </div>
//   );
// }

// export default function PublicNavbar() {
//   const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

//   const toggleMobileMenu = () => {
//     setIsMobileMenuOpen(!isMobileMenuOpen);
//   };

//   const closeMobileMenu = () => {
//     setIsMobileMenuOpen(false);
//   };

//   return (
//     <div className="bg-white shadow-[0px_2px_8px_0px_rgba(0,0,0,0.1)] w-full sticky top-0 z-50">
//       <div className="flex flex-col items-center justify-center w-full">
//         <div className="box-border content-stretch flex flex-col gap-[10px] items-center justify-center py-[20px] px-[16px] md:px-[20px] relative w-full">
//           <Navigation
//             onMenuToggle={toggleMobileMenu}
//             isMenuOpen={isMobileMenuOpen}
//           />
//         </div>
//       </div>
//       <MobileMenu isOpen={isMobileMenuOpen} onClose={closeMobileMenu} />
//     </div>
//   );
// }
