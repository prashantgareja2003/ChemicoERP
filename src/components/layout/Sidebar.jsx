import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Factory,
  FlaskConical,
  ShoppingCart,
  Truck,
  CheckCircle2,
  Boxes,
  ShoppingBag,
  Receipt,
  Database,
  BarChart3,
  X,
} from 'lucide-react';
import { useErp } from '../../hooks/useErp';

import logoImg from '../../assets/logo.png';

import { isRouteAllowedForRole } from '../../services/rolePermissions';

export function Sidebar({ isOpen, onClose }) {
  const { currentUser, quotations, purchaseOrders, qcRecords } = useErp();

  // Calculate pending approvals count
  const pendingCount =
    quotations.filter((q) => q.status === 'awaiting approval').length +
    purchaseOrders.filter((p) => p.status === 'awaiting approval').length +
    qcRecords.filter((qc) => qc.status === 'failed' && qc.failedDetails?.decisionStatus.includes('Awaiting')).length;

  const role = currentUser?.role || 'Admin';

  const allSections = [
    {
      title: 'Core Plant Ops',
      items: [
        {
          to: '/',
          label: 'Operations Deck',
          icon: LayoutDashboard,
          color: '#2563EB', // Blue
          bgColor: '#EFF6FF',
        },
        {
          to: '/production',
          label: 'Production',
          icon: Factory,
          color: '#EA580C', // Orange / Reactor Heat
          bgColor: '#FFF7ED',
        },
        {
          to: '/qc',
          label: 'QC Batch Releases',
          icon: FlaskConical,
          color: '#9333EA', // Purple / Chemical Lab
          bgColor: '#FAF5FF',
        },
      ],
    },
    {
      title: 'Supply & Logistics',
      items: [
        {
          to: '/sales',
          label: 'Sales & Contracts',
          icon: ShoppingCart,
          color: '#0D9488', // Teal
          bgColor: '#F0FDFA',
        },
        {
          to: '/dispatch',
          label: 'Tanker Logistics',
          icon: Truck,
          color: '#0284C7', // Sky Blue
          bgColor: '#F0F9FF',
        },
        {
          to: '/approvals',
          label: 'Approvals Queue',
          icon: CheckCircle2,
          badge: String(pendingCount),
          color: '#16A34A', // Green
          bgColor: '#F0FDF4',
        },
        {
          to: '/purchase',
          label: 'Purchase & Inward',
          icon: ShoppingBag,
          color: '#D97706', // Amber
          bgColor: '#FFFBEB',
        },
        {
          to: '/inventory',
          label: 'Inventory & Stock',
          icon: Boxes,
          color: '#4F46E5', // Indigo
          bgColor: '#EEF2FF',
        },
      ],
    },
    {
      title: 'Finance & Administration',
      items: [
        {
          to: '/finance',
          label: 'Finance & Invoicing',
          icon: Receipt,
          color: '#059669', // Emerald
          bgColor: '#ECFDF5',
        },
        {
          to: '/masters',
          label: 'Masters & Users',
          icon: Database,
          color: '#E11D48', // Rose / Red
          bgColor: '#FFF1F2',
        },
        {
          to: '/reports',
          label: 'Reports & Analytics',
          icon: BarChart3,
          color: '#7C3AED', // Violet
          bgColor: '#F5F3FF',
        },
      ],
    },
  ];

  // Strictly filter navigation by role permissions
  const visibleSections = allSections
    .map((sec) => ({
      ...sec,
      items: sec.items.filter((item) => isRouteAllowedForRole(role, item.to)),
    }))
    .filter((sec) => sec.items.length > 0);

  return (
    <>
      {/* Mobile backdrop */}
      <div
        className={`erp-drawer-backdrop ${isOpen ? 'open' : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside className={`erp-sidebar ${isOpen ? 'mobile-open' : ''}`}>
        {/* Header / Brand matching screenshot */}
        <div className="erp-sidebar-header">
          <NavLink to="/" className="erp-sidebar-brand" onClick={onClose}>
            <img src={logoImg} alt="SDF Logo" className="erp-brand-logo" />
            <div className="erp-brand-title">
              <span className="erp-brand-name">SDF Oilchems</span>
              <span className="erp-brand-tagline">Enterprise ERP</span>
            </div>
          </NavLink>

          <button
            type="button"
            className="erp-sidebar-close-btn"
            onClick={onClose}
            aria-label="Close sidebar"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation list */}
        <nav className="erp-sidebar-nav">
          {visibleSections.map((sec, secIdx) => (
            <div key={sec.title || secIdx}>
              <div className="erp-nav-section-title">{sec.title}</div>
              {sec.items.map((item) => {
                const IconComponent = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.to === '/'}
                    className={({ isActive }) =>
                      `erp-nav-item ${isActive ? 'active' : ''}`
                    }
                    onClick={onClose}
                  >
                    {({ isActive }) => (
                      <>
                        <div className="erp-nav-item-content">
                          <span
                            className="erp-nav-icon-badge"
                            style={{
                              backgroundColor: isActive ? 'rgba(255, 255, 255, 0.2)' : item.bgColor,
                              color: isActive ? '#FFFFFF' : item.color,
                            }}
                          >
                            <IconComponent size={16} strokeWidth={2.2} />
                          </span>
                          <span>{item.label}</span>
                        </div>
                        {item.badge && item.badge !== '0' && (
                          <span className="erp-nav-pill">{item.badge}</span>
                        )}
                      </>
                    )}
                  </NavLink>
                );
              })}
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
}

export default Sidebar;
