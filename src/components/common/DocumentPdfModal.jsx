import Modal from '../ui/Modal';
import Button from '../ui/Button';
import StatusBadge from './StatusBadge';
import {
  Printer,
  Building2,
  Landmark,
  CheckCircle2,
  FileText,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

export function DocumentPdfModal({
  isOpen,
  onClose,
  type = 'quote', // 'quote' | 'so'
  data,
  currentUser,
  onConvertToSo,
}) {
  if (!isOpen || !data) return null;

  const isQuote = type === 'quote';
  const isApproved = data.status === 'approved';

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${isQuote ? 'Chemical Sales Quotation' : 'Chemical Sales Order'}: ${data.id}`}
      description="Client-facing authorized document layout with digital stamp and terms."
      size="lg"
      footer={
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
          <div>
            {isQuote && isApproved && onConvertToSo && (
              <Button
                variant="primary"
                icon={<ArrowRight size={14} />}
                onClick={() => {
                  onConvertToSo(data.id);
                  onClose();
                }}
              >
                Convert to Sales Order
              </Button>
            )}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <Button variant="secondary" onClick={onClose}>
              Close
            </Button>
            <Button
              variant="primary"
              icon={<Printer size={15} />}
              onClick={handlePrint}
            >
              Print / Save PDF
            </Button>
          </div>
        </div>
      }
    >
      <div
        id="printable-quotation-doc"
        style={{
          padding: '24px 28px',
          border: '1px solid #CBD5E1',
          borderRadius: '8px',
          background: '#FFFFFF',
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
        }}
      >
        {/* Document Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            borderBottom: '2px solid #065F46',
            paddingBottom: 12,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <img
              src="/logo.png"
              alt="Chemzora Logo"
              style={{ width: 48, height: 48, objectFit: 'contain' }}
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
            <div>
              <h2 style={{ color: '#065F46', margin: 0, fontSize: '1.25rem', fontWeight: 800 }}>
                CHEMZORA OILCHEM LIMITED
              </h2>
              <div style={{ fontSize: '0.6875rem', color: '#475569', marginTop: 2, lineHeight: 1.35 }}>
                Plot No. 1201, GIDC Industrial Estate, Dahej, Bharuch, Gujarat 392130<br />
                GSTIN: 24AAACS8912P1ZA • CIN: U24230GJ2005PLC046123
              </div>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div
              style={{
                fontSize: '0.75rem',
                fontWeight: 800,
                color: '#065F46',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              {isQuote ? 'COMMERCIAL QUOTATION' : 'CHEMICAL SALES ORDER'}
            </div>
            <h3 style={{ margin: '2px 0', color: '#0F172A', fontFamily: 'monospace' }}>
              {data.id}
            </h3>
            <div style={{ fontSize: '0.6875rem', color: '#64748B' }}>Date: {data.date}</div>
            <div style={{ marginTop: 4 }}>
              <StatusBadge status={data.status} />
            </div>
          </div>
        </div>

        {/* Contracting Parties & Shipping Info */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: 16,
            fontSize: '0.71875rem',
            padding: '12px 14px',
            background: '#F8FAFC',
            borderRadius: '6px',
            border: '1px solid #E2E8F0',
          }}
        >
          <div>
            <div
              style={{
                fontWeight: 700,
                color: '#065F46',
                marginBottom: 4,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <Building2 size={13} /> CONSIGNOR / ORIGIN:
            </div>
            <div>{data.fromPlace || 'Chemzora Oilchem Limited, Dahej Plant #1, Gujarat'}</div>
            <div
              style={{
                marginTop: 8,
                fontWeight: 700,
                color: '#065F46',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <Building2 size={13} /> TO CLIENT / CONSIGNEE:
            </div>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0F172A' }}>
              {data.consignee || data.customerName || data.client}
            </div>
            {data.buyerOtherThanConsignee && (
              <div style={{ marginTop: 4, color: '#64748B' }}>
                <em>Buyer (other than Consignee):</em> {data.buyerOtherThanConsignee}
              </div>
            )}
          </div>

          <div>
            <div style={{ fontWeight: 700, color: '#065F46', marginBottom: 4 }}>
              COMMERCIAL & SHIPPING TERMS:
            </div>
            <div>
              <strong>Ref PO / Quotation No:</strong>{' '}
              {data.poRef || data.refPoNumber || data.quoteRef || 'DIRECT-OFFER-2026'}
            </div>
            <div>
              <strong>Incoterms:</strong>{' '}
              <span style={{ fontWeight: 700, color: '#065F46' }}>{data.orderTerms || 'Ex-Works Dahej'}</span>
            </div>
            <div><strong>Country of Origin:</strong> {data.countryOfOrigin || 'India'}</div>
            <div><strong>Port of Loading (POL):</strong> {data.portOfLoading || 'Dahej Port / JNPT'}</div>
            <div><strong>Port of Delivery (POD):</strong> {data.portOfDelivery || 'Customer Destination'}</div>
            <div><strong>Payment Terms:</strong> <strong style={{ color: '#065F46' }}>{data.paymentTerms || '30 Days Net'}</strong></div>
          </div>
        </div>

        {/* Technical Products Table */}
        <div style={{ overflowX: 'auto' }}>
          <table className="erp-table">
            <thead>
              <tr>
                <th style={{ width: 40 }}>Sr.</th>
                <th>Chemical Product & Grade</th>
                <th>HSN Code</th>
                <th>Specification Guarantee</th>
                <th>Packaging / Tanker</th>
                <th style={{ textAlign: 'right' }}>Quantity</th>
                <th style={{ textAlign: 'right' }}>Rate / MT (INR)</th>
                <th style={{ textAlign: 'right' }}>Total Amount (INR)</th>
              </tr>
            </thead>
            <tbody>
              {(data.items && data.items.length > 0
                ? data.items
                : [
                    {
                      srNo: 1,
                      productName: data.product || 'Refined Chemical Grade',
                      tradeName: data.tradeName,
                      hsn: data.hsn || '29054500',
                      spec: data.spec || 'Standard Monograph Guaranteed',
                      packaging: data.packaging || 'Bulk Road Tanker',
                      containerType: data.containerType || '20ft ISO Tank / FCL',
                      qty: data.qty || data.volumeMT || 20,
                      unitPrice: data.unitPrice || 96000,
                    },
                  ]
              ).map((it, i) => (
                <tr key={i}>
                  <td>{it.srNo || i + 1}</td>
                  <td>
                    <strong>{it.productName}</strong>
                    {it.tradeName && (
                      <div style={{ fontSize: '0.6875rem', color: '#64748B' }}>Trade: {it.tradeName}</div>
                    )}
                  </td>
                  <td><code>{it.hsn || '29054500'}</code></td>
                  <td style={{ fontSize: '0.6875rem', maxWidth: 180 }}>
                    {it.spec || 'USP / BP Chemical Standard Guaranteed'}
                  </td>
                  <td>
                    <div>{it.packaging || 'Bulk Road Tanker'}</div>
                    <div style={{ fontSize: '0.6875rem', color: '#64748B' }}>
                      {it.containerType || data.containerType || 'Insulated Tanker'}
                    </div>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <strong>{it.qty} {it.uom || 'MT'}</strong>
                  </td>
                  <td style={{ textAlign: 'right' }}>₹{Number(it.unitPrice).toLocaleString()}</td>
                  <td style={{ textAlign: 'right' }}>
                    <strong style={{ color: '#065F46' }}>
                      ₹{(Number(it.unitPrice) * Number(it.qty)).toLocaleString()}
                    </strong>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Banking Instructions */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: 12,
            fontSize: '0.71875rem',
            padding: '10px 14px',
            border: '1px solid #CBD5E1',
            borderRadius: '6px',
            background: '#F8FAFC',
          }}
        >
          <div>
            <div
              style={{
                fontWeight: 700,
                color: '#065F46',
                marginBottom: 4,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <Landmark size={13} /> OFFICIAL BANK REMITTANCE INSTRUCTIONS:
            </div>
            <div><strong>Account Name:</strong> Chemzora Oilchem Limited</div>
            <div><strong>Account Number:</strong> 002105001892</div>
            <div><strong>IFSC Code:</strong> HDFC0000021</div>
            <div><strong>Bank & Branch:</strong> HDFC Bank, Dahej SEZ Branch, Gujarat</div>
          </div>
          <div>
            <div style={{ fontWeight: 700, color: '#065F46', marginBottom: 4 }}>
              INTERNATIONAL & LC ROUTING:
            </div>
            <div><strong>Intermediary Bank:</strong> Standard Chartered Bank, Mumbai (SCBLINBB)</div>
            <div><strong>Offer Validity:</strong> {data.offerValidity || '15 Days from Date of Quotation'}</div>
            <div><strong>Delivery Schedule:</strong> {data.deliverySchedule || 'Immediate / Within 7 Days'}</div>
          </div>
        </div>

        {/* Footer with HOD Digital Stamp */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: 8,
            paddingTop: 12,
            borderTop: '2px solid #E2E8F0',
            fontSize: '0.71875rem',
          }}
        >
          <div>
            <div><strong>Prepared By:</strong> {data.preparedBy || currentUser?.name || 'Sales Commercial Desk'}</div>
            <div style={{ color: '#64748B', fontSize: '0.6875rem' }}>
              System Document Ref: CHZ-QUOT-REV-4
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            {data.status === 'awaiting approval' || data.status === 'draft' ? (
              <div
                style={{
                  color: '#92400E',
                  fontWeight: 700,
                  border: '1px dashed #F59E0B',
                  padding: '6px 14px',
                  borderRadius: 4,
                  background: '#FEF3C7',
                }}
              >
                Awaiting HOD Digital Approval
              </div>
            ) : (
              <div
                style={{
                  color: '#065F46',
                  fontWeight: 700,
                  border: '1px solid #10B981',
                  padding: '6px 14px',
                  borderRadius: 4,
                  background: '#ECFDF5',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <CheckCircle2 size={16} color="#059669" />
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: '0.6875rem', letterSpacing: '0.04em' }}>DIGITALLY AUTHORIZED BY HOD</div>
                  <div style={{ fontSize: '0.65625rem', fontWeight: 500, color: '#047857' }}>
                    {data.authorizedSign || 'Rajesh Sharma (Commercial Head / Dahej Plant)'}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}

export default DocumentPdfModal;
