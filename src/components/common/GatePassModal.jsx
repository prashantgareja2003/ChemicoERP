import { useState } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import ConfettiCelebration from './ConfettiCelebration';
import {
  Printer,
  Truck,
  ShieldCheck,
  CheckCircle2,
  QrCode,
  Scale,
  FileCheck2,
  Lock,
  Building2,
  User,
} from 'lucide-react';

export function GatePassModal({
  isOpen,
  onClose,
  consignment,
  availableConsignments = [],
  onSelectConsignment,
}) {
  const [showCelebration, setShowCelebration] = useState(true);
  const [celebrationKey, setCelebrationKey] = useState(1);

  if (!isOpen) return null;

  const active = consignment || availableConsignments[0] || {
    id: 'GP-2026-OCT-8921',
    soNumber: 'SO-2026-8939',
    deliveryId: 'D1',
    client: 'Pidilite Industries Ltd',
    consignee: 'Pidilite Industries Ltd, Plant Unit #2, Vapi, Gujarat',
    product: 'Distilled Oleic Acid',
    spec: 'Special Grade 90+ (Cosmetic / Pharma Spec)',
    volume: '24 MT',
    weightMT: 24,
    vehicleNo: 'GJ-16-AX-8921',
    driverName: 'Rameshwar B. Patel',
    driverContact: '+91 98251 44921',
    driverLicense: 'GJ16-2018-009124',
    transporter: 'SafeChem Bulk Carriers Ltd',
    grossWeightKg: 38280,
    tareWeightKg: 14280,
    netWeightKg: 24000,
    sealTop: 'SC-9912A',
    sealBottom: 'SC-9912B',
    inTime: '07:15 AM',
    outTime: '10:30 AM',
    gateNo: 'Security Gate #2 (Tanker Outward Terminal)',
    ewayBill: '2410 8829 4410',
    invoiceNo: 'INV-2026-1082',
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      <ConfettiCelebration
        key={celebrationKey}
        active={showCelebration}
        duration={3500}
        onComplete={() => setShowCelebration(false)}
      />

      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Chemical Outward Road Tanker Gate Pass"
        description="Official factory gate security clearance & weighbridge outward manifest."
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={onClose}>
              Close
            </Button>
            <Button
              variant="primary"
              icon={<Printer size={15} />}
              onClick={handlePrint}
            >
              Print Official Gate Pass
            </Button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Celebratory Banner */}
          <div
            style={{
              padding: '10px 16px',
              borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 50%, #FEF3C7 100%)',
              border: '1px solid #10B981',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              boxShadow: '0 2px 8px rgba(16, 185, 129, 0.15)',
              animation: 'pulse 2s infinite',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span
                style={{
                  fontSize: '1.4rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  animation: 'bounce 1s infinite alternate',
                }}
              >
                🎉
              </span>
              <div>
                <strong style={{ color: '#065F46', fontSize: '0.85rem' }}>
                  ROAD TANKER OUTWARD CLEARANCE GRANTED!
                </strong>
                <div style={{ fontSize: '0.75rem', color: '#047857' }}>
                  All QC parameters passed • Weighbridge verified • Gate Pass #{active.id || 'GP-2026-8921'} is ready for exit.
                </div>
              </div>
            </div>
            <span
              style={{
                background: '#059669',
                color: '#FFFFFF',
                fontSize: '0.6875rem',
                fontWeight: 700,
                padding: '4px 10px',
                borderRadius: '999px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                letterSpacing: '0.03em',
              }}
            >
              <CheckCircle2 size={13} /> GATE CLEARED
            </span>
          </div>

          {/* Consignment Selector if multiple available */}
          {availableConsignments.length > 1 && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 12px',
                background: 'var(--color-bg-subtle)',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--color-border)',
                fontSize: '0.75rem',
              }}
            >
              <Truck size={14} style={{ color: 'var(--color-primary-dark)' }} />
              <strong>Select Vehicle / Consignment:</strong>
              <select
                style={{
                  padding: '4px 8px',
                  borderRadius: 4,
                  border: '1px solid var(--color-border)',
                  fontSize: '0.75rem',
                  background: '#FFFFFF',
                  cursor: 'pointer',
                }}
                value={active.vehicleNo}
                onChange={(e) => {
                  const found = availableConsignments.find((c) => (c.vehicleNo || c.vesselName) === e.target.value);
                  if (found && onSelectConsignment) onSelectConsignment(found);
                }}
              >
                {availableConsignments.map((c, i) => (
                  <option key={c.id || i} value={c.vehicleNo || c.vesselName}>
                    {c.vehicleNo || c.vesselName || 'Tanker'} — {c.consignee || c.client} ({c.weightMT || c.volume || '24 MT'})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* The Formal Gate Pass Printable Layout */}
          <div
            id="printable-gate-pass"
            style={{
              padding: '24px 28px',
              border: '2px solid #0F172A',
              borderRadius: '8px',
              background: '#FFFFFF',
              color: '#0F172A',
              fontFamily: 'system-ui, -apple-system, sans-serif',
              position: 'relative',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.06)',
            }}
          >
            {/* Background Security Watermark */}
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%) rotate(-25deg)',
                fontSize: '4.5rem',
                fontWeight: 900,
                color: 'rgba(16, 185, 129, 0.05)',
                whiteSpace: 'nowrap',
                pointerEvents: 'none',
                letterSpacing: '0.15em',
                userSelect: 'none',
              }}
            >
              CHEMZORA GATE PASS CLEARED
            </div>

            {/* Document Header */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                borderBottom: '2px solid #0F172A',
                paddingBottom: 14,
                marginBottom: 14,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <img
                  src="/logo.png"
                  alt="Chemzora Logo"
                  style={{ width: 54, height: 54, objectFit: 'contain' }}
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
                <div>
                  <h2
                    style={{
                      margin: 0,
                      fontSize: '1.25rem',
                      fontWeight: 800,
                      letterSpacing: '0.04em',
                      color: '#047857',
                    }}
                  >
                    CHEMZORA OILCHEM LIMITED
                  </h2>
                  <div style={{ fontSize: '0.6875rem', color: '#475569', marginTop: 2, lineHeight: 1.35 }}>
                    Plot No. 1201, GIDC Industrial Estate, Dahej, Bharuch, Gujarat 392130<br />
                    <strong>GSTIN:</strong> 24AAACS8912P1ZA • <strong>CIN:</strong> U24230GJ2005PLC046123<br />
                    <em>ISO 9001:2015, ISO 14001:2015 & GMP Certified Dahej Plant #1</em>
                  </div>
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div
                  style={{
                    fontSize: '0.7rem',
                    fontWeight: 800,
                    color: '#FFFFFF',
                    background: '#0F172A',
                    padding: '3px 8px',
                    borderRadius: 3,
                    display: 'inline-block',
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase',
                  }}
                >
                  ROAD TANKER OUTWARD GATE PASS
                </div>
                <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A', marginTop: 4, fontFamily: 'monospace' }}>
                  {active.id || 'GP-2026-OCT-8921'}
                </div>
                <div style={{ fontSize: '0.6875rem', color: '#64748B', marginTop: 2 }}>
                  Issue Date: <strong>{new Date().toLocaleDateString('en-GB')}</strong>
                </div>
                <div style={{ fontSize: '0.6875rem', color: '#059669', fontWeight: 600 }}>
                  Gate Out Time: <strong>{active.outTime || '10:30 AM'}</strong>
                </div>
              </div>
            </div>

            {/* Quick Barcode & Gate Pass Details Bar */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: '#F8FAFC',
                padding: '8px 12px',
                borderRadius: 4,
                border: '1px solid #E2E8F0',
                marginBottom: 14,
                fontSize: '0.7rem',
              }}
            >
              <div>
                <strong>Terminal Gate:</strong> {active.gateNo || 'Security Gate #2 (Tanker Bay)'} • <strong>In-Time:</strong> {active.inTime || '07:15 AM'}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'monospace', fontWeight: 700 }}>
                <QrCode size={16} />
                <span>VERIFY: CHZ-GP-{active.vehicleNo?.replace(/-/g, '') || 'GJ16AX8921'}</span>
              </div>
            </div>

            {/* Grid 1: Transporter, Driver & Vehicle */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: 12,
                marginBottom: 12,
              }}
            >
              {/* Box 1: Tanker Details */}
              <div
                style={{
                  border: '1px solid #CBD5E1',
                  borderRadius: 4,
                  padding: '10px 12px',
                  background: '#FFFFFF',
                  fontSize: '0.71875rem',
                }}
              >
                <div
                  style={{
                    fontWeight: 700,
                    color: '#0F172A',
                    borderBottom: '1px solid #E2E8F0',
                    paddingBottom: 4,
                    marginBottom: 6,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <Truck size={13} style={{ color: '#0D9488' }} /> FLEET & VEHICLE PARTICULARS
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '4px 8px' }}>
                  <span style={{ color: '#64748B' }}>Tanker Reg. No:</span>
                  <strong style={{ fontFamily: 'monospace', color: '#0F172A' }}>{active.vehicleNo || 'GJ-16-AX-8921'}</strong>

                  <span style={{ color: '#64748B' }}>Carrier / Line:</span>
                  <span>{active.transporter || 'SafeChem Bulk Carriers Ltd'}</span>

                  <span style={{ color: '#64748B' }}>Driver Name:</span>
                  <strong>{active.driverName || 'Rameshwar B. Patel'}</strong>

                  <span style={{ color: '#64748B' }}>Driving License:</span>
                  <span style={{ fontFamily: 'monospace' }}>{active.driverLicense || 'GJ16-2018-009124'}</span>

                  <span style={{ color: '#64748B' }}>Driver Mobile:</span>
                  <span>{active.driverContact || '+91 98251 44921'}</span>
                </div>
              </div>

              {/* Box 2: Consignee & Order */}
              <div
                style={{
                  border: '1px solid #CBD5E1',
                  borderRadius: 4,
                  padding: '10px 12px',
                  background: '#FFFFFF',
                  fontSize: '0.71875rem',
                }}
              >
                <div
                  style={{
                    fontWeight: 700,
                    color: '#0F172A',
                    borderBottom: '1px solid #E2E8F0',
                    paddingBottom: 4,
                    marginBottom: 6,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <Building2 size={13} style={{ color: '#2563EB' }} /> CONSIGNMENT & DESTINATION
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '4px 8px' }}>
                  <span style={{ color: '#64748B' }}>Consignee Name:</span>
                  <strong>{active.client || active.consignee?.split(',')[0] || 'Pidilite Industries Ltd'}</strong>

                  <span style={{ color: '#64748B' }}>Destination Plant:</span>
                  <span>{active.consignee || 'Plant Unit #2, Vapi Industrial Zone, Gujarat'}</span>

                  <span style={{ color: '#64748B' }}>Sales Order Ref:</span>
                  <strong style={{ color: '#0D9488' }}>{active.soNumber || 'SO-2026-8939'} ({active.deliveryId || 'D1'})</strong>

                  <span style={{ color: '#64748B' }}>Tax Invoice No:</span>
                  <span>{active.invoiceNo || 'INV-2026-1082'}</span>

                  <span style={{ color: '#64748B' }}>E-Way Bill No:</span>
                  <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{active.ewayBill || '2410 8829 4410'}</span>
                </div>
              </div>
            </div>

            {/* Grid 2: Chemical Product & Weighbridge Bridge Slip */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: 12,
                marginBottom: 14,
              }}
            >
              {/* Product & QC Clearance */}
              <div
                style={{
                  border: '1px solid #CBD5E1',
                  borderRadius: 4,
                  padding: '10px 12px',
                  background: '#FFFFFF',
                  fontSize: '0.71875rem',
                }}
              >
                <div
                  style={{
                    fontWeight: 700,
                    color: '#0F172A',
                    borderBottom: '1px solid #E2E8F0',
                    paddingBottom: 4,
                    marginBottom: 6,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <FileCheck2 size={13} style={{ color: '#9333EA' }} /> CHEMICAL SPECIFICATION & QC
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '4px 8px' }}>
                  <span style={{ color: '#64748B' }}>Product Name:</span>
                  <strong>{active.product || 'Distilled Oleic Acid'}</strong>

                  <span style={{ color: '#64748B' }}>Grade & Spec:</span>
                  <span>{active.spec || 'Special Grade 90+ (Cosmetic / Pharma Spec)'}</span>

                  <span style={{ color: '#64748B' }}>HSN Code:</span>
                  <span>29054500</span>

                  <span style={{ color: '#64748B' }}>Lab QC Clearance:</span>
                  <strong style={{ color: '#059669' }}>✓ Released (Assay &gt; 99.7%)</strong>

                  <span style={{ color: '#64748B' }}>Tanker Condition:</span>
                  <span>Passivated & Nitrogen Blanketed</span>
                </div>
              </div>

              {/* Weighbridge Weights & Security Seals */}
              <div
                style={{
                  border: '1px solid #10B981',
                  borderRadius: 4,
                  padding: '10px 12px',
                  background: '#F0FDF4',
                  fontSize: '0.71875rem',
                }}
              >
                <div
                  style={{
                    fontWeight: 700,
                    color: '#065F46',
                    borderBottom: '1px solid #A7F3D0',
                    paddingBottom: 4,
                    marginBottom: 6,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <Scale size={13} style={{ color: '#059669' }} /> WEIGHBRIDGE BRIDGE CERTIFICATION
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '4px 8px' }}>
                  <span style={{ color: '#047857' }}>Gross Weight:</span>
                  <strong>{active.grossWeightKg ? `${active.grossWeightKg.toLocaleString()} kg` : '38,280 kg'}</strong>

                  <span style={{ color: '#047857' }}>Tare Weight (Empty):</span>
                  <span>{active.tareWeightKg ? `${active.tareWeightKg.toLocaleString()} kg` : '14,280 kg'}</span>

                  <span style={{ color: '#047857' }}>Net Payload:</span>
                  <strong style={{ color: '#047857', fontSize: '0.8rem' }}>
                    {active.netWeightKg ? `${active.netWeightKg.toLocaleString()} kg (${active.weightMT || 24} MT)` : `${active.volume || '24 MT'}`}
                  </strong>

                  <span style={{ color: '#047857', display: 'flex', alignItems: 'center', gap: 3 }}>
                    <Lock size={11} /> Top Dome Seal:
                  </span>
                  <strong style={{ fontFamily: 'monospace' }}>{active.sealTop || 'SC-9912A'}</strong>

                  <span style={{ color: '#047857', display: 'flex', alignItems: 'center', gap: 3 }}>
                    <Lock size={11} /> Valve Seal:
                  </span>
                  <strong style={{ fontFamily: 'monospace' }}>{active.sealBottom || 'SC-9912B'}</strong>
                </div>
              </div>
            </div>

            {/* Official Signatures & Digital Clearance Stamp */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: 8,
                borderTop: '2px dashed #CBD5E1',
                paddingTop: 14,
                marginTop: 8,
                fontSize: '0.65625rem',
                textAlign: 'center',
              }}
            >
              <div>
                <div style={{ color: '#059669', fontWeight: 700, fontFamily: 'cursive', fontSize: '0.85rem' }}>
                  D. M. Joshi
                </div>
                <div style={{ borderTop: '1px solid #94A3B8', paddingTop: 2, marginTop: 4 }}>
                  <strong>Weighbridge Operator</strong><br />
                  <span style={{ color: '#64748B' }}>Weight Calibrated</span>
                </div>
              </div>

              <div>
                <div style={{ color: '#2563EB', fontWeight: 700, fontFamily: 'cursive', fontSize: '0.85rem' }}>
                  Dr. Neha Shah
                </div>
                <div style={{ borderTop: '1px solid #94A3B8', paddingTop: 2, marginTop: 4 }}>
                  <strong>QA/QC Chemist</strong><br />
                  <span style={{ color: '#64748B' }}>Batch Spec Cleared</span>
                </div>
              </div>

              <div>
                <div style={{ color: '#0D9488', fontWeight: 700, fontFamily: 'cursive', fontSize: '0.85rem' }}>
                  Sunil Verma
                </div>
                <div style={{ borderTop: '1px solid #94A3B8', paddingTop: 2, marginTop: 4 }}>
                  <strong>Logistics & Dispatch</strong><br />
                  <span style={{ color: '#64748B' }}>Fleet Inward Cleared</span>
                </div>
              </div>

              {/* Security Official Stamp Box */}
              <div
                style={{
                  border: '2px solid #059669',
                  borderRadius: 4,
                  padding: '4px',
                  background: '#ECFDF5',
                  color: '#065F46',
                }}
              >
                <div style={{ fontWeight: 800, fontSize: '0.625rem', letterSpacing: '0.04em' }}>
                  ★ SECURITY GATE #2 ★
                </div>
                <div style={{ fontSize: '0.59375rem', fontWeight: 700, margin: '2px 0' }}>
                  OUTWARD DISPATCH CLEARED
                </div>
                <div style={{ fontSize: '0.5625rem', color: '#047857' }}>
                  Officer: Insp. R. Jadeja
                </div>
              </div>
            </div>

            {/* Note & Disclaimer */}
            <div
              style={{
                marginTop: 10,
                fontSize: '0.59375rem',
                color: '#64748B',
                textAlign: 'center',
                borderTop: '1px solid #E2E8F0',
                paddingTop: 6,
              }}
            >
              This is a computer-verified Chemical Plant Outward Gate Pass authorized by Chemzora Oilchem Limited Dahej Security Control. Tampering with seals or documentation is strictly prohibited under Chemical Transport Safety Regulations.
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
}

export default GatePassModal;
