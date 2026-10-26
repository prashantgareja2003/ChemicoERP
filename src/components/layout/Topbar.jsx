import { useState } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import {
  Menu,
  Bell,
  Search,
  ChevronDown,
  CheckSquare,
  LogOut,
  AlertCircle,
  AlertTriangle,
  Info,
  CheckCircle2,
  Check,
  Sun,
  Moon,
} from 'lucide-react';
import { useErp } from '../../hooks/useErp';

const DUMMY_NOTIFICATIONS = [
  {
    id: 'n-1',
    title: 'QC Monograph Alert',
    message: 'Failed batch B-9021 (Refined Glycerin 99.7%) requires HOD re-processing clearance.',
    time: '5m ago',
    type: 'error',
    unread: true,
  },
  {
    id: 'n-2',
    title: 'Commercial Quotation Sign-off',
    message: 'Quotation CHZ/Q/1042 for Godrej Consumer Products submitted for executive approval.',
    time: '18m ago',
    type: 'warning',
    unread: true,
  },
  {
    id: 'n-3',
    title: 'Tanker Dispatch Scheduled',
    message: 'Road tanker GJ-12-BW-4821 checked into Dahej Gate #2 for outward bulk dispatch.',
    time: '45m ago',
    type: 'info',
    unread: true,
  },
  {
    id: 'n-4',
    title: 'Raw Material Inward Verified',
    message: '120 MT Caustic Soda Lye received and verified into Tank Farm #2.',
    time: '2h ago',
    type: 'success',
    unread: false,
  },
];

const ROUTE_NAMES = {
  '/': 'Live Plant Deck',
  '/production': 'Production',
  '/qc': 'QC Batch Releases',
  '/sales': 'Sales & Contracts',
  '/dispatch': 'Tanker Logistics',
  '/approvals': 'Approvals Queue',
  '/purchase': 'Purchase & Inward',
  '/inventory': 'Inventory & Stock',
  '/finance': 'Finance & Invoicing',
  '/masters': 'Masters Registry & Users',
  '/reports': 'Reports & Analytics',
};

