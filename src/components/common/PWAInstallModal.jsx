import { useState } from 'react';
import {
  Smartphone,
  Download,
  Share2,
  PlusSquare,
  CheckCircle2,
  X,
  ExternalLink,
  Laptop,
} from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';

export function PWAInstallModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div
      className="erp-modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      style={{ zIndex: 9999 }}
    >
      <div
        className="erp-modal erp-modal-md"
        style={{
          maxWidth: 480,
          background: 'var(--color-bg-card)',
          borderRadius: 16,
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          overflow: 'hidden',
          border: '1px solid var(--color-border)',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '16px 20px',
            background: 'linear-gradient(135deg, rgba(2, 132, 199, 0.12) 0%, rgba(15, 23, 42, 0.4) 100%)',
            borderBottom: '1px solid var(--color-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: 'linear-gradient(135deg, #0284C7, #06B6D4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF',
              }}
            >
              <Smartphone size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                Install Chemzora Mobile App
              </h3>
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                Directly from browser without App Store / Play Store
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--color-text-muted)',
              cursor: 'pointer',
              padding: 4,
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* App Preview Card */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              padding: '12px 14px',
              borderRadius: 12,
              background: 'var(--color-bg-subtle)',
              border: '1px solid var(--color-border)',
            }}
          >
            <img
              src="/icon-192.png"
              alt="Chemzora ERP"
              style={{ width: 48, height: 48, borderRadius: 10, objectFit: 'contain' }}
              onError={(e) => {
                e.currentTarget.src = '/logo.png';
              }}
            />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--color-text-primary)' }}>
                Chemzora ERP Mobile
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                Fast • Full Screen • Offline-Ready • Plant Telemetry
              </div>
            </div>
            <span
              style={{
                fontSize: '0.6875rem',
                fontWeight: 700,
                padding: '3px 8px',
                borderRadius: 999,
                background: 'rgba(16, 185, 129, 0.15)',
                color: '#10B981',
                border: '1px solid rgba(16, 185, 129, 0.3)',
              }}
            >
              PWA 2.0
            </span>
          </div>

          {/* OS Instructions Tabs / Steps */}
          <div>
            <h4 style={{ margin: '0 0 10px 0', fontSize: '0.8125rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
              Step-by-Step Installation:
            </h4>

            {/* Android / Chrome */}
            <div
              style={{
                padding: '12px',
                borderRadius: 8,
                background: 'var(--color-bg-card)',
                border: '1px solid var(--color-border)',
                marginBottom: 10,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, fontSize: '0.8rem', color: '#0284C7', marginBottom: 6 }}>
                <Smartphone size={14} /> Android (Chrome, Samsung Internet, Edge):
              </div>
              <ol style={{ margin: 0, paddingLeft: 18, fontSize: '0.75rem', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                <li>Tap the <strong>three dots (⋮)</strong> at the top right of your browser.</li>
                <li>Tap <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>.</li>
                <li>Tap <strong>"Install"</strong> to confirm. Chemzora icon will appear on your phone screen!</li>
              </ol>
            </div>

            {/* iOS / Safari */}
            <div
              style={{
                padding: '12px',
                borderRadius: 8,
                background: 'var(--color-bg-card)',
                border: '1px solid var(--color-border)',
                marginBottom: 10,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, fontSize: '0.8rem', color: '#0284C7', marginBottom: 6 }}>
                <Share2 size={14} /> iPhone & iPad (Safari):
              </div>
              <ol style={{ margin: 0, paddingLeft: 18, fontSize: '0.75rem', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                <li>Tap the <strong>Share button</strong> <Share2 size={12} style={{ display: 'inline', verticalAlign: 'middle' }} /> at the bottom of the screen.</li>
                <li>Scroll down and tap <strong>"Add to Home Screen"</strong> <PlusSquare size={12} style={{ display: 'inline', verticalAlign: 'middle' }} />.</li>
                <li>Tap <strong>"Add"</strong> in the top-right corner. Done!</li>
              </ol>
            </div>

            {/* Desktop */}
            <div
              style={{
                padding: '10px 12px',
                borderRadius: 8,
                background: 'var(--color-bg-subtle)',
                border: '1px solid var(--color-border)',
                fontSize: '0.72rem',
                color: 'var(--color-text-muted)',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <Laptop size={14} style={{ flexShrink: 0 }} />
              <span>
                <strong>Desktop:</strong> Click the <Download size={11} style={{ display: 'inline' }} /> install icon inside the browser address bar.
              </span>
            </div>
          </div>

          {/* Benefits */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 8,
              fontSize: '0.72rem',
              color: 'var(--color-text-secondary)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <CheckCircle2 size={13} color="#10B981" /> No URL bar / Full screen
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <CheckCircle2 size={13} color="#10B981" /> Instant 1-tap app launch
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <CheckCircle2 size={13} color="#10B981" /> Works offline & low 4G/5G
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <CheckCircle2 size={13} color="#10B981" /> Auto updates seamlessly
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '12px 20px',
            background: 'var(--color-bg-subtle)',
            borderTop: '1px solid var(--color-border)',
            display: 'flex',
            justifyContent: 'flex-end',
          }}
        >
          <button
            type="button"
            onClick={onClose}
            className="erp-btn erp-btn-primary"
            style={{
              padding: '8px 18px',
              fontSize: '0.8125rem',
              fontWeight: 600,
              borderRadius: 8,
            }}
          >
            Understood
          </button>
        </div>
      </div>
    </div>
  );
}

export function PWAInstallButton({ variant = 'topbar', className = '' }) {
  const { isInstallable, isInstalled, promptInstall, showIOSModal, setShowIOSModal } = usePWAInstall();

  // If already opened as installed standalone app, hide the button
  if (isInstalled) return null;

  return (
    <>
      <button
        type="button"
        onClick={promptInstall}
        className={`cz-pwa-install-btn cz-pwa-btn-${variant} ${className}`}
        title="Install Chemzora ERP as a Mobile App"
        aria-label="Install Chemzora App"
      >
        <Smartphone size={14} className="cz-pwa-icon" />
        <span className="cz-pwa-text">Install App</span>
      </button>

      <PWAInstallModal
        isOpen={showIOSModal}
        onClose={() => setShowIOSModal(false)}
      />
    </>
  );
}

export default PWAInstallButton;
