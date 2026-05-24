import React from 'react';
import { Link } from 'react-router-dom';
import { FiCalendar, FiPackage, FiScissors, FiUsers } from 'react-icons/fi';

const CARD_SHADOW =
  'shadow-[0_1px_3px_rgba(0,0,0,0.05),0_4px_20px_rgba(248,158,7,0.08)]';

const ICON_CIRCLE = 'w-10 h-10 rounded-full bg-[#FDEBCC] flex items-center justify-center';

/**
 * Figma node 3:1760 — Section - Quick Actions (3×2 grid, 350×248)
 * https://www.figma.com/design/tdkk9FHNGGtFS92PWnYAMJ/Untitled?node-id=3-1732
 */
const VENDOR_ACTIONS = [
  {
    key: 'bookings',
    label: 'Bookings',
    to: '/vendor/bookings',
    renderIcon: () => (
      <span className="font-vendor text-[16px] font-black leading-4 text-[#F89E07]">+</span>
    ),
  },
  {
    key: 'staff',
    label: 'Staff\nSchedule',
    to: '/vendor/bookings',
    iconSrc: '/vendor/quick-actions/staff-schedule.png',
    iconW: 20,
    iconH: 16,
  },
  {
    key: 'services',
    label: 'Manage\nServices',
    to: '/vendor/services',
    iconSrc: '/vendor/quick-actions/manage-services.png',
    iconW: 16,
    iconH: 16,
  },
  {
    key: 'promo',
    label: 'Run\nPromo',
    to: '/vendor/promo',
    iconSrc: '/vendor/quick-actions/run-promo.png',
    iconW: 16,
    iconH: 16,
  },
  {
    key: 'discounts',
    label: 'Manage\nDiscounts',
    to: '/vendor/services',
    iconSrc: '/vendor/quick-actions/manage-discounts.png',
    iconW: 16,
    iconH: 14,
  },
  {
    key: 'products',
    label: 'Products',
    to: '/products',
    renderIcon: () => <FiPackage className="text-[#F89E07]" size={18} strokeWidth={2.5} />,
  },
];

const REGULAR_BUYER_ACTIONS = [
  {
    key: 'products',
    label: 'Browse\nProducts',
    to: '/products',
    renderIcon: () => <FiScissors className="text-[#F89E07]" size={16} strokeWidth={2.5} />,
  },
  {
    key: 'orders',
    label: 'My\nOrders',
    to: '/customer/my-orders',
    renderIcon: () => <FiCalendar className="text-[#F89E07]" size={16} strokeWidth={2.5} />,
  },
  {
    key: 'profile',
    label: 'Profile',
    to: '/vendor/profile',
    renderIcon: () => <FiUsers className="text-[#F89E07]" size={16} strokeWidth={2.5} />,
  },
];

const ActionIcon = ({ action }) => {
  if (action.renderIcon) {
    return <div className={ICON_CIRCLE}>{action.renderIcon()}</div>;
  }
  return (
    <div className={ICON_CIRCLE}>
      <img
        src={action.iconSrc}
        alt=""
        width={action.iconW}
        height={action.iconH}
        className="object-contain"
        draggable={false}
      />
    </div>
  );
};

const VendorQuickActions = ({ isRegularBuyer }) => {
  const actions = isRegularBuyer ? REGULAR_BUYER_ACTIONS : VENDOR_ACTIONS;

  return (
    <section>
      <h2 className="font-vendor text-[14px] font-bold leading-5 text-[#2D3748] uppercase tracking-wide mb-4">
        Quick Actions
      </h2>
      <div className="grid grid-cols-3 gap-2 w-full">
        {actions.map((action) => (
          <Link
            key={action.key}
            to={action.to}
            className={`flex flex-col items-center justify-center gap-2 min-h-[118px] bg-white rounded-[24px] ${CARD_SHADOW} px-3 py-4 hover:bg-white transition-colors`}
          >
            <ActionIcon action={action} />
            <span className="font-vendor text-[12px] font-semibold leading-4 text-[#2D3748] text-center whitespace-pre-line">
              {action.label}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default VendorQuickActions;