export function Topbar({ onToggleSidebar, onOpenTracker, onOpenTasks }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, setCurrentUser, logout, users, quotations, purchaseOrders, qcRecords, theme, toggleTheme } = useErp();
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const [plantMenuOpen, setPlantMenuOpen] = useState(false);
  const [notifMenuOpen, setNotifMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState(DUMMY_NOTIFICATIONS);
  const [selectedUnit, setSelectedUnit] = useState('Unit #1 (Fatty Acids)');

  const currentPath = location.pathname;
  const currentTitle = ROUTE_NAMES[currentPath] || 'Operations';

  // Calculate task items for currentUser
  const myTaskCount =
    currentUser.role === 'HOD' || currentUser.role === 'Admin'
      ? quotations.filter((q) => q.status === 'awaiting approval').length +
        purchaseOrders.filter((p) => p.status === 'awaiting approval').length +
        qcRecords.filter((qc) => qc.status === 'failed').length
      : currentUser.role === 'Sales'
      ? quotations.filter((q) => q.status === 'approved').length
      : 2;

  return (
    <header className="erp-topbar">
      <div className="erp-topbar-left">
        <button
          type="button"
          className="erp-menu-btn"
          onClick={onToggleSidebar}
          aria-label="Open navigation menu"
        >
          <Menu size={20} />
        </button>

        <nav aria-label="Breadcrumb" className="erp-breadcrumbs">
          <Link to="/" className="erp-breadcrumb-item">Oleo Operations</Link>
          <span className="erp-breadcrumb-sep">/</span>
          <span className="erp-breadcrumb-item active">{currentTitle}</span>
        </nav>

        {/* Plant Unit Selector Pill from Screenshot */}
        <div style={{ position: 'relative' }}>
          <button
            type="button"
            className="erp-unit-badge"
            onClick={() => setPlantMenuOpen(!plantMenuOpen)}
          >
            <span>{selectedUnit}</span>
            <ChevronDown size={13} />
          </button>

          {plantMenuOpen && (
            <div
              className="erp-unit-dropdown"
              style={{
                position: 'absolute',
                top: '110%',
                left: 0,
                width: 200,
                maxWidth: 'calc(100vw - 20px)',
                boxSizing: 'border-box',
                background: '#FFFFFF',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-lg)',
                zIndex: 60,
                padding: '4px',
              }}
            >
              {[
                'Unit #1 (Fatty Acids)',
                'Unit #2 (Glycerin Refining)',
                'Unit #3 (Hydrogenation)',
                'Unit #4 (Bulk Silos & Tank Farm)',
              ].map((unit) => (
                <div
                  key={unit}
                  onClick={() => {
                    setSelectedUnit(unit);
                    setPlantMenuOpen(false);
                  }}
                  style={{
                    padding: '6px 10px',
                    fontSize: 'var(--font-size-xs)',
                    cursor: 'pointer',
                    borderRadius: 'var(--radius-sm)',
                    fontWeight: selectedUnit === unit ? 600 : 400,
                    background: selectedUnit === unit ? 'var(--color-bg-subtle)' : 'transparent',
                    color: selectedUnit === unit ? 'var(--color-primary-dark)' : 'var(--color-text-primary)',
                  }}
                >
                  {unit}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="erp-topbar-right">
        {/* Global Order Tracking Box with ⌘K (Desktop/Tablet) */}
        <div className="erp-topbar-search" onClick={onOpenTracker} style={{ cursor: 'pointer' }}>
          <div className="erp-search-wrap">
            <Search className="erp-search-icon" size={14} />
            <input
              type="text"
              readOnly
              className="erp-search-input"
              placeholder="Search batch, SO#, tanker... ⌘K"
              style={{ height: 32, fontSize: '0.75rem', cursor: 'pointer' }}
            />
          </div>
        </div>

        {/* Mobile-only Search Button */}
        <button
          type="button"
          className="erp-icon-btn erp-mobile-search-btn"
          onClick={onOpenTracker}
          title="Search batch, SO#, tanker... (⌘K)"
          aria-label="Search records"
        >
          <Search size={15} />
        </button>

        {/* My Tasks Button */}
        <button
          type="button"
          className="erp-icon-btn erp-tasks-btn"
          onClick={onOpenTasks}
          title="Open My Tasks Queue"
        >
          <CheckSquare size={15} color="#059669" />
          <span className="erp-tasks-btn-text">My Tasks</span>
          {myTaskCount > 0 && (
            <span className="erp-tasks-badge">
              {myTaskCount}
            </span>
          )}
        </button>

        {/* Notifications Icon Button & Dropdown */}
        <div style={{ position: 'relative' }}>
          <button
            type="button"
            className="erp-icon-btn"
            onClick={() => setNotifMenuOpen(!notifMenuOpen)}
            aria-label="View notifications"
            title="Pending Alerts & Plant Notices"
            style={{ position: 'relative' }}
          >
            <Bell size={16} color="#D97706" />
            {notifications.some((n) => n.unread) && <span className="erp-notification-badge" />}
          </button>

          {notifMenuOpen && (
            <div
              className="erp-notifications-dropdown"
              style={{
                position: 'absolute',
                top: '110%',
                right: -40,
                width: 340,
                maxWidth: 'calc(100vw - 24px)',
                background: 'var(--color-bg-card)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-modal)',
                zIndex: 70,
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  padding: '10px 14px',
                  background: 'var(--color-bg-subtle)',
                  borderBottom: '1px solid var(--color-border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                    Plant Notifications
                  </span>
                  <span
                    style={{
                      fontSize: '0.625rem',
                      fontWeight: 700,
                      padding: '1px 6px',
                      borderRadius: 'var(--radius-pill)',
                      background: 'var(--color-primary-dark)',
                      color: '#FFFFFF',
                    }}
                  >
                    {notifications.filter((n) => n.unread).length} new
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })))}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '0.6875rem',
                    color: 'var(--color-primary-dark)',
                    cursor: 'pointer',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 3,
                  }}
                >
                  <Check size={11} /> Mark all read
                </button>
              </div>

              <div style={{ maxHeight: 320, overflowY: 'auto' }}>
                {notifications.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => {
                      setNotifications((prev) =>
                        prev.map((n) => (n.id === item.id ? { ...n, unread: false } : n))
                      );
                    }}
                    style={{
                      padding: '10px 14px',
                      borderBottom: '1px solid var(--color-border-subtle)',
                      background: item.unread ? '#F8FAFC' : '#FFFFFF',
                      cursor: 'pointer',
                      display: 'flex',
                      gap: 10,
                      alignItems: 'flex-start',
                      transition: 'background 0.15s ease',
                    }}
                  >
                    <div style={{ marginTop: 2, flexShrink: 0 }}>
                      {item.type === 'error' && <AlertCircle size={15} color="var(--color-error)" />}
                      {item.type === 'warning' && <AlertTriangle size={15} color="var(--color-warning)" />}
                      {item.type === 'info' && <Info size={15} color="var(--color-info)" />}
                      {item.type === 'success' && <CheckCircle2 size={15} color="var(--color-action-green)" />}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                          {item.title}
                        </span>
                        <span style={{ fontSize: '0.625rem', color: 'var(--color-text-secondary)' }}>
                          {item.time}
                        </span>
                      </div>
                      <p style={{ margin: 0, fontSize: '0.6875rem', color: 'var(--color-text-secondary)', lineHeight: 1.35 }}>
                        {item.message}
                      </p>
                    </div>
                    {item.unread && (
                      <span
                        style={{
                          width: 6,
                          height: 6,
                          borderRadius: '50%',
                          background: 'var(--color-primary-dark)',
                          flexShrink: 0,
                          marginTop: 5,
                        }}
                      />
                    )}
                  </div>
                ))}
              </div>

              <div
                style={{
                  padding: '8px 14px',
                  background: 'var(--color-bg-subtle)',
                  textAlign: 'center',
                  fontSize: '0.6875rem',
                  color: 'var(--color-text-secondary)',
                  fontWeight: 600,
                  borderTop: '1px solid var(--color-border-subtle)',
                }}
              >
                Dahej Plant Gateway • 24x7 IoT Monitored
              </div>
            </div>
          )}
        </div>

        {/* Global Dark / Light Theme Toggle Button */}
        <button
          type="button"
          className="erp-icon-btn erp-theme-mode-btn"
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          aria-label="Toggle theme mode"
          style={{
            cursor: 'pointer',
            transition: 'all var(--transition-fast)',
          }}
        >
          {theme === 'dark' ? (
            <Sun size={16} color="#FBBF24" />
          ) : (
            <Moon size={16} color="#2563EB" />
          )}
        </button>

        {/* User Profile & Interactive Role Switcher matching screenshot */}
        <div style={{ position: 'relative' }}>
          <div
            className="erp-user-menu"
            onClick={() => setRoleMenuOpen(!roleMenuOpen)}
            title="Click to switch logged-in stakeholder role"
          >
            <div className="erp-avatar">
              {currentUser.name
                .split(' ')
                .map((n) => n[0])
                .join('')
                .substring(0, 2)}
            </div>
            <div className="erp-user-details">
              <span className="erp-user-name">{currentUser.name}</span>
              <span className="erp-user-role">
                {currentUser.role} • Dahej <ChevronDown size={11} style={{ display: 'inline', verticalAlign: -1 }} />
              </span>
            </div>
          </div>

          {/* Interactive Role Switcher Dropdown */}
          {roleMenuOpen && (
            <div
              className="erp-role-dropdown"
              style={{
                position: 'absolute',
                top: '110%',
                right: 0,
                width: 240,
                maxWidth: 'calc(100vw - 20px)',
                boxSizing: 'border-box',
                background: 'var(--color-bg-card)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-modal)',
                zIndex: 60,
                padding: '6px',
              }}
            >
              <div
                style={{
                  fontSize: '0.6875rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  color: 'var(--color-text-secondary)',
                  padding: '6px 8px 4px',
                  borderBottom: '1px solid var(--color-border-subtle)',
                }}
              >
                Switch Stakeholder Role:
              </div>

              {users.map((u) => (
                <div
                  key={u.id}
                  onClick={() => {
                    setCurrentUser(u);
                    setRoleMenuOpen(false);
                  }}
                  style={{
                    padding: '8px 10px',
                    fontSize: 'var(--font-size-xs)',
                    cursor: 'pointer',
                    borderRadius: 'var(--radius-md)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: currentUser.id === u.id ? 'var(--color-bg-subtle)' : 'transparent',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>{u.name}</div>
                    <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-secondary)' }}>{u.dept}</div>
                  </div>
                  <span
                    style={{
                      fontSize: '0.6875rem',
                      fontWeight: 700,
                      padding: '2px 6px',
                      borderRadius: 'var(--radius-pill)',
                      background: currentUser.id === u.id ? 'var(--color-primary-dark)' : 'var(--color-bg-subtle)',
                      color: currentUser.id === u.id ? '#FFFFFF' : 'var(--color-text-secondary)',
                    }}
                  >
                    {u.role}
                  </span>
                </div>
              ))}

              <div style={{ borderTop: '1px solid var(--color-border)', margin: '4px 0', paddingTop: '4px' }}>
                <Link
                  to="/login"
                  onClick={() => setRoleMenuOpen(false)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '8px 10px',
                    fontSize: 'var(--font-size-xs)',
                    color: 'var(--color-primary-dark)',
                    fontWeight: 600,
                    textDecoration: 'none',
                    borderRadius: 'var(--radius-md)',
                  }}
                >
                  <span>Switch Role / Quick Login</span>
                </Link>

                <button
                  type="button"
                  onClick={() => {
                    setRoleMenuOpen(false);
                    logout();
                    navigate('/login');
                  }}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '8px 10px',
                    fontSize: 'var(--font-size-xs)',
                    color: 'var(--color-error)',
                    fontWeight: 600,
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    borderRadius: 'var(--radius-md)',
                  }}
                >
                  <LogOut size={13} />
                  <span>Sign Out Session</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Topbar;
