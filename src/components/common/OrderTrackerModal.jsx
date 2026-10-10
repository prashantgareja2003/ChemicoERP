import { useState } from 'react';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Button from '../ui/Button';
import StatusBadge from './StatusBadge';
import { Search, CheckCircle, Clock, Truck, ShieldCheck, FileText } from 'lucide-react';
import { useErp } from '../../hooks/useErp';

/**
 * Global Order Tracker Modal
 * Searches across PO, SO, Invoice, or Quotation numbers and renders complete lifecycle timeline.
 * Detail visibility dynamically adapts to user role.
 */
export function OrderTrackerModal({ isOpen, onClose, initialQuery = '' }) {
  const { salesOrders, purchaseOrders, invoices, quotations, currentUser } = useErp();
  const [query, setQuery] = useState(initialQuery);
  const [activeResult, setActiveResult] = useState(null);

  const handleSearch = (searchVal = query) => {
    const q = (searchVal || '').trim().toUpperCase();
    if (!q) return;

    // Check SO
    const soMatch = salesOrders.find((s) => s.id.toUpperCase().includes(q) || s.quoteRef?.toUpperCase().includes(q));
    if (soMatch) {
      setActiveResult({ type: 'sales_order', data: soMatch });
      return;
    }

    // Check PO
    const poMatch = purchaseOrders.find((p) => p.id.toUpperCase().includes(q) || p.refSoNumber?.toUpperCase().includes(q));
    if (poMatch) {
      setActiveResult({ type: 'purchase_order', data: poMatch });
      return;
    }

    // Check Invoice
    const invMatch = invoices.find((i) => i.id.toUpperCase().includes(q) || i.soNumber.toUpperCase().includes(q));
    if (invMatch) {
      setActiveResult({ type: 'invoice', data: invMatch });
      return;
    }

    // Check Quotation
    const quoteMatch = quotations.find((qt) => qt.id.toUpperCase().includes(q));
    if (quoteMatch) {
      setActiveResult({ type: 'quotation', data: quoteMatch });
      return;
    }

    setActiveResult({ type: 'not_found', query: q });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Universal Order & Consignment Tracker"
      description="Trace end-to-end lifecycle across Quotation → Sales Order → Production → Logistics → Invoicing"
      size="lg"
      footer={
        <Button variant="secondary" onClick={onClose}>
          Close Tracker
        </Button>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        {/* Search input with Quick Shortcuts */}
        <div style={{ display: 'flex', gap: 8 }}>
          <div style={{ flex: 1 }}>
            <Input
              placeholder="Enter SO (e.g. SOL/SO/2891), PO (SOL/PO/4412), or Invoice (SOL/EXP/0911)..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSearch();
              }}
            />
          </div>
          <Button variant="primary" icon={<Search size={16} />} onClick={() => handleSearch()}>
            Track
          </Button>
        </div>

        {/* Quick sample chips */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>Quick Try:</span>
          {['SOL/SO/2891', 'SOL/PO/4412', 'SOL/EXP/0911', 'SOL/SO/2890'].map((sample) => (
            <button
              key={sample}
              type="button"
              onClick={() => {
                setQuery(sample);
                handleSearch(sample);
              }}
              style={{
                fontSize: '0.6875rem',
                padding: '2px 8px',
                borderRadius: 'var(--radius-pill)',
                border: '1px solid var(--color-border)',
                background: '#FFFFFF',
                cursor: 'pointer',
                color: 'var(--color-primary)',
                fontWeight: 600,
              }}
            >
              {sample}
            </button>
          ))}
        </div>

        {/* Search Results Display */}
        {activeResult?.type === 'not_found' && (
          <div style={{ padding: 'var(--space-6)', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
            <p>No matching record found for "{activeResult.query}".</p>
            <p style={{ fontSize: 'var(--font-size-xs)' }}>Please verify the numbering format (SOL/SO/XXXX, SOL/PO/XXXX, SOL/EXP/XXXX).</p>
          </div>
        )}

        {activeResult?.type === 'sales_order' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <div
              style={{
                padding: 'var(--space-4)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--color-primary-soft-border)',
                background: 'var(--color-primary-light)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 8,
              }}
            >
              <div>
                <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-primary-dark)', fontWeight: 600 }}>
                  SALES ORDER TRACKING
                </span>
                <h3 style={{ margin: 0, color: 'var(--color-primary-dark)' }}>{activeResult.data.id}</h3>
                <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-primary)' }}>
                  {activeResult.data.customerName} • {activeResult.data.items[0]?.productName} ({activeResult.data.items[0]?.qty} MT)
                </span>
              </div>
              <StatusBadge status={activeResult.data.status} />
            </div>

            {/* Lifecycle Stages Steps */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(5, 1fr)',
                gap: 8,
                padding: 'var(--space-3) 0',
                borderBottom: '1px solid var(--color-border)',
              }}
            >
              {[
                { title: 'Quotation', icon: FileText, done: true, sub: activeResult.data.quoteRef || 'Direct' },
                { title: 'HOD Approval', icon: ShieldCheck, done: true, sub: 'Authorized' },
                { title: 'Production', icon: Clock, done: activeResult.data.status !== 'open', sub: 'Plant Unit #1' },
                { title: 'Logistics', icon: Truck, done: activeResult.data.deliveries[0]?.status === 'dispatched' || activeResult.data.status === 'delivered', sub: activeResult.data.deliveries[0]?.vehicleNo || 'Pending' },
                { title: 'Payment', icon: CheckCircle, done: (activeResult.data.receivedPayment / activeResult.data.totalValue) >= 0.95, sub: `${Math.round(((activeResult.data.receivedPayment || 0) / activeResult.data.totalValue) * 100)}% Recv` },
              ].map((step, idx) => {
                const Icon = step.icon;
                return (
                  <div key={idx} style={{ textAlign: 'center' }}>
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: '50%',
                        margin: '0 auto 6px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: step.done ? 'var(--color-primary)' : 'var(--color-bg-subtle)',
                        color: step.done ? '#FFFFFF' : 'var(--color-text-muted)',
                      }}
                    >
                      <Icon size={18} />
                    </div>
                    <div style={{ fontSize: 'var(--font-size-xs)', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                      {step.title}
                    </div>
                    <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-secondary)' }}>
                      {step.sub}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Role-Specific Detail View */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, fontSize: 'var(--font-size-xs)' }}>
              <div>
                <strong>Terms & IncoTerms:</strong> {activeResult.data.orderTerms} • Origin: {activeResult.data.countryOfOrigin}
              </div>
              <div>
                <strong>Port of Loading:</strong> {activeResult.data.portOfLoading} → {activeResult.data.portOfDelivery}
              </div>
              {(currentUser.role === 'Admin' || currentUser.role === 'Finance' || currentUser.role === 'Management' || currentUser.role === 'Sales') && (
                <>
                  <div>
                    <strong>Total Order Value:</strong> ₹{activeResult.data.totalValue.toLocaleString()}
                  </div>
                  <div>
                    <strong>Payment Received:</strong> ₹{(activeResult.data.receivedPayment || 0).toLocaleString()} (
                    {(((activeResult.data.receivedPayment || 0) / activeResult.data.totalValue) * 100).toFixed(1)}%)
                  </div>
                </>
              )}
            </div>

            {/* Audit History */}
            <div>
              <h4 style={{ fontSize: 'var(--font-size-xs)', textTransform: 'uppercase', color: 'var(--color-text-secondary)', marginBottom: 6 }}>
                Activity Audit Trail
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {activeResult.data.history.map((h, i) => (
                  <div key={i} style={{ fontSize: 'var(--font-size-xs)', display: 'flex', gap: 8, color: 'var(--color-text-secondary)' }}>
                    <span style={{ minWidth: 140, fontWeight: 500 }}>{h.date}:</span>
                    <span>
                      <strong style={{ color: 'var(--color-text-primary)' }}>{h.user}</strong> — {h.action}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeResult?.type === 'purchase_order' && (() => {
          const po = activeResult.data;
          const val = po.totalWithTax || po.totalValue || 1;
          const paidPct = Math.round(((po.paidAmount || 0) / val) * 100);

          let currentStepIdx = 0;
          if (po.status === 'completed' || po.stage === 'completed') {
            currentStepIdx = 4;
          } else if (po.stage === 'bill_receipt' || po.billReceipt) {
            currentStepIdx = 3;
          } else if (po.stage === 'payment_terms' || (po.receivedQty || 0) > 0 || paidPct > 0) {
            currentStepIdx = 2;
          } else if (po.stage === 'procurement_trade' || po.hodApproved || po.status === 'approved') {
            currentStepIdx = 1;
          } else {
            currentStepIdx = 0;
          }

          const poStages = [
            {
              id: 'purchase_order',
              label: '1. Purchase Order',
              sub: po.hodApproved ? 'HOD Approved' : 'Awaiting HOD',
            },
            {
              id: 'procurement_trade',
              label: '2. Procurement Trade',
              sub: (po.receivedQty || 0) > 0 ? `${po.receivedQty} MT Received` : 'Contract Active',
            },
            {
              id: 'payment_terms',
              label: '3. Payment Terms',
              sub: `${paidPct}% Paid (${po.creditPeriod || 'Credit Term'})`,
            },
            {
              id: 'bill_receipt',
              label: '4. Bill Receipt',
              sub: po.billReceipt ? `Matched: ${po.billReceipt.invoiceNo}` : 'Awaiting Tax Invoice',
            },
            {
              id: 'completed',
              label: '5. PO Completed',
              sub: po.status === 'completed' ? 'Closed (≥95%)' : `${paidPct}% / 95% threshold`,
            },
          ];

          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              <div
                style={{
                  padding: 'var(--space-4)',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--color-border)',
                  background: '#FAFCFB',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-primary-dark)', fontWeight: 600 }}>
                    5-STAGE PROCUREMENT LIFECYCLE
                  </span>
                  <h3 style={{ margin: 0 }}>{po.id}</h3>
                  <span style={{ fontSize: 'var(--font-size-sm)' }}>
                    Supplier: {po.supplierName} • {po.material} ({po.qty} {po.uom || 'MT'})
                  </span>
                </div>
                <StatusBadge status={po.status} />
              </div>

              {/* 5 Stage Stepper */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(5, 1fr)',
                  gap: 8,
                  padding: 'var(--space-3)',
                  background: '#F8FAFC',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border)',
                }}
              >
                {poStages.map((st, idx) => {
                  const isDone = idx < currentStepIdx || po.status === 'completed';
                  const isCurrent = idx === currentStepIdx && po.status !== 'completed';

                  return (
                    <div
                      key={st.id}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        textAlign: 'center',
                        gap: 4,
                      }}
                    >
                      <div
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: '50%',
                          background: isDone
                            ? 'var(--color-success)'
                            : isCurrent
                            ? 'var(--color-primary)'
                            : '#E2E8F0',
                          color: isDone || isCurrent ? '#FFFFFF' : '#64748B',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                        }}
                      >
                        {isDone ? <CheckCircle size={14} /> : idx + 1}
                      </div>
                      <span
                        style={{
                          fontSize: '0.6875rem',
                          fontWeight: isCurrent ? 700 : 500,
                          color: isCurrent ? 'var(--color-primary-dark)' : 'var(--color-text-primary)',
                          lineHeight: 1.2,
                        }}
                      >
                        {st.label}
                      </span>
                      <span
                        style={{
                          fontSize: '0.5625rem',
                          color: 'var(--color-text-secondary)',
                          lineHeight: 1.1,
                        }}
                      >
                        {st.sub}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div style={{ fontSize: 'var(--font-size-xs)', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
                <div><strong>Delivery Point:</strong> {po.deliveryPoint}</div>
                <div><strong>Schedule:</strong> {po.deliverySchedule}</div>
                <div><strong>Value with Tax:</strong> ₹{(po.totalWithTax || 0).toLocaleString()}</div>
                <div><strong>Paid to Supplier:</strong> ₹{(po.paidAmount || 0).toLocaleString()} ({paidPct}%)</div>
                {po.billReceipt && (
                  <div style={{ gridColumn: 'span 2', padding: 6, background: '#EFF6FF', borderRadius: 4 }}>
                    <strong>Bill Receipt:</strong> {po.billReceipt.invoiceNo} (Verified against {po.billReceipt.grnRef})
                  </div>
                )}
              </div>

              {/* History trail */}
              {po.history && po.history.length > 0 && (
                <div>
                  <h4 style={{ fontSize: 'var(--font-size-xs)', textTransform: 'uppercase', color: 'var(--color-text-secondary)', marginBottom: 6 }}>
                    Procurement Audit Trail
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {po.history.map((h, i) => (
                      <div key={i} style={{ fontSize: 'var(--font-size-xs)', display: 'flex', gap: 8, color: 'var(--color-text-secondary)' }}>
                        <span style={{ minWidth: 140, fontWeight: 500 }}>{h.date}:</span>
                        <span>
                          <strong style={{ color: 'var(--color-text-primary)' }}>{h.user}</strong> — {h.action}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })()}
      </div>
    </Modal>
  );
}

export default OrderTrackerModal;
