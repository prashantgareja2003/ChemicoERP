import { useState } from 'react';
import PageHeader from '../../components/layout/PageHeader';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import DataTable from '../../components/ui/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import { useErp } from '../../hooks/useErp';
import { Download, CreditCard, Lock, CheckCircle2, FileText, AlertCircle, Printer, Receipt, ShieldCheck, BarChart3 } from 'lucide-react';

export function FinancePage() {
  const {
    invoices,
    salesOrders,
    purchaseOrders,
    generateInvoice,
    recordPayment,
    closeOrder,
    notify,
  } = useErp();

  const [activeTab, setActiveTab] = useState('invoices'); // 'invoices' | 'payments' | 'aging'

  // Modals
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedInvoiceForView, setSelectedInvoiceForView] = useState(null);

  // Forms
  const [invoiceForm, setInvoiceForm] = useState({
    soId: 'SOL/SO/2891',
    deliveryId: 'D1',
    bol: 'BOL-SC-2026-9912.pdf',
    ci: 'COMM_INV_0911.pdf',
    pl: 'PACKING_LIST_0911.pdf',
    coo: 'CERT_ORIGIN_IN_881.pdf',
    coa: 'COA_GLY_B884.pdf',
    insurance: 'NEW_INDIA_ASSUR_9921.pdf',
  });

  const [paymentForm, setPaymentForm] = useState({
    type: 'sales_order', // 'sales_order' | 'purchase_order'
    orderId: 'SOL/SO/2891',
    amount: 1920000,
    receiptRef: 'HDFC-NEFT-99182',
  });

  // Calculate Aging (0-30, 31-60, 61-90, 90+ days)
  const agingReport = [
    {
      customer: 'Godrej Consumer Products Ltd',
      current: 1920000,
      days30: 0,
      days60: 0,
      days90: 0,
      total: 1920000,
    },
    {
      customer: 'Asian Paints Chemical Div',
      current: 250000,
      days30: 0,
      days60: 0,
      days90: 0,
      total: 250000,
    },
    {
      customer: 'Pidilite Industries Ltd',
      current: 0,
      days30: 0,
      days60: 0,
      days90: 0,
      total: 0,
    },
  ];

  const invoiceColumns = [
    {
      key: 'id',
      title: 'Tax Invoice #',
      render: (val) => <strong style={{ color: 'var(--color-primary-dark)' }}>{val}</strong>,
    },
    { key: 'customerName', title: 'Customer Legal Name' },
    { key: 'soNumber', title: 'Sales Order Ref' },
    { key: 'deliveryId', title: 'Part Delivery' },
    {
      key: 'subTotal',
      title: 'Taxable Amount',
      align: 'right',
      render: (val) => `₹${Number(val).toLocaleString()}`,
    },
    {
      key: 'totalWithTax',
      title: 'Gross Total (with GST)',
      align: 'right',
      render: (val) => <strong style={{ color: 'var(--color-primary-dark)' }}>₹{Number(val).toLocaleString()}</strong>,
    },
    {
      key: 'status',
      title: 'Payment Status',
      render: (val, row) => {
        const linkedSo = salesOrders.find((s) => s.id === row.soNumber);
        const soPaidPct = linkedSo ? Math.round(((linkedSo.receivedPayment || 0) / (linkedSo.totalValue || 1)) * 100) : 0;
        const isPaid = val === 'paid' || row.status === 'paid' || soPaidPct >= 95;
        const isPartial = val === 'partially paid' || row.status === 'partially paid' || soPaidPct > 0 || (row.paymentReceived || 0) > 0;
        const effectiveStatus = isPaid ? 'paid' : isPartial ? 'partially paid' : 'pending';

        return <StatusBadge status={effectiveStatus} />;
      },
    },
    {
      key: 'actions',
      title: 'Actions',
      align: 'right',
      render: (_, row) => (
        <Button
          size="sm"
          variant="secondary"
          icon={<Printer size={13} />}
          onClick={() => setSelectedInvoiceForView(row)}
        >
          GST Invoice PDF
        </Button>
      ),
    },
  ];

  const handleExportCSV = (filename, dataRows) => {
    const headers = Object.keys(dataRows[0]).join(',');
    const rows = dataRows.map((r) => Object.values(r).join(',')).join('\n');
    const blob = new Blob([`${headers}\n${rows}`], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.csv`;
    a.click();
    notify(`Exported ${filename} successfully.`);
  };

  return (
    <div>
      <PageHeader
        title="Commercial Invoicing & Accounts Settlement"
        description="GST Invoices (SOL/EXP/XXXX), 6-document customs dossier upload, and strict 95% threshold completion rule."
        actions={
          <>
            <Button variant="secondary" onClick={() => setIsInvoiceModalOpen(true)}>
              + Generate GST Invoice (SOL/EXP)
            </Button>
            <Button
              variant="primary"
              icon={<CreditCard size={15} />}
              onClick={() => setIsPaymentModalOpen(true)}
            >
              Record Payment Receipt
            </Button>
          </>
        }
      />

      {/* Tabs */}
      <div className="erp-tabs-row">
        <Button
          size="sm"
          variant={activeTab === 'invoices' ? 'primary' : 'secondary'}
          icon={<Receipt size={13} />}
          onClick={() => setActiveTab('invoices')}
        >
          GST Invoices (SOL/EXP) [{invoices.length}]
        </Button>
        <Button
          size="sm"
          variant={activeTab === 'payments' ? 'primary' : 'secondary'}
          icon={<ShieldCheck size={13} />}
          onClick={() => setActiveTab('payments')}
        >
          Orders Settlement & 95% Completion Rule
        </Button>
        <Button
          size="sm"
          variant={activeTab === 'aging' ? 'primary' : 'secondary'}
          icon={<BarChart3 size={13} />}
          onClick={() => setActiveTab('aging')}
        >
          Receivables Aging Analysis
        </Button>
      </div>

      {/* Tab 1: Invoices */}
      {activeTab === 'invoices' && (
        <Card title="GST Tax Invoices & Shipping Dossiers" noPadding>
          <DataTable columns={invoiceColumns} data={invoices} keyField="id" />
        </Card>
      )}

      {/* Tab 2: Orders Settlement with 95% Rule */}
      {activeTab === 'payments' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <Card
            title="Sales Orders — Received Payment & Close Order Status"
            subtitle="Orders can only be officially closed when payments reach 95% or more."
            noPadding
          >
            <table className="erp-table">
              <thead>
                <tr>
                  <th>Order Ref</th>
                  <th>Customer</th>
                  <th style={{ textAlign: 'right' }}>Total Order Value</th>
                  <th style={{ textAlign: 'right' }}>Received Payment</th>
                  <th style={{ textAlign: 'center' }}>Payment %</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Close Action (95% Rule)</th>
                </tr>
              </thead>
              <tbody>
                {salesOrders.map((so) => {
                  const pct = Math.round(((so.receivedPayment || 0) / so.totalValue) * 100);
                  const isEligible = pct >= 95;
                  const isClosed = so.status === 'completed';

                  return (
                    <tr key={so.id}>
                      <td><strong>{so.id}</strong></td>
                      <td>{so.customerName}</td>
                      <td style={{ textAlign: 'right' }}>₹{so.totalValue.toLocaleString()}</td>
                      <td style={{ textAlign: 'right' }}>₹{(so.receivedPayment || 0).toLocaleString()}</td>
                      <td style={{ textAlign: 'center' }}>
                        <span
                          style={{
                            fontWeight: 700,
                            padding: '2px 8px',
                            borderRadius: 'var(--radius-pill)',
                            background: isEligible ? 'var(--color-primary-light)' : 'var(--color-warning-bg)',
                            color: isEligible ? 'var(--color-primary-dark)' : 'var(--color-warning)',
                          }}
                        >
                          {pct}%
                        </span>
                      </td>
                      <td><StatusBadge status={so.status} /></td>
                      <td style={{ textAlign: 'right' }}>
                        {isClosed ? (
                          <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-success)', fontWeight: 600 }}>
                            ✓ Closed
                          </span>
                        ) : (
                          <Button
                            size="sm"
                            variant={isEligible ? 'primary' : 'secondary'}
                            disabled={!isEligible}
                            title={isEligible ? 'Close and archive completed order' : 'Disabled: Requires at least 95% payment'}
                            onClick={() => closeOrder('sales_order', so.id)}
                            icon={isEligible ? <CheckCircle2 size={13} /> : <Lock size={13} />}
                          >
                            Close SO ({pct}%)
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Card>

          <Card
            title="Purchase Orders — Supplier Bills & Close PO Status"
            subtitle="Supplier PO can be closed once bills & payments reach 95% of PO amount."
            noPadding
          >
            <table className="erp-table">
              <thead>
                <tr>
                  <th>PO Ref</th>
                  <th>Supplier</th>
                  <th>Material</th>
                  <th style={{ textAlign: 'right' }}>PO Value with Tax</th>
                  <th style={{ textAlign: 'right' }}>Settled Payment</th>
                  <th style={{ textAlign: 'center' }}>Paid %</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Close Action (95% Rule)</th>
                </tr>
              </thead>
              <tbody>
                {purchaseOrders.map((po) => {
                  const val = po.totalWithTax || po.totalValue;
                  const pct = Math.round(((po.paidAmount || 0) / val) * 100);
                  const isEligible = pct >= 95;
                  const isClosed = po.status === 'completed';

                  return (
                    <tr key={po.id}>
                      <td><strong>{po.id}</strong></td>
                      <td>{po.supplierName}</td>
                      <td>{po.material}</td>
                      <td style={{ textAlign: 'right' }}>₹{val.toLocaleString()}</td>
                      <td style={{ textAlign: 'right' }}>₹{(po.paidAmount || 0).toLocaleString()}</td>
                      <td style={{ textAlign: 'center' }}>
                        <span
                          style={{
                            fontWeight: 700,
                            padding: '2px 8px',
                            borderRadius: 'var(--radius-pill)',
                            background: isEligible ? 'var(--color-primary-light)' : 'var(--color-warning-bg)',
                            color: isEligible ? 'var(--color-primary-dark)' : 'var(--color-warning)',
                          }}
                        >
                          {pct}%
                        </span>
                      </td>
                      <td><StatusBadge status={po.status} /></td>
                      <td style={{ textAlign: 'right' }}>
                        {isClosed ? (
                          <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-success)', fontWeight: 600 }}>
                            ✓ Closed
                          </span>
                        ) : (
                          <Button
                            size="sm"
                            variant={isEligible ? 'primary' : 'secondary'}
                            disabled={!isEligible}
                            title={isEligible ? 'Close and archive settled PO' : 'Disabled: Requires at least 95% payment'}
                            onClick={() => closeOrder('purchase_order', po.id)}
                            icon={isEligible ? <CheckCircle2 size={13} /> : <Lock size={13} />}
                          >
                            Close PO ({pct}%)
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Card>
        </div>
      )}

      {/* Tab 3: Aging Analysis */}
      {activeTab === 'aging' && (
        <Card
          title="Accounts Receivable Aging Breakdown"
          subtitle="Customer balance breakdown across 0-30, 31-60, 61-90, and >90 days"
          actions={
            <Button
              size="sm"
              variant="secondary"
              icon={<Download size={13} />}
              onClick={() => handleExportCSV('AR_Aging_Report', agingReport)}
            >
              Export Excel
            </Button>
          }
          noPadding
        >
          <table className="erp-table">
            <thead>
              <tr>
                <th>Customer Legal Name</th>
                <th style={{ textAlign: 'right' }}>0 - 30 Days</th>
                <th style={{ textAlign: 'right' }}>31 - 60 Days</th>
                <th style={{ textAlign: 'right' }}>61 - 90 Days</th>
                <th style={{ textAlign: 'right' }}>&gt; 90 Days</th>
                <th style={{ textAlign: 'right' }}>Total Outstanding</th>
              </tr>
            </thead>
            <tbody>
              {agingReport.map((row, i) => (
                <tr key={i}>
                  <td><strong>{row.customer}</strong></td>
                  <td style={{ textAlign: 'right' }}>₹{row.current.toLocaleString()}</td>
                  <td style={{ textAlign: 'right' }}>₹{row.days30.toLocaleString()}</td>
                  <td style={{ textAlign: 'right' }}>₹{row.days60.toLocaleString()}</td>
                  <td style={{ textAlign: 'right' }}>₹{row.days90.toLocaleString()}</td>
                  <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--color-primary-dark)' }}>
                    ₹{row.total.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {/* Modal: Generate GST Invoice with 6 Documents Upload */}
      <Modal
        isOpen={isInvoiceModalOpen}
        onClose={() => setIsInvoiceModalOpen(false)}
        title="Generate Tax Invoice (SOL/EXP Series)"
        description="Attach regulatory export/domestic documents: BOL, CI, PL, COO, COA, and Insurance."
        size="md"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsInvoiceModalOpen(false)}>Cancel</Button>
            <Button
              variant="primary"
              onClick={() => {
                generateInvoice(invoiceForm.soId, invoiceForm.deliveryId, invoiceForm);
                setIsInvoiceModalOpen(false);
              }}
            >
              Generate Invoice & Stamp
            </Button>
          </>
        }
      >
        <div className="erp-form-grid">
          <Select
            label="Target Sales Order"
            value={invoiceForm.soId}
            onChange={(e) => setInvoiceForm({ ...invoiceForm, soId: e.target.value })}
            options={salesOrders.map((s) => ({ value: s.id, label: `${s.id} — ${s.customerName}` }))}
          />
          <Select
            label="Delivery Shipment"
            value={invoiceForm.deliveryId}
            onChange={(e) => setInvoiceForm({ ...invoiceForm, deliveryId: e.target.value })}
            options={[
              { value: 'D1', label: 'Delivery D1' },
              { value: 'D2', label: 'Delivery D2' },
            ]}
          />

          <div className="erp-col-span-2">
            <h4 style={{ fontSize: 'var(--font-size-xs)', textTransform: 'uppercase', color: 'var(--color-text-secondary)', margin: '8px 0 4px' }}>
              Required Shipping Dossier (PDF Attachments)
            </h4>
          </div>

          <Input
            label="Bill of Lading / Lorry Receipt (BOL)"
            value={invoiceForm.bol}
            onChange={(e) => setInvoiceForm({ ...invoiceForm, bol: e.target.value })}
          />
          <Input
            label="Commercial Invoice (CI)"
            value={invoiceForm.ci}
            onChange={(e) => setInvoiceForm({ ...invoiceForm, ci: e.target.value })}
          />
          <Input
            label="Packing List (PL)"
            value={invoiceForm.pl}
            onChange={(e) => setInvoiceForm({ ...invoiceForm, pl: e.target.value })}
          />
          <Input
            label="Certificate of Origin (COO)"
            value={invoiceForm.coo}
            onChange={(e) => setInvoiceForm({ ...invoiceForm, coo: e.target.value })}
          />
          <Input
            label="Certificate of Analysis (COA)"
            value={invoiceForm.coa}
            onChange={(e) => setInvoiceForm({ ...invoiceForm, coa: e.target.value })}
          />
          <Input
            label="Marine / Transit Insurance"
            value={invoiceForm.insurance}
            onChange={(e) => setInvoiceForm({ ...invoiceForm, insurance: e.target.value })}
          />
        </div>
      </Modal>

      {/* Modal: Record Bank Receipt */}
      <Modal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        title="Record Payment Receipt & Settlement"
        description="Book customer collection or supplier bill payout."
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsPaymentModalOpen(false)}>Cancel</Button>
            <Button
              variant="primary"
              onClick={() => {
                recordPayment(paymentForm.type, paymentForm.orderId, paymentForm.amount, paymentForm.receiptRef);
                setIsPaymentModalOpen(false);
              }}
            >
              Post Payment Entry
            </Button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <Select
            label="Transaction Type"
            value={paymentForm.type}
            onChange={(e) => {
              const newType = e.target.value;
              const defaultId = newType === 'sales_order' ? (salesOrders[0]?.id || '') : newType === 'invoice' ? (invoices[0]?.id || '') : (purchaseOrders[0]?.id || '');
              const defAmt = newType === 'sales_order' ? (salesOrders[0]?.totalValue || '') : newType === 'invoice' ? (invoices[0]?.totalWithTax || '') : (purchaseOrders[0]?.totalValue || '');
              setPaymentForm({ ...paymentForm, type: newType, orderId: defaultId, amount: defAmt });
            }}
            options={[
              { value: 'sales_order', label: 'Customer Payment (against Sales Order)' },
              { value: 'invoice', label: 'Customer Payment (against Specific Tax Invoice)' },
              { value: 'purchase_order', label: 'Supplier Payout (against Purchase Order)' },
            ]}
          />
          <Select
            label={paymentForm.type === 'invoice' ? 'Select GST Tax Invoice #' : 'Order Reference #'}
            value={paymentForm.orderId}
            onChange={(e) => {
              const selId = e.target.value;
              let newAmt = paymentForm.amount;
              if (paymentForm.type === 'sales_order') {
                const matched = salesOrders.find(s => s.id === selId);
                if (matched) newAmt = matched.totalValue;
              } else if (paymentForm.type === 'invoice') {
                const matched = invoices.find(i => i.id === selId);
                if (matched) newAmt = matched.totalWithTax;
              } else {
                const matched = purchaseOrders.find(p => p.id === selId);
                if (matched) newAmt = matched.totalWithTax || matched.totalValue;
              }
              setPaymentForm({ ...paymentForm, orderId: selId, amount: newAmt });
            }}
            options={
              paymentForm.type === 'sales_order'
                ? salesOrders.map((s) => ({ value: s.id, label: `${s.id} — ${s.customerName} [₹${Number(s.totalValue || 0).toLocaleString()}]` }))
                : paymentForm.type === 'invoice'
                ? invoices.map((inv) => ({ value: inv.id, label: `${inv.id} — ${inv.customerName} (${inv.soNumber} ${inv.deliveryId}) [₹${Number(inv.totalWithTax || 0).toLocaleString()}]` }))
                : purchaseOrders.map((p) => ({ value: p.id, label: `${p.id} — ${p.supplierName}` }))
            }
          />
          <Input
            label="Amount Paid / Received (INR)"
            type="number"
            value={paymentForm.amount}
            onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
          />
          <Input
            label="Bank UTR / Cheque / Receipt #"
            value={paymentForm.receiptRef}
            onChange={(e) => setPaymentForm({ ...paymentForm, receiptRef: e.target.value })}
          />
        </div>
      </Modal>

      {/* GST Invoice Formal PDF View Modal */}
      {selectedInvoiceForView && (
        <Modal
          isOpen={Boolean(selectedInvoiceForView)}
          onClose={() => setSelectedInvoiceForView(null)}
          title={`GST Tax Invoice: ${selectedInvoiceForView.id}`}
          description="Statutory Tax Invoice formatted for GST & Export clearance."
          size="lg"
          footer={
            <>
              <Button variant="secondary" onClick={() => setSelectedInvoiceForView(null)}>Close</Button>
              <Button variant="primary" icon={<Printer size={15} />} onClick={() => window.print()}>
                Print Invoice
              </Button>
            </>
          }
        >
          <div style={{ padding: 'var(--space-4)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', background: '#FFFFFF' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid var(--color-primary-dark)', paddingBottom: 8, marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <img src="/logo.png" alt="Chemzora Logo" style={{ width: 44, height: 44, objectFit: 'contain' }} />
                <div>
                  <h3 style={{ margin: 0, color: 'var(--color-primary-dark)' }}>CHEMZORA OILCHEM LIMITED</h3>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-secondary)' }}>
                    Dahej Complex, Gujarat • GSTIN: 24AAACS8912P1ZA
                  </div>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <h3 style={{ margin: 0 }}>{selectedInvoiceForView.id}</h3>
                <div style={{ fontSize: '0.6875rem' }}>Dated: {selectedInvoiceForView.date}</div>
              </div>
            </div>

            <div style={{ fontSize: 'var(--font-size-xs)', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8, marginBottom: 12 }}>
              <div><strong>Billed To:</strong> {selectedInvoiceForView.customerName}</div>
              <div><strong>Sales Order Ref:</strong> {selectedInvoiceForView.soNumber} ({selectedInvoiceForView.deliveryId})</div>
              <div><strong>Payment Due Date:</strong> {selectedInvoiceForView.dueDate}</div>
              <div><strong>Payment Status:</strong> <StatusBadge status={selectedInvoiceForView.status} /></div>
            </div>

            <table className="erp-table">
              <thead>
                <tr>
                  <th>Description</th>
                  <th style={{ textAlign: 'right' }}>Taxable Value</th>
                  <th style={{ textAlign: 'right' }}>GST Rate</th>
                  <th style={{ textAlign: 'right' }}>GST Amount</th>
                  <th style={{ textAlign: 'right' }}>Gross Total</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Industrial Chemical Consignment ({selectedInvoiceForView.deliveryId})</td>
                  <td style={{ textAlign: 'right' }}>₹{selectedInvoiceForView.subTotal.toLocaleString()}</td>
                  <td style={{ textAlign: 'right' }}>18% IGST</td>
                  <td style={{ textAlign: 'right' }}>₹{selectedInvoiceForView.gstAmount.toLocaleString()}</td>
                  <td style={{ textAlign: 'right', fontWeight: 700 }}>₹{selectedInvoiceForView.totalWithTax.toLocaleString()}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default FinancePage;
