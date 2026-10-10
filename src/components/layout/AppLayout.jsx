import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import OrderTrackerModal from '../common/OrderTrackerModal';
import MyTasksModal from '../common/MyTasksModal';
import { useErp } from '../../hooks/useErp';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

/**
 * Enterprise Application Shell Layout
 */
export function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [trackerOpen, setTrackerOpen] = useState(false);
  const [tasksOpen, setTasksOpen] = useState(false);
  const { notification, dismissNotification } = useErp();

  const toggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="erp-shell">
      {/* Toast Notification Banner */}
      {notification && (
        <div
          style={{
            position: 'fixed',
            top: 70,
            right: 24,
            zIndex: 100,
            background: notification.type === 'error' ? 'var(--color-error)' : 'var(--color-primary-dark)',
            color: '#FFFFFF',
            padding: '10px 18px',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-lg)',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            fontSize: 'var(--font-size-xs)',
            fontWeight: 500,
            border: '1px solid rgba(255,255,255,0.2)',
            animation: 'fadeIn 0.2s ease-out',
          }}
        >
          {notification.type === 'error' ? (
            <AlertCircle size={16} color="#FFFFFF" />
          ) : (
            <CheckCircle2 size={16} color="var(--color-action-green)" />
          )}
          <span>{notification.message}</span>
          <button
            type="button"
            onClick={dismissNotification}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'rgba(255,255,255,0.7)',
              cursor: 'pointer',
              marginLeft: 8,
              padding: 2,
              display: 'flex',
              alignItems: 'center',
            }}
            title="Dismiss notice"
          >
            <X size={14} />
          </button>
        </div>
      )}

      <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />

      <div className="erp-main-area">
        <Topbar
          onToggleSidebar={toggleSidebar}
          onOpenTracker={() => setTrackerOpen(true)}
          onOpenTasks={() => setTasksOpen(true)}
        />

        <main className="erp-content">
          <Outlet />
        </main>
      </div>

      {/* Global Modals */}
      <OrderTrackerModal isOpen={trackerOpen} onClose={() => setTrackerOpen(false)} />
      <MyTasksModal isOpen={tasksOpen} onClose={() => setTasksOpen(false)} />
    </div>
  );
}

export default AppLayout;
