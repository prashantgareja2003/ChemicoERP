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
    // Dismiss confetti animation so particles never bleed into print output
    setShowCelebration(false);

    const printElement = document.getElementById('printable-gate-pass');
    if (!printElement) {
      document.body.classList.add('cz-printing-active');
      window.print();
      setTimeout(() => {
        document.body.classList.remove('cz-printing-active');
      }, 500);
      return;
    }

    try {
      // Remove any leftover iframe
      const existingIframe = document.getElementById('cz-gatepass-print-frame');
      if (existingIframe) existingIframe.remove();

      // Create isolated invisible iframe for single-page 100% clean print
      const iframe = document.createElement('iframe');
      iframe.id = 'cz-gatepass-print-frame';
      iframe.style.position = 'fixed';
      iframe.style.right = '0';
      iframe.style.bottom = '0';
      iframe.style.width = '0';
      iframe.style.height = '0';
      iframe.style.border = '0';
      iframe.style.visibility = 'hidden';
      document.body.appendChild(iframe);

      const frameDoc = iframe.contentWindow || iframe.contentDocument;
      const doc = frameDoc.document || frameDoc;

      doc.open();
      doc.write(`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Chemzora Road Tanker Gate Pass - ${active.id || 'GP-2026'}</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 8mm 10mm;
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    html, body {
      margin: 0;
      padding: 0;
      width: 100%;
      background: #FFFFFF;
      color: #0F172A;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      font-size: 11px;
      line-height: 1.35;
    }
    svg {
      display: inline-block;
      vertical-align: middle;
    }
    .cz-gatepass-doc {
      position: relative;
      width: 100%;
      max-width: 100%;
      padding: 14px 18px;
      border: 2px solid #0F172A;
      border-radius: 6px;
      background: #FFFFFF;
      overflow: hidden;
      box-sizing: border-box;
      page-break-inside: avoid !important;
      break-inside: avoid !important;
    }
    .cz-gatepass-watermark {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) rotate(-25deg);
      font-size: 3.2rem;
      font-weight: 900;
      letter-spacing: 0.08em;
      color: rgba(16, 185, 129, 0.07);
      white-space: nowrap;
      pointer-events: none;
      z-index: 0;
    }
    .cz-gatepass-header {
      position: relative;
      z-index: 1;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2px solid #0F172A;
      padding-bottom: 8px;
      margin-bottom: 8px;
    }
    .cz-gatepass-brand {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .cz-gatepass-logo {
      width: 46px;
      height: 46px;
      object-fit: contain;
    }
    .cz-gatepass-company-name {
      font-size: 1.15rem;
      font-weight: 800;
      color: #047857;
      margin: 0;
      letter-spacing: -0.01em;
    }
    .cz-gatepass-company-address {
      font-size: 0.65625rem;
      color: #475569;
      margin-top: 2px;
      line-height: 1.3;
    }
    .cz-gatepass-meta-right {
      text-align: right;
    }
    .cz-gatepass-title-badge {
      font-size: 0.6875rem;
      font-weight: 800;
      color: #FFFFFF;
      background: #0F172A;
      padding: 3px 8px;
      border-radius: 3px;
      display: inline-block;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }
    .cz-gatepass-id-num {
      font-size: 1rem;
      font-weight: 800;
      color: #0F172A;
      margin-top: 2px;
      font-family: monospace;
    }
    .cz-gatepass-date-row {
      font-size: 0.6875rem;
      color: #64748B;
      margin-top: 2px;
    }
    .cz-gatepass-barcode-bar {
      position: relative;
      z-index: 1;
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: #F8FAFC;
      padding: 5px 10px;
      border-radius: 4px;
      border: 1px solid #E2E8F0;
      margin-bottom: 8px;
      font-size: 0.6875rem;
    }
    .cz-gatepass-barcode-verify {
      display: flex;
      align-items: center;
      gap: 6px;
      font-family: monospace;
      font-weight: 700;
      color: #0F172A;
    }
    .cz-gatepass-grid-2col {
      position: relative;
      z-index: 1;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
      margin-bottom: 8px;
    }
    .cz-gatepass-info-box {
      border: 1px solid #CBD5E1;
      border-radius: 4px;
      padding: 8px 10px;
      font-size: 0.6875rem;
      background: #FFFFFF;
      page-break-inside: avoid !important;
      break-inside: avoid !important;
    }
    .cz-gatepass-info-box.weighbridge-box {
      border-color: #10B981;
      background: #F0FDF4;
    }
    .cz-gatepass-box-title {
      font-weight: 700;
      color: #0F172A;
      border-bottom: 1px solid #E2E8F0;
      padding-bottom: 3px;
      margin-bottom: 5px;
      display: flex;
      align-items: center;
      gap: 5px;
      font-size: 0.6875rem;
    }
    .cz-gatepass-info-box.weighbridge-box .cz-gatepass-box-title {
      color: #065F46;
      border-color: #A7F3D0;
    }
    .cz-gatepass-subgrid {
      display: grid;
      grid-template-columns: 110px 1fr;
      gap: 3px 6px;
      line-height: 1.35;
    }
    .cz-gatepass-subgrid-label {
      color: #64748B;
    }
    .cz-gatepass-info-box.weighbridge-box .cz-gatepass-subgrid-label {
      color: #047857;
    }
    .cz-gatepass-signatures-grid {
      position: relative;
      z-index: 1;
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 8px;
      border-top: 2px dashed #CBD5E1;
      padding-top: 8px;
      margin-top: 6px;
      font-size: 0.65625rem;
      text-align: center;
      page-break-inside: avoid !important;
      break-inside: avoid !important;
    }
    .cz-gatepass-sig-name {
      font-weight: 700;
      font-family: Georgia, cursive, serif;
      font-size: 0.88rem;
      margin-bottom: 2px;
    }
    .cz-gatepass-sig-meta {
      border-top: 1px solid #94A3B8;
      padding-top: 2px;
      margin-top: 3px;
    }
    .cz-gatepass-security-stamp {
      border: 2px solid #059669;
      border-radius: 4px;
      padding: 3px 5px;
      background: #ECFDF5;
      color: #065F46;
    }
    .cz-gatepass-disclaimer {
      position: relative;
      z-index: 1;
      margin-top: 6px;
      font-size: 0.53125rem;
      color: #64748B;
      text-align: center;
      border-top: 1px solid #E2E8F0;
      padding-top: 4px;
      line-height: 1.3;
    }
  </style>
</head>
<body>
  ${printElement.outerHTML}
</body>
</html>`);
      doc.close();

      setTimeout(() => {
        try {
          iframe.contentWindow.focus();
          iframe.contentWindow.print();
        } catch (err) {
          document.body.classList.add('cz-printing-active');
          window.print();
          setTimeout(() => {
            document.body.classList.remove('cz-printing-active');
          }, 500);
        }
        setTimeout(() => {
          if (iframe && iframe.parentNode) iframe.parentNode.removeChild(iframe);
        }, 2500);
      }, 150);
    } catch (e) {
      document.body.classList.add('cz-printing-active');
      window.print();
      setTimeout(() => {
        document.body.classList.remove('cz-printing-active');
      }, 500);
    }
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
          <div className="cz-gatepass-banner">
            <div className="cz-gatepass-banner-left">
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
            <span className="cz-gatepass-banner-badge">
              <CheckCircle2 size={13} /> GATE CLEARED
            </span>
          </div>

          {/* Consignment Selector if multiple available */}
          {availableConsignments.length > 1 && (
            <div className="cz-gatepass-selector-bar">
              <Truck size={14} style={{ color: 'var(--color-primary-dark)' }} />
              <strong>Select Vehicle / Consignment:</strong>
              <select
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
          <div id="printable-gate-pass" className="cz-gatepass-doc">
            {/* Background Security Watermark */}
            <div className="cz-gatepass-watermark">
              CHEMZORA GATE PASS CLEARED
            </div>

            {/* Document Header */}
            <div className="cz-gatepass-header">
              <div className="cz-gatepass-brand">
                <img
                  src="/logo.png"
                  alt="Chemzora Logo"
                  className="cz-gatepass-logo"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
                <div>
                  <h2 className="cz-gatepass-company-name">
                    CHEMZORA OILCHEM LIMITED
                  </h2>
                  <div className="cz-gatepass-company-address">
                    Plot No. 1201, GIDC Industrial Estate, Dahej, Bharuch, Gujarat 392130<br />
                    <strong>GSTIN:</strong> 24AAACS8912P1ZA • <strong>CIN:</strong> U24230GJ2005PLC046123<br />
                    <em>ISO 9001:2015, ISO 14001:2015 & GMP Certified Dahej Plant #1</em>
                  </div>
                </div>
              </div>

              <div className="cz-gatepass-meta-right">
                <div className="cz-gatepass-title-badge">
                  ROAD TANKER OUTWARD GATE PASS
                </div>
                <div className="cz-gatepass-id-num">
                  {active.id || 'GP-2026-OCT-8921'}
                </div>
                <div className="cz-gatepass-date-row">
                  Issue Date: <strong>{new Date().toLocaleDateString('en-GB')}</strong>
                </div>
                <div style={{ fontSize: '0.6875rem', color: '#059669', fontWeight: 600 }}>
                  Gate Out Time: <strong>{active.outTime || '10:30 AM'}</strong>
                </div>
              </div>
            </div>

            {/* Quick Barcode & Gate Pass Details Bar */}
            <div className="cz-gatepass-barcode-bar">
              <div>
                <strong>Terminal Gate:</strong> {active.gateNo || 'Security Gate #2 (Tanker Bay)'} • <strong>In-Time:</strong> {active.inTime || '07:15 AM'}
              </div>
              <div className="cz-gatepass-barcode-verify">
                <QrCode size={16} />
                <span>VERIFY: CHZ-GP-{active.vehicleNo?.replace(/-/g, '') || 'GJ16AX8921'}</span>
              </div>
            </div>

            {/* Grid 1: Transporter, Driver & Vehicle */}
            <div className="cz-gatepass-grid-2col">
              {/* Box 1: Tanker Details */}
              <div className="cz-gatepass-info-box">
                <div className="cz-gatepass-box-title">
                  <Truck size={13} style={{ color: '#0D9488' }} /> FLEET & VEHICLE PARTICULARS
                </div>
                <div className="cz-gatepass-subgrid">
                  <span className="cz-gatepass-subgrid-label">Tanker Reg. No:</span>
                  <strong style={{ fontFamily: 'monospace', color: '#0F172A' }}>{active.vehicleNo || 'GJ-16-AX-8921'}</strong>

                  <span className="cz-gatepass-subgrid-label">Carrier / Line:</span>
                  <span>{active.transporter || 'SafeChem Bulk Carriers Ltd'}</span>

                  <span className="cz-gatepass-subgrid-label">Driver Name:</span>
                  <strong>{active.driverName || 'Rameshwar B. Patel'}</strong>

                  <span className="cz-gatepass-subgrid-label">Driving License:</span>
                  <span style={{ fontFamily: 'monospace' }}>{active.driverLicense || 'GJ16-2018-009124'}</span>

                  <span className="cz-gatepass-subgrid-label">Driver Mobile:</span>
                  <span>{active.driverContact || '+91 98251 44921'}</span>
                </div>
              </div>

              {/* Box 2: Consignee & Order */}
              <div className="cz-gatepass-info-box">
                <div className="cz-gatepass-box-title">
                  <Building2 size={13} style={{ color: '#2563EB' }} /> CONSIGNMENT & DESTINATION
                </div>
                <div className="cz-gatepass-subgrid">
                  <span className="cz-gatepass-subgrid-label">Consignee Name:</span>
                  <strong>{active.client || active.consignee?.split(',')[0] || 'Pidilite Industries Ltd'}</strong>

                  <span className="cz-gatepass-subgrid-label">Destination Plant:</span>
                  <span>{active.consignee || 'Plant Unit #2, Vapi Industrial Zone, Gujarat'}</span>

                  <span className="cz-gatepass-subgrid-label">Sales Order Ref:</span>
                  <strong style={{ color: '#0D9488' }}>{active.soNumber || 'SO-2026-8939'} ({active.deliveryId || 'D1'})</strong>

                  <span className="cz-gatepass-subgrid-label">Tax Invoice No:</span>
                  <span>{active.invoiceNo || 'INV-2026-1082'}</span>

                  <span className="cz-gatepass-subgrid-label">E-Way Bill No:</span>
                  <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{active.ewayBill || '2410 8829 4410'}</span>
                </div>
              </div>
            </div>

            {/* Grid 2: Chemical Product & Weighbridge Bridge Slip */}
            <div className="cz-gatepass-grid-2col">
              {/* Product & QC Clearance */}
              <div className="cz-gatepass-info-box">
                <div className="cz-gatepass-box-title">
                  <FileCheck2 size={13} style={{ color: '#9333EA' }} /> CHEMICAL SPECIFICATION & QC
                </div>
                <div className="cz-gatepass-subgrid">
                  <span className="cz-gatepass-subgrid-label">Product Name:</span>
                  <strong>{active.product || 'Distilled Oleic Acid'}</strong>

                  <span className="cz-gatepass-subgrid-label">Grade & Spec:</span>
                  <span>{active.spec || 'Special Grade 90+ (Cosmetic / Pharma Spec)'}</span>

                  <span className="cz-gatepass-subgrid-label">HSN Code:</span>
                  <span>29054500</span>

                  <span className="cz-gatepass-subgrid-label">Lab QC Clearance:</span>
                  <strong style={{ color: '#059669' }}>✓ Released (Assay &gt; 99.7%)</strong>

                  <span className="cz-gatepass-subgrid-label">Tanker Condition:</span>
                  <span>Passivated & Nitrogen Blanketed</span>
                </div>
              </div>

              {/* Weighbridge Weights & Security Seals */}
              <div className="cz-gatepass-info-box weighbridge-box">
                <div className="cz-gatepass-box-title">
                  <Scale size={13} style={{ color: '#059669' }} /> WEIGHBRIDGE BRIDGE CERTIFICATION
                </div>
                <div className="cz-gatepass-subgrid">
                  <span className="cz-gatepass-subgrid-label">Gross Weight:</span>
                  <strong>{active.grossWeightKg ? `${active.grossWeightKg.toLocaleString()} kg` : '38,280 kg'}</strong>

                  <span className="cz-gatepass-subgrid-label">Tare Weight (Empty):</span>
                  <span>{active.tareWeightKg ? `${active.tareWeightKg.toLocaleString()} kg` : '14,280 kg'}</span>

                  <span className="cz-gatepass-subgrid-label">Net Payload:</span>
                  <strong style={{ color: '#047857', fontSize: '0.8rem' }}>
                    {active.netWeightKg ? `${active.netWeightKg.toLocaleString()} kg (${active.weightMT || 24} MT)` : `${active.volume || '24 MT'}`}
                  </strong>

                  <span className="cz-gatepass-subgrid-label" style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                    <Lock size={11} /> Top Dome Seal:
                  </span>
                  <strong style={{ fontFamily: 'monospace' }}>{active.sealTop || 'SC-9912A'}</strong>

                  <span className="cz-gatepass-subgrid-label" style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                    <Lock size={11} /> Valve Seal:
                  </span>
                  <strong style={{ fontFamily: 'monospace' }}>{active.sealBottom || 'SC-9912B'}</strong>
                </div>
              </div>
            </div>

            {/* Official Signatures & Digital Clearance Stamp */}
            <div className="cz-gatepass-signatures-grid">
              <div>
                <div className="cz-gatepass-sig-name" style={{ color: '#059669' }}>
                  D. M. Joshi
                </div>
                <div className="cz-gatepass-sig-meta">
                  <strong>Weighbridge Operator</strong><br />
                  <span style={{ color: '#64748B' }}>Weight Calibrated</span>
                </div>
              </div>

              <div>
                <div className="cz-gatepass-sig-name" style={{ color: '#2563EB' }}>
                  Dr. Neha Shah
                </div>
                <div className="cz-gatepass-sig-meta">
                  <strong>QA/QC Chemist</strong><br />
                  <span style={{ color: '#64748B' }}>Batch Spec Cleared</span>
                </div>
              </div>

              <div>
                <div className="cz-gatepass-sig-name" style={{ color: '#0D9488' }}>
                  Sunil Verma
                </div>
                <div className="cz-gatepass-sig-meta">
                  <strong>Logistics & Dispatch</strong><br />
                  <span style={{ color: '#64748B' }}>Fleet Inward Cleared</span>
                </div>
              </div>

              {/* Security Official Stamp Box */}
              <div className="cz-gatepass-security-stamp">
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
            <div className="cz-gatepass-disclaimer">
              This is a computer-verified Chemical Plant Outward Gate Pass authorized by Chemzora Oilchem Limited Dahej Security Control. Tampering with seals or documentation is strictly prohibited under Chemical Transport Safety Regulations.
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
}

export default GatePassModal;
