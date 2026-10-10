import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, LayoutDashboard, KeyRound } from 'lucide-react';
import { useErp } from '../../hooks/useErp';
import { ROLE_PERMISSIONS } from '../../services/rolePermissions';

export function AccessDeniedPage() {
  const { currentUser } = useErp();
  const currentRole = currentUser?.role || 'User';
  const roleMeta = ROLE_PERMISSIONS[currentRole];

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '70vh',
        padding: 'var(--space-6)',
      }}
    >
      <div
        style={{
          maxWidth: 540,
          width: '100%',
          backgroundColor: '#FFFFFF',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--color-border)',
          boxShadow: 'var(--shadow-card)',
          padding: 'var(--space-8)',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: '50%',
            backgroundColor: '#FEF2F2',
            border: '1px solid #FECACA',
            color: '#DC2626',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto var(--space-4)',
          }}
        >
          <ShieldAlert size={32} />
        </div>

        <h1
          style={{
            fontSize: 'var(--font-size-xl)',
            fontWeight: 700,
            color: 'var(--color-text-primary)',
            marginBottom: 'var(--space-2)',
          }}
        >
          Module Access Restricted
        </h1>

        <p
          style={{
            fontSize: 'var(--font-size-sm)',
            color: 'var(--color-text-secondary)',
            marginBottom: 'var(--space-6)',
            lineHeight: 1.5,
          }}
        >
          Your current session is authenticated as <strong>{currentUser?.name}</strong> with the{' '}
          <span
            style={{
              padding: '2px 8px',
              borderRadius: 'var(--radius-pill)',
              backgroundColor: 'var(--color-bg-subtle)',
              fontWeight: 600,
              color: 'var(--color-primary-dark)',
              border: '1px solid var(--color-border)',
            }}
          >
            {currentRole}
          </span>{' '}
          role. This department module is not permitted under this security profile.
        </p>

        {roleMeta && (
          <div
            style={{
              backgroundColor: 'var(--color-bg-subtle)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-lg)',
              padding: 'var(--space-4)',
              textAlign: 'left',
              marginBottom: 'var(--space-6)',
            }}
          >
            <div
              style={{
                fontSize: 'var(--font-size-xs)',
                fontWeight: 600,
                color: 'var(--color-text-primary)',
                marginBottom: 'var(--space-1)',
              }}
            >
              Role Scope: {roleMeta.label}
            </div>
            <div
              style={{
                fontSize: '0.75rem',
                color: 'var(--color-text-secondary)',
                lineHeight: 1.4,
              }}
            >
              {roleMeta.description}
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'center' }}>
          <Link
            to="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 18px',
              backgroundColor: 'var(--color-primary-dark)',
              color: '#FFFFFF',
              borderRadius: 'var(--radius-md)',
              fontSize: 'var(--font-size-sm)',
              fontWeight: 600,
              textDecoration: 'none',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <LayoutDashboard size={16} />
            <span>Return to Dashboard</span>
          </Link>

          <Link
            to="/login"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 18px',
              backgroundColor: '#FFFFFF',
              color: 'var(--color-text-primary)',
              borderRadius: 'var(--radius-md)',
              fontSize: 'var(--font-size-sm)',
              fontWeight: 600,
              textDecoration: 'none',
              border: '1px solid var(--color-border)',
            }}
          >
            <KeyRound size={16} />
            <span>Switch Role / Re-login</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default AccessDeniedPage;
