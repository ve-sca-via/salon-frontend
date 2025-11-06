# PublicNavbar Component Structure

This navbar has been refactored into smaller, modular components for easier maintenance and styling.

## File Structure

```
PublicNavbar/
├── index.js                    # Exports all components
├── Navigation.jsx              # Main navigation container (28 lines)
├── Menu.jsx                    # Desktop menu with dropdowns (56 lines)
├── MobileMenu.jsx              # Mobile menu with auth logic (173 lines)
├── MenuItem.jsx                # Menu item components (26 lines)
├── Dropdown.jsx                # Dropdown components (70 lines)
├── Actions.jsx                 # Cart, appointment, auth buttons (39 lines)
├── AppointmentButton.jsx       # Book appointment button (18 lines)
├── AuthButton.jsx              # Login/user menu button (142 lines)
└── Icons.jsx                   # SVG icon components (107 lines)
```

## Main Entry Point

**`PublicNavbar.jsx`** (27 lines) - The main component that imports and assembles everything

## Component Breakdown

### Navigation.jsx
- Main navigation container
- Renders logo, Menu, Actions, and hamburger button
- Handles mobile menu toggle

### Menu.jsx
- Desktop navigation menu (hidden on mobile)
- Contains: Home, Browse Salons, Services dropdown, More dropdown
- Exports `SERVICES_ITEMS` and `PAGES_ITEMS` constants

### MobileMenu.jsx
- Mobile slide-down menu
- Contains navigation + auth buttons
- Handles logout logic for mobile

### Actions.jsx
- Right side actions (Cart, Appointment, Auth)
- Desktop only (hidden on mobile)

### AuthButton.jsx
- Shows "Login/Sign Up" for guests
- Shows user name + dropdown menu for authenticated users
- Dropdown contains: Dashboard, My Bookings, My Cart, Logout

### AppointmentButton.jsx
- Orange gradient button to book appointments
- Navigates to /salons

### MenuItem.jsx
- `MenuItem` - Desktop menu item
- `MobileMenuItem` - Mobile menu item

### Dropdown.jsx
- `MenuItemWithDropdown` - Desktop dropdown menu
- `MobileDropdown` - Mobile dropdown menu

### Icons.jsx
- `DropdownIcon` - Chevron for dropdowns
- `HamburgerIcon` - Animated hamburger menu
- `CalendarIcon` - Calendar icon for appointment button
- `UserIcon` - User icon for auth button

## Usage

Import the main component:
```jsx
import PublicNavbar from "../../components/layout/PublicNavbar";

function MyPage() {
  return (
    <>
      <PublicNavbar />
      {/* page content */}
    </>
  );
}
```

## Styling

All components use design tokens:
- Colors: `neutral-black`, `neutral-gray-600`, `accent-orange`, `bg-gradient-orange`
- Typography: `font-body`, `font-display`
- Responsive: `hidden lg:flex`, `lg:hidden`

To change styles, edit the specific component file directly.

## Navigation Items

To add/remove navigation items, edit:
- **Desktop**: `Menu.jsx` - Edit `SERVICES_ITEMS` or `PAGES_ITEMS`
- **Mobile**: Same arrays are imported in `MobileMenu.jsx`

## Authentication

Auth logic is in:
- `AuthButton.jsx` - Desktop logout
- `MobileMenu.jsx` - Mobile logout

Both use the same Redux actions:
- `logout()` from `authSlice`
- `clearCart()` from `cartSlice`

## Old File

The original 705-line file is backed up as `PublicNavbar.old.jsx`
