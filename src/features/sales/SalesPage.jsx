import { useState } from 'react';
import PageHeader from '../../components/layout/PageHeader';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import DataTable from '../../components/ui/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import FilterBar from '../../components/common/FilterBar';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import ApprovalModal from '../../components/common/ApprovalModal';
import { useErp } from '../../hooks/useErp';
import { Plus, Download, Printer, ArrowRight, ShieldCheck, FileText, Pencil, Eye, ShoppingCart, Landmark, Building2, CheckCircle2, Truck } from 'lucide-react';

export function SalesPage() {
  const {
    quotations,
    salesOrders,
    customers,
    products,
    createQuotation,
    updateQuotation,
    convertQuotationToSalesOrder,
    createSalesOrder,
    updateSalesOrder,
    currentUser,
  } = useErp();

  const [activeTab, setActiveTab] = useState('orders'); // 'orders' | 'quotations'
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modals
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [isSoModalOpen, setIsSoModalOpen] = useState(false);
  const [selectedRecordForView, setSelectedRecordForView] = useState(null);
  const [approvalModalState, setApprovalModalState] = useState({ isOpen: false, targetType: null, record: null });

  // Edit States
  const [editingQuote, setEditingQuote] = useState(null);
  const [quoteEditForm, setQuoteEditForm] = useState({
    qty: 40,
    unitPrice: 96000,
    deliverySchedule: '',
    paymentTerms: '',
  });

  const [editingSo, setEditingSo] = useState(null);
  const [soEditForm, setSoEditForm] = useState({
    quantity: 40,
    unitPrice: 96000,
    orderTerms: 'Ex-Work',
    paymentTerms: '30 Days Net',
    portOfDelivery: 'Client Site',
  });

  const handleOpenEditQuote = (row) => {
    setEditingQuote(row);
    const firstItem = row.items?.[0] || {};
    setQuoteEditForm({
      qty: firstItem.qty || row.qty || 40,
      unitPrice: firstItem.unitPrice || row.unitPrice || 96000,
      deliverySchedule: row.deliverySchedule || 'Part delivery (20 MT + 20 MT)',
      paymentTerms: row.paymentTerms || '30 Days Net',
    });
  };

  const handleSaveQuoteEdit = () => {
    if (!editingQuote) return;
    const qty = Number(quoteEditForm.qty);
    const unitPrice = Number(quoteEditForm.unitPrice);
    const updatedItems = (editingQuote.items || []).map((item, idx) =>
      idx === 0
        ? { ...item, qty, unitPrice, total: qty * unitPrice }
        : item
    );
    updateQuotation(editingQuote.id, {
      items: updatedItems.length ? updatedItems : [{ productName: 'Refined Glycerin 99.7% IP', qty, unitPrice }],
      qty,
      unitPrice,
      totalValue: qty * unitPrice,
      deliverySchedule: quoteEditForm.deliverySchedule,
      paymentTerms: quoteEditForm.paymentTerms,
    });
    setEditingQuote(null);
  };

  const handleOpenEditSo = (row) => {
    setEditingSo(row);
    const firstItem = row.items?.[0] || {};
    setSoEditForm({
      quantity: firstItem.qty || row.quantity || 40,
      unitPrice: firstItem.unitPrice || row.rate || row.unitPrice || 96000,
      orderTerms: row.orderTerms || 'Ex-Work',
      paymentTerms: row.paymentTerms || '30 Days Net',
      portOfDelivery: row.portOfDelivery || 'Client Site',
    });
  };

  const handleSaveSoEdit = () => {
    if (!editingSo) return;
    const qty = Number(soEditForm.quantity);
    const rate = Number(soEditForm.unitPrice);
    const updatedItems = (editingSo.items || []).map((item, idx) =>
      idx === 0
        ? { ...item, qty, unitPrice: rate, total: qty * rate }
        : item
    );
    updateSalesOrder(editingSo.id, {
      items: updatedItems.length ? updatedItems : [{ productName: 'Refined Glycerin 99.7% IP', qty, unitPrice: rate }],
      quantity: qty,
      rate,
      orderTerms: soEditForm.orderTerms,
      paymentTerms: soEditForm.paymentTerms,
      portOfDelivery: soEditForm.portOfDelivery,
    });
    setEditingSo(null);
  };

  // Direct SO Form matching Section 1 spec
  const [soForm, setSoForm] = useState({
    customerId: '',
    consignee: '',
    buyerOtherThanConsignee: '',
    productId: '',
    refPoNumber: 'PO-2026-881',
    inwardPoTraded: 'No',
    orderTerms: 'Ex-Work',
    countryOfOrigin: 'India',
    portOfLoading: 'Dahej Industrial Port / JNPT',
    portOfDelivery: 'Client Delivery Site',
    tradeName: 'OleoPure Gly-997',
    hsn: '29054500',
    spec: 'USP / IP 99.7% Min, APHA <10, Moisture <0.3%',
    packaging: 'Bulk Road Tanker',
    quantity: 40,
    unitPrice: 96000,
    containerType: '20ft ISO Tank / FCL',
    loadingCapacity: '20 MT / Tanker',
    isMultiDelivery: true,
    paymentTerms: '30 Days Net',
    deliverySchedule: 'Split D1 (20 MT) & D2 (20 MT)',
  });

  // Filter Sales Orders
  const filteredOrders = salesOrders.filter((o) => {
    const matchesSearch =
      o.id.toLowerCase().includes(search.toLowerCase()) ||
      o.customerName.toLowerCase().includes(search.toLowerCase()) ||
      (o.items[0]?.productName || '').toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter ? o.status === statusFilter : true;
    return matchesSearch && matchesStatus;
  });

  // Filter Quotations
  const filteredQuotes = quotations.filter((q) => {
    const matchesSearch =
      q.id.toLowerCase().includes(search.toLowerCase()) ||
      q.customerName.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter ? q.status === statusFilter : true;
    return matchesSearch && matchesStatus;
  });

  const soColumns = [
    {
      key: 'id',
      title: 'Sales Order #',
      render: (val) => <strong style={{ color: 'var(--color-primary-dark)' }}>{val}</strong>,
    },
    { key: 'customerName', title: 'Customer Account' },
    {
      key: 'product',
      title: 'Chemical Grade',
      render: (_, row) => row.items[0]?.productName || '—',
    },
    {
      key: 'quantity',
      title: 'Volume (MT)',
      align: 'right',
      render: (_, row) => `${row.items[0]?.qty || 0} MT`,
    },
    {
      key: 'value',
      title: 'Total Order Value',
      align: 'right',
      render: (_, row) => `₹${(row.totalValue || 0).toLocaleString()}`,
    },
    {
      key: 'deliveries',
      title: 'Shipments (D1, D2)',
      render: (_, row) => (
        <div style={{ display: 'flex', gap: 4 }}>
          {row.deliveries.map((d) => (
            <span
              key={d.id}
              style={{
                fontSize: '0.625rem',
                fontWeight: 700,
                padding: '1px 5px',
                borderRadius: 'var(--radius-pill)',
                background: d.status === 'dispatched' || d.status === 'delivered' ? 'var(--color-primary-light)' : 'var(--color-bg-subtle)',
                color: d.status === 'dispatched' || d.status === 'delivered' ? 'var(--color-primary-dark)' : 'var(--color-text-secondary)',
                border: '1px solid var(--color-border)',
              }}
            >
              {d.id}: {d.qty}MT ({d.status})
            </span>
          ))}
        </div>
      ),
    },
    {
      key: 'status',
      title: 'Lifecycle Status',
      render: (val) => <StatusBadge status={val} />,
    },
    {
      key: 'actions',
      title: 'Actions',
      align: 'right',
      render: (_, row) => (
        <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
          <Button
            size="sm"
            variant="secondary"
            icon={<Eye size={13} />}
            onClick={() => setSelectedRecordForView({ type: 'so', data: row })}
          >
            View SO
          </Button>
          {row.status !== 'open' && (
            <Button
              size="sm"
              variant="secondary"
              icon={<Download size={12} />}
              title="Download Authorized Form with HOD Signature"
              onClick={() => setSelectedRecordForView({ type: 'so', data: row })}
            >
              Download PDF
            </Button>
          )}
          <Button
            size="sm"
            variant="secondary"
            icon={<Pencil size={12} />}
            onClick={() => handleOpenEditSo(row)}
          >
            Edit
          </Button>
          {row.status === 'open' && (
            <Button
              size="sm"
              variant="primary"
              icon={<ShieldCheck size={13} />}
              onClick={() => setApprovalModalState({ isOpen: true, targetType: 'sales_order', record: row })}
            >
              HOD Approval
            </Button>
          )}
        </div>
      ),
    },
  ];

  const quoteColumns = [
    {
      key: 'id',
      title: 'Quotation #',
      render: (val) => <strong style={{ color: 'var(--color-primary-dark)' }}>{val}</strong>,
    },
    { key: 'customerName', title: 'Customer Account' },
    {
      key: 'product',
      title: 'Chemical Grade',
      render: (_, row) => row.items[0]?.productName || '—',
    },
    {
      key: 'volume',
      title: 'Quantity (MT)',
      align: 'right',
      render: (_, row) => `${row.items[0]?.qty || 0} MT`,
    },
    {
      key: 'unitPrice',
      title: 'Rate / MT',
      align: 'right',
      render: (_, row) => `₹${Number(row.items[0]?.unitPrice || 0).toLocaleString()}`,
    },
    {
      key: 'status',
      title: 'Quotation Status',
      render: (val) => <StatusBadge status={val} />,
    },
    {
      key: 'actions',
      title: 'Actions',
      align: 'right',
      render: (_, row) => (
        <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
          <Button
            size="sm"
            variant="secondary"
            icon={<Printer size={13} />}
            onClick={() => setSelectedRecordForView({ type: 'quote', data: row })}
          >
            Print PDF
          </Button>
          <Button
            size="sm"
            variant="secondary"
            icon={<Pencil size={12} />}
            onClick={() => handleOpenEditQuote(row)}
          >
            Edit
          </Button>
          {row.status === 'awaiting approval' && (
            <Button
              size="sm"
              variant="primary"
              icon={<ShieldCheck size={13} />}
              onClick={() => setApprovalModalState({ isOpen: true, targetType: 'quotation', record: row })}
            >
              HOD Sign-off
            </Button>
          )}
          {row.status === 'approved' && (
            <Button
              size="sm"
              variant="primary"
              icon={<ArrowRight size={13} />}
              onClick={() => convertQuotationToSalesOrder(row.id)}
            >
              Convert to SO
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Sales, Quotations & Export Contracts"
        description="Workflow: Quotation (SOL/Q/XXXX) → HOD Approval → Sales Order (SOL/SO/XXXX) → Multi-Delivery Tracking (D1, D2)"
        actions={
          <>
            <Button
              variant="secondary"
              icon={<Plus size={15} />}
              onClick={() => setIsQuoteModalOpen(true)}
            >
              New Quotation (SOL/Q)
            </Button>
            <Button variant="primary" icon={<Plus size={15} />} onClick={() => setIsSoModalOpen(true)}>
              Direct Sales Order (SOL/SO)
            </Button>
          </>
        }
      />

      {/* Tabs */}
      <div className="erp-tabs-row">
        <Button
          size="sm"
          variant={activeTab === 'orders' ? 'primary' : 'secondary'}
          icon={<ShoppingCart size={13} />}
          onClick={() => setActiveTab('orders')}
        >
          Sales Orders (SOL/SO) [{salesOrders.length}]
        </Button>
        <Button
          size="sm"
          variant={activeTab === 'quotations' ? 'primary' : 'secondary'}
          icon={<FileText size={13} />}
          onClick={() => setActiveTab('quotations')}
        >
          Commercial Quotations (SOL/Q) [{quotations.length}]
        </Button>
      </div>

      <FilterBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder={activeTab === 'orders' ? 'Search SO # or customer...' : 'Search Quote # or customer...'}
        onReset={() => {
          setSearch('');
          setStatusFilter('');
        }}
        totalCount={activeTab === 'orders' ? filteredOrders.length : filteredQuotes.length}
      />

      <Card noPadding>
        {activeTab === 'orders' ? (
          <DataTable columns={soColumns} data={filteredOrders} keyField="id" />
        ) : (
          <DataTable columns={quoteColumns} data={filteredQuotes} keyField="id" />
        )}
      </Card>

      {/* PDF / Formal View Modal */}
      {selectedRecordForView && (
        <Modal
          isOpen={Boolean(selectedRecordForView)}
          onClose={() => setSelectedRecordForView(null)}
          title={`${selectedRecordForView.type === 'so' ? 'Sales Order' : 'Quotation'}: ${selectedRecordForView.data.id}`}
          description="Client-facing authorized document layout with digital stamp and terms."
          size="lg"
          footer={
            <>
              <Button variant="secondary" onClick={() => setSelectedRecordForView(null)}>
                Close
              </Button>
              <Button
                variant="primary"
                icon={<Printer size={15} />}
                onClick={() => {
                  window.print();
                }}
              >
                Print / Save PDF
              </Button>
            </>
          }
        >
          <div
            style={{
              padding: 'var(--space-5)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              background: '#FFFFFF',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-4)',
            }}
          >
            {/* Document Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid var(--color-primary-dark)', paddingBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <img src="/logo.png" alt="SDF Logo" style={{ width: 48, height: 48, objectFit: 'contain' }} />
                <div>
                  <h2 style={{ color: 'var(--color-primary-dark)', margin: 0, fontSize: '1.25rem' }}>SDF OILCHEMS LIMITED</h2>
                  <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>
                    Plot No. 1201, GIDC Industrial Estate, Dahej, Bharuch, Gujarat 392130<br />
                    GSTIN: 24AAACS8912P1ZA • CIN: U24230GJ2005PLC046123
                  </div>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>
                  {selectedRecordForView.type === 'so' ? 'CHEMICAL SALES ORDER' : 'COMMERCIAL QUOTATION'}
                </div>
                <h3 style={{ margin: '2px 0', color: 'var(--color-primary-dark)' }}>{selectedRecordForView.data.id}</h3>
                <div style={{ fontSize: 'var(--font-size-xs)' }}>Date: {selectedRecordForView.data.date}</div>
                <div style={{ marginTop: 4 }}>
                  <StatusBadge status={selectedRecordForView.data.status} />
                </div>
              </div>
            </div>

            {/* Header Logistics & Contracting Parties */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: 16,
                fontSize: 'var(--font-size-xs)',
                padding: 'var(--space-3)',
                background: 'var(--color-bg-subtle)',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--color-border)',
              }}
            >
              <div>
                <div style={{ fontWeight: 700, color: 'var(--color-primary-dark)', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Building2 size={13} /> CONSIGNOR / PLACE OF ORIGIN:
                </div>
                <div>{selectedRecordForView.data.fromPlace || 'SDF Oilchems Limited, Dahej Plant #1, Gujarat'}</div>
                <div style={{ marginTop: 8, fontWeight: 700, color: 'var(--color-primary-dark)', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Building2 size={13} /> TO CONSIGNEE / DESTINATION:
                </div>
                <div><strong>{selectedRecordForView.data.consignee || selectedRecordForView.data.customerName}</strong></div>
                {selectedRecordForView.data.buyerOtherThanConsignee && (
                  <div style={{ marginTop: 4, color: 'var(--color-text-secondary)' }}>
                    <em>Buyer (other than Consignee):</em> {selectedRecordForView.data.buyerOtherThanConsignee}
                  </div>
                )}
              </div>

              <div>
                <div style={{ fontWeight: 700, color: 'var(--color-primary-dark)', marginBottom: 4 }}>CONTRACT & SHIPPING DETAILS:</div>
                <div><strong>Ref PO / Quotation No:</strong> {selectedRecordForView.data.poRef || selectedRecordForView.data.refPoNumber || selectedRecordForView.data.quoteRef || 'PO-DIRECT-2026'}</div>
                <div><strong>Inward PO Type:</strong> {selectedRecordForView.data.inwardPoTraded === 'Yes' || selectedRecordForView.data.inwardPoTraded === true ? 'Traded Consignment' : 'Dahej Plant In-House Synthesis'}</div>
                <div><strong>Order Terms (Incoterms):</strong> <span style={{ fontWeight: 700, color: 'var(--color-primary-dark)' }}>{selectedRecordForView.data.orderTerms || 'Ex-Work'}</span></div>
                <div><strong>Country of Origin:</strong> {selectedRecordForView.data.countryOfOrigin || 'India'}</div>
                <div><strong>Port of Loading (POL):</strong> {selectedRecordForView.data.portOfLoading || 'Dahej Port / Nhava Sheva (JNPT)'}</div>
                <div><strong>Port of Delivery (POD):</strong> {selectedRecordForView.data.portOfDelivery || 'Customer Destination Gate'}</div>
              </div>
            </div>

            {/* Technical Items Table */}
            <div style={{ overflowX: 'auto' }}>
              <table className="erp-table">
                <thead>
                  <tr>
                    <th style={{ width: 40 }}>Sr.</th>
                    <th>Product & Trade Name</th>
                    <th>HSN Code</th>
                    <th>Specification Guarantee</th>
                    <th>Packaging / Container</th>
                    <th style={{ textAlign: 'right' }}>Capacity / Qty</th>
                    <th style={{ textAlign: 'right' }}>Rate / MT (INR)</th>
                    <th style={{ textAlign: 'right' }}>Total Value (INR)</th>
                  </tr>
                </thead>
                <tbody>
                  {(selectedRecordForView.data.items || []).map((it, i) => (
                    <tr key={i}>
                      <td>{it.srNo || i + 1}</td>
                      <td>
                        <strong>{it.productName}</strong>
                        {it.tradeName && <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-secondary)' }}>Trade: {it.tradeName}</div>}
                      </td>
                      <td><code>{it.hsn || '29054500'}</code></td>
                      <td style={{ fontSize: '0.6875rem', maxWidth: 180 }}>{it.spec || 'Standard Monograph Guaranteed'}</td>
                      <td>
                        <div>{it.packaging || 'Bulk Road Tanker'}</div>
                        <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-secondary)' }}>{it.containerType || selectedRecordForView.data.containerType || '20ft ISO Tank / FCL'}</div>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <strong>{it.qty} {it.uom || 'MT'}</strong>
                        <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-secondary)' }}>{it.loadingCapacity || selectedRecordForView.data.loadingCapacity || '20 MT / Tanker'}</div>
                      </td>
                      <td style={{ textAlign: 'right' }}>₹{Number(it.unitPrice).toLocaleString()}</td>
                      <td style={{ textAlign: 'right' }}>
                        <strong style={{ color: 'var(--color-primary-dark)' }}>
                          ₹{(Number(it.unitPrice) * Number(it.qty)).toLocaleString()}
                        </strong>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Banking Details Box (SDF Oilchems Limited Defaults) */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: 12,
                fontSize: 'var(--font-size-xs)',
                padding: 'var(--space-3)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-sm)',
                background: '#FAFAFB',
              }}
            >
              <div>
                <div style={{ fontWeight: 700, color: 'var(--color-primary-dark)', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Landmark size={13} /> OFFICIAL BANK REMITTANCE INSTRUCTIONS:
                </div>
                <div><strong>Account Name:</strong> SDF Oilchems Limited</div>
                <div><strong>Account Number:</strong> 002105001892</div>
                <div><strong>IFSC Code:</strong> HDFC0000021</div>
                <div><strong>Beneficiary Bank:</strong> HDFC Bank, Dahej SEZ Branch, Gujarat, India</div>
              </div>
              <div>
                <div style={{ fontWeight: 700, color: 'var(--color-primary-dark)', marginBottom: 4 }}>INTERNATIONAL / INTERMEDIARY ROUTING:</div>
                <div><strong>Intermediary Bank:</strong> Standard Chartered Bank, Mumbai (SCBLINBB)</div>
                <div><strong>Beneficiary Bank:</strong> HDFC Bank Limited, India</div>
                <div><strong>Payment Terms:</strong> <strong style={{ color: 'var(--color-primary-dark)' }}>{selectedRecordForView.data.paymentTerms}</strong></div>
                <div><strong>Delivery Schedule:</strong> {selectedRecordForView.data.deliverySchedule || 'Phase 1 & Phase 2 Execution'}</div>
              </div>
            </div>

            {/* Multi-Delivery Breakdown if present */}
            {selectedRecordForView.data.deliveries && selectedRecordForView.data.deliveries.length > 0 && (
              <div style={{ fontSize: 'var(--font-size-xs)', padding: 'var(--space-2) var(--space-3)', background: 'var(--color-bg-subtle)', borderRadius: 'var(--radius-sm)' }}>
                <strong>Multi-Delivery Shipment Schedule:</strong>
                <div style={{ display: 'flex', gap: 12, marginTop: 4 }}>
                  {selectedRecordForView.data.deliveries.map((del) => (
                    <div key={del.id} style={{ border: '1px solid var(--color-border)', padding: '4px 8px', borderRadius: 4, background: '#fff' }}>
                      <strong>{del.id}:</strong> {del.qty} MT • Status: <span style={{ textTransform: 'capitalize', fontWeight: 600 }}>{del.status}</span> • Vehicle: {del.vehicleNo || 'TBD'}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Footer with Authorized Signature */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, paddingTop: 12, borderTop: '2px solid var(--color-border)', fontSize: 'var(--font-size-xs)' }}>
              <div>
                <div><strong>Prepared By:</strong> {selectedRecordForView.data.preparedBy || currentUser.name}</div>
                <div style={{ color: 'var(--color-text-secondary)', fontSize: '0.6875rem' }}>Electronic Generation Reference: SDF-ERP-V2</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                {selectedRecordForView.data.status === 'open' ? (
                  <div style={{ color: 'var(--color-warning-dark, #b45309)', fontWeight: 700, border: '1px dashed #f59e0b', padding: '6px 12px', borderRadius: 4, background: '#fffbeb' }}>
                    Pending HOD Digital Approval
                  </div>
                ) : (
                  <div style={{ color: 'var(--color-action-green, #15803d)', fontWeight: 700, border: '1px solid #16a34a', padding: '6px 14px', borderRadius: 4, background: '#f0fdf4', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <CheckCircle2 size={15} color="#16a34a" />
                    <div>
                      <div>DIGITALLY AUTHORIZED BY HOD</div>
                      <div style={{ fontSize: '0.6875rem', fontWeight: 500, color: 'var(--color-text-secondary)' }}>
                        {selectedRecordForView.data.authorizedSign || 'Rajesh Sharma (Plant Head / HOD)'}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Universal Approval Modal */}
      <ApprovalModal
        isOpen={approvalModalState.isOpen}
        onClose={() => setApprovalModalState({ isOpen: false, targetType: null, record: null })}
        targetType={approvalModalState.targetType}
        record={approvalModalState.record}
      />

      {/* Create Quote Modal */}
      <Modal
        isOpen={isQuoteModalOpen}
        onClose={() => setIsQuoteModalOpen(false)}
        title="Create Chemical Sales Quotation (SOL/Q)"
        description="Auto-generates SOL/Q series and routes for mandatory HOD review."
        size="md"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsQuoteModalOpen(false)}>Cancel</Button>
            <Button
              variant="primary"
              onClick={() => {
                const c = customers[0];
                const p = products[0];
                createQuotation({
                  customerId: c.id,
                  customerName: c.companyName,
                  items: [{
                    srNo: 1,
                    productId: p.id,
                    productName: p.productName,
                    tradeName: p.productCode,
                    packaging: '250 kg Drum',
                    unitPrice: p.rate || 96000,
                    qty: 40,
                    uom: 'MT',
                  }],
                  containerType: '20ft FCL / Tanker',
                  loadingCapacity: '40 MT',
                  leadTime: '5-7 Days',
                  deliverySchedule: 'Part delivery (20 MT + 20 MT)',
                  paymentTerms: '30 Days Net',
                  offerValidity: '15 Days',
                });
                setIsQuoteModalOpen(false);
              }}
            >
              Generate Quotation (SOL/Q)
            </Button>
          </>
        }
      >
        <div style={{ fontSize: 'var(--font-size-xs)', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div>Generate a formal commercial quotation draft with items from the master catalog.</div>
        </div>
      </Modal>

      {/* Create Direct SO Modal (Matching Section 1 Specification) */}
      <Modal
        isOpen={isSoModalOpen}
        onClose={() => setIsSoModalOpen(false)}
        title="Direct Sales Order Booking (SOL/SO)"
        description="Creates production-committed order (SOL/SO), assigns logistics work order, and routes to HOD."
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsSoModalOpen(false)}>Cancel</Button>
            <Button
              variant="primary"
              onClick={() => {
                const c = customers.find((cust) => cust.id === soForm.customerId) || customers[0];
                const p = products.find((prod) => prod.id === soForm.productId) || products[0];
                const qty = Number(soForm.quantity) || 40;
                const unitPrice = Number(soForm.unitPrice) || 96000;
                const total = qty * unitPrice;

                createSalesOrder({
                  customerId: c.id,
                  customerName: c.companyName,
                  fromPlace: 'Dahej Plant #1, Gujarat',
                  consignee: soForm.consignee || c.companyName,
                  buyer: soForm.buyerOtherThanConsignee || c.companyName,
                  buyerOtherThanConsignee: soForm.buyerOtherThanConsignee || '',
                  refPoNumber: soForm.refPoNumber,
                  inwardPoTraded: soForm.inwardPoTraded,
                  orderTerms: soForm.orderTerms,
                  countryOfOrigin: soForm.countryOfOrigin || 'India',
                  portOfLoading: soForm.portOfLoading,
                  portOfDelivery: soForm.portOfDelivery,
                  containerType: soForm.containerType,
                  loadingCapacity: soForm.loadingCapacity,
                  isMultiDelivery: Boolean(soForm.isMultiDelivery),
                  items: [{
                    srNo: 1,
                    productId: p.id,
                    productName: p.productName,
                    tradeName: soForm.tradeName || p.productCode,
                    hsn: soForm.hsn || '29054500',
                    spec: soForm.spec || 'Standard Monograph Guaranteed',
                    packaging: soForm.packaging,
                    containerType: soForm.containerType,
                    loadingCapacity: soForm.loadingCapacity,
                    unitPrice: unitPrice,
                    qty: qty,
                    uom: 'MT',
                    total: total,
                  }],
                  totalValue: total,
                  paymentTerms: soForm.paymentTerms,
                  deliverySchedule: soForm.deliverySchedule,
                  preparedBy: currentUser.name,
                  authorizedSign: 'Rajesh Sharma (Plant Head / HOD)',
                });
                setIsSoModalOpen(false);
              }}
            >
              Book Sales Order (SOL/SO)
            </Button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Section 1.1: Header & Contracting Parties */}
          <div>
            <h4 style={{ margin: '0 0 8px 0', fontSize: '0.8125rem', color: 'var(--color-primary-dark)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Building2 size={14} /> 1. Header Details & Contracting Parties
            </h4>
            <div className="erp-form-grid">
              <Select
                label="Customer Account (from Master)"
                value={soForm.customerId}
                onChange={(e) => {
                  const sel = customers.find((c) => c.id === e.target.value);
                  setSoForm({
                    ...soForm,
                    customerId: e.target.value,
                    consignee: sel?.companyName || soForm.consignee,
                  });
                }}
                options={customers.map((c) => ({ value: c.id, label: c.companyName }))}
              />
              <Input
                label="To Consignee / Destination"
                value={soForm.consignee}
                placeholder="Consignee delivery address / gate"
                onChange={(e) => setSoForm({ ...soForm, consignee: e.target.value })}
              />
              <Input
                label="Buyer other than Consignee (Optional)"
                value={soForm.buyerOtherThanConsignee}
                placeholder="Leave blank if buyer is consignee"
                onChange={(e) => setSoForm({ ...soForm, buyerOtherThanConsignee: e.target.value })}
              />
              <Input
                label="Ref PO / Quotation Number"
                value={soForm.refPoNumber}
                onChange={(e) => setSoForm({ ...soForm, refPoNumber: e.target.value })}
              />
              <Select
                label="Order Terms (Incoterms)"
                value={soForm.orderTerms}
                onChange={(e) => setSoForm({ ...soForm, orderTerms: e.target.value })}
                options={[
                  { value: 'Ex-Work', label: 'EX-WORK (Dahej Gate)' },
                  { value: 'FOB', label: 'FOB (Free On Board Port)' },
                  { value: 'CFR', label: 'CFR (Cost & Freight)' },
                  { value: 'CIF', label: 'CIF (Cost, Insurance & Freight)' },
                  { value: 'LC', label: 'LC (Letter of Credit Sight)' },
                ]}
              />
              <Select
                label="Inward PO if Traded"
                value={soForm.inwardPoTraded}
                onChange={(e) => setSoForm({ ...soForm, inwardPoTraded: e.target.value })}
                options={[
                  { value: 'No', label: 'No - In-House Dahej Synthesis' },
                  { value: 'Yes', label: 'Yes - Traded Chemical Consignment' },
                ]}
              />
              <Input
                label="Port of Loading (POL)"
                value={soForm.portOfLoading}
                onChange={(e) => setSoForm({ ...soForm, portOfLoading: e.target.value })}
              />
              <Input
                label="Port of Delivery (POD)"
                value={soForm.portOfDelivery}
                onChange={(e) => setSoForm({ ...soForm, portOfDelivery: e.target.value })}
              />
            </div>
          </div>

          {/* Section 1.2: Items Specification & Logistics */}
          <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: 12 }}>
            <h4 style={{ margin: '0 0 8px 0', fontSize: '0.8125rem', color: 'var(--color-primary-dark)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Truck size={14} /> 2. Items Specification, Container & Packaging
            </h4>
            <div className="erp-form-grid">
              <Select
                label="Chemical Product Grade"
                value={soForm.productId}
                onChange={(e) => {
                  const sel = products.find((p) => p.id === e.target.value);
                  setSoForm({
                    ...soForm,
                    productId: e.target.value,
                    tradeName: sel?.productCode || soForm.tradeName,
                    unitPrice: sel?.rate || soForm.unitPrice,
                  });
                }}
                options={products.map((p) => ({ value: p.id, label: p.productName }))}
              />
              <Input
                label="Trade Name / Brand"
                value={soForm.tradeName}
                onChange={(e) => setSoForm({ ...soForm, tradeName: e.target.value })}
              />
              <Input
                label="HSN Code"
                value={soForm.hsn}
                onChange={(e) => setSoForm({ ...soForm, hsn: e.target.value })}
              />
              <Input
                label="Specification Guarantee"
                value={soForm.spec}
                onChange={(e) => setSoForm({ ...soForm, spec: e.target.value })}
              />
              <Select
                label="Packaging"
                value={soForm.packaging}
                onChange={(e) => setSoForm({ ...soForm, packaging: e.target.value })}
                options={[
                  { value: 'Bulk Road Tanker', label: 'Bulk Road Tanker (Insulated)' },
                  { value: '250 kg Drum', label: '250 kg HM-HDPE Drums' },
                  { value: '1000L IBC Tote', label: '1000L Composite IBC Tote' },
                  { value: '25 kg Bags on Pallets', label: '25 kg Bags on Pallets' },
                ]}
              />
              <Select
                label="Container Type"
                value={soForm.containerType}
                onChange={(e) => setSoForm({ ...soForm, containerType: e.target.value })}
                options={[
                  { value: '20ft ISO Tank / FCL', label: '20ft ISO Tank / FCL' },
                  { value: '20ft FCL Box Container', label: '20ft FCL Box Container' },
                  { value: 'Road Tanker (3-Axle)', label: 'Road Tanker (3-Axle)' },
                  { value: '40ft High Cube Container', label: '40ft High Cube Container' },
                ]}
              />
              <Input
                label="Loading Capacity"
                value={soForm.loadingCapacity}
                onChange={(e) => setSoForm({ ...soForm, loadingCapacity: e.target.value })}
              />
              <Input
                label="Volume Quantity (MT)"
                type="number"
                value={soForm.quantity}
                onChange={(e) => setSoForm({ ...soForm, quantity: e.target.value })}
              />
              <Input
                label="Unit Rate / MT (INR)"
                type="number"
                value={soForm.unitPrice}
                onChange={(e) => setSoForm({ ...soForm, unitPrice: e.target.value })}
              />
            </div>
          </div>

          {/* Section 1.3: Commercial Terms & Split Shipment */}
          <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: 12 }}>
            <h4 style={{ margin: '0 0 8px 0', fontSize: '0.8125rem', color: 'var(--color-primary-dark)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Landmark size={14} /> 3. Commercial Terms & Multi-Delivery Split
            </h4>
            <div className="erp-form-grid">
              <Select
                label="Multi-delivery Shipment"
                value={soForm.isMultiDelivery ? 'yes' : 'no'}
                onChange={(e) => setSoForm({ ...soForm, isMultiDelivery: e.target.value === 'yes' })}
                options={[
                  { value: 'yes', label: 'Yes - Split Deliveries (D1 + D2)' },
                  { value: 'no', label: 'No - Single Shipment' },
                ]}
              />
              <Select
                label="Payment Terms"
                value={soForm.paymentTerms}
                onChange={(e) => setSoForm({ ...soForm, paymentTerms: e.target.value })}
                options={[
                  { value: '30 Days Net', label: '30 Days Net' },
                  { value: '100% Against Documents', label: '100% Against Documents (CAD)' },
                  { value: 'Letter of Credit (LC) at Sight', label: 'Letter of Credit (LC) at Sight' },
                  { value: '15 Days Net', label: '15 Days Net' },
                  { value: 'Advance Payment', label: '100% Advance Wire Transfer' },
                ]}
              />
              <Input
                label="Delivery Schedule"
                value={soForm.deliverySchedule}
                onChange={(e) => setSoForm({ ...soForm, deliverySchedule: e.target.value })}
              />
            </div>
          </div>

          {/* Value Summary & Default Banking Banner */}
          <div
            style={{
              padding: '10px 14px',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--color-primary-light)',
              border: '1px solid var(--color-primary)',
              fontSize: 'var(--font-size-xs)',
              display: 'flex',
              flexDirection: 'column',
              gap: 4,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <strong>Total Sales Order Value:</strong>
              <strong style={{ fontSize: '1rem', color: 'var(--color-primary-dark)' }}>
                ₹{(Number(soForm.unitPrice || 0) * Number(soForm.quantity || 0)).toLocaleString()}
              </strong>
            </div>
            <div style={{ color: 'var(--color-text-secondary)', fontSize: '0.6875rem' }}>
              ✓ Default Bank Remittance: HDFC Bank Dahej (A/C: 002105001892, IFSC: HDFC0000021) • Intermediary: SCBLINBB<br />
              ✓ On submission, order routes to HOD for sign-off and auto-generates Logistics Inward Work Order.
            </div>
          </div>
        </div>
      </Modal>

      {/* Edit Quotation Modal */}
      <Modal
        isOpen={Boolean(editingQuote)}
        onClose={() => setEditingQuote(null)}
        title={editingQuote ? `Edit Quotation: ${editingQuote.id}` : 'Edit Quotation'}
        description="Update volume, price per MT, delivery schedule, and payment terms."
        size="md"
        footer={
          <>
            <Button variant="secondary" onClick={() => setEditingQuote(null)}>Cancel</Button>
            <Button variant="primary" onClick={handleSaveQuoteEdit}>Save Changes</Button>
          </>
        }
      >
        <div className="erp-form-grid">
          <Input
            label="Customer Account"
            disabled
            value={editingQuote?.customerName || ''}
          />
          <Input
            label="Chemical Grade"
            disabled
            value={editingQuote?.items?.[0]?.productName || 'Refined Chemical Product'}
          />
          <Input
            label="Volume Quantity (MT)"
            type="number"
            value={quoteEditForm.qty}
            onChange={(e) => setQuoteEditForm({ ...quoteEditForm, qty: e.target.value })}
          />
          <Input
            label="Unit Rate / MT (INR)"
            type="number"
            value={quoteEditForm.unitPrice}
            onChange={(e) => setQuoteEditForm({ ...quoteEditForm, unitPrice: e.target.value })}
          />
          <Input
            label="Delivery Schedule"
            value={quoteEditForm.deliverySchedule}
            onChange={(e) => setQuoteEditForm({ ...quoteEditForm, deliverySchedule: e.target.value })}
          />
          <Input
            label="Payment Terms"
            value={quoteEditForm.paymentTerms}
            onChange={(e) => setQuoteEditForm({ ...quoteEditForm, paymentTerms: e.target.value })}
          />
        </div>
      </Modal>

      {/* Edit Sales Order Modal */}
      <Modal
        isOpen={Boolean(editingSo)}
        onClose={() => setEditingSo(null)}
        title={editingSo ? `Edit Sales Order: ${editingSo.id}` : 'Edit Sales Order'}
        description="Update order volume, agreed rate, dispatch destination, and payment terms."
        size="md"
        footer={
          <>
            <Button variant="secondary" onClick={() => setEditingSo(null)}>Cancel</Button>
            <Button variant="primary" onClick={handleSaveSoEdit}>Save Changes</Button>
          </>
        }
      >
        <div className="erp-form-grid">
          <Input
            label="Customer Account"
            disabled
            value={editingSo?.customerName || ''}
          />
          <Input
            label="Chemical Grade"
            disabled
            value={editingSo?.items?.[0]?.productName || 'Refined Chemical Grade'}
          />
          <Input
            label="Order Volume (MT)"
            type="number"
            value={soEditForm.quantity}
            onChange={(e) => setSoEditForm({ ...soEditForm, quantity: e.target.value })}
          />
          <Input
            label="Agreed Rate / MT (INR)"
            type="number"
            value={soEditForm.unitPrice}
            onChange={(e) => setSoEditForm({ ...soEditForm, unitPrice: e.target.value })}
          />
          <Input
            label="Port / Destination Delivery"
            value={soEditForm.portOfDelivery}
            onChange={(e) => setSoEditForm({ ...soEditForm, portOfDelivery: e.target.value })}
          />
          <Input
            label="Payment Terms"
            value={soEditForm.paymentTerms}
            onChange={(e) => setSoEditForm({ ...soEditForm, paymentTerms: e.target.value })}
          />
        </div>
      </Modal>
    </div>
  );
}

export default SalesPage;
