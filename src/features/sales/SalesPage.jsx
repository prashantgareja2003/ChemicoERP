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
import { Plus, Download, Printer, ArrowRight, ShieldCheck, FileText, Pencil, Eye, ShoppingCart } from 'lucide-react';

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

  // Direct SO Form
  const [soForm, setSoForm] = useState({
    customerId: '',
    productId: '',
    quantity: 40,
    unitPrice: 96000,
    orderTerms: 'Ex-Work',
    portOfLoading: 'Dahej Plant #1',
    portOfDelivery: 'Client Site',
    paymentTerms: '30 Days Net',
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
                  <h2 style={{ color: 'var(--color-primary-dark)', margin: 0 }}>SDF OILCHEMS LIMITED</h2>
                  <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>
                    Plot No. 1201, GIDC Industrial Estate, Dahej, Bharuch, Gujarat 392130<br />
                    GSTIN: 24AAACS8912P1ZA • CIN: U24230GJ2005PLC046123
                  </div>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <h3 style={{ margin: 0, color: 'var(--color-primary-dark)' }}>{selectedRecordForView.data.id}</h3>
                <div style={{ fontSize: 'var(--font-size-xs)' }}>Date: {selectedRecordForView.data.date}</div>
                <StatusBadge status={selectedRecordForView.data.status} />
              </div>
            </div>

            {/* CX & Delivery Info */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16, fontSize: 'var(--font-size-xs)' }}>
              <div>
                <strong>CUSTOMER / BUYER:</strong>
                <div>{selectedRecordForView.data.customerName}</div>
                <div>{selectedRecordForView.data.consignee || 'Client Delivery Gate'}</div>
              </div>
              <div>
                <strong>COMMERCIAL TERMS:</strong>
                <div>Payment Terms: {selectedRecordForView.data.paymentTerms}</div>
                <div>Delivery Terms: {selectedRecordForView.data.orderTerms || selectedRecordForView.data.deliverySchedule}</div>
              </div>
            </div>

            {/* Items Table */}
            <table className="erp-table">
              <thead>
                <tr>
                  <th>Product Specification</th>
                  <th>Packaging</th>
                  <th style={{ textAlign: 'right' }}>Quantity</th>
                  <th style={{ textAlign: 'right' }}>Unit Rate</th>
                  <th style={{ textAlign: 'right' }}>Total (INR)</th>
                </tr>
              </thead>
              <tbody>
                {(selectedRecordForView.data.items || []).map((it, i) => (
                  <tr key={i}>
                    <td>
                      <strong>{it.productName}</strong>
                      <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-secondary)' }}>{it.spec || it.tradeName}</div>
                    </td>
                    <td>{it.packaging}</td>
                    <td style={{ textAlign: 'right' }}>{it.qty} {it.uom}</td>
                    <td style={{ textAlign: 'right' }}>₹{Number(it.unitPrice).toLocaleString()}</td>
                    <td style={{ textAlign: 'right' }}>₹{(Number(it.unitPrice) * Number(it.qty)).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Footer with Authorized Signature */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 16, paddingTop: 12, borderTop: '1px solid var(--color-border)', fontSize: 'var(--font-size-xs)' }}>
              <div>
                <strong>Prepared By:</strong> {selectedRecordForView.data.preparedBy || currentUser.name}
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ color: 'var(--color-primary-dark)', fontWeight: 700, border: '1px dashed var(--color-action-green)', padding: '6px 12px', borderRadius: 4 }}>
                  Digitally Authorized: {selectedRecordForView.data.authorizedSign || 'Rajesh Sharma (Plant Head)'}
                </div>
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

      {/* Create Direct SO Modal */}
      <Modal
        isOpen={isSoModalOpen}
        onClose={() => setIsSoModalOpen(false)}
        title="Direct Sales Order Booking (SOL/SO)"
        description="Creates production-committed order and assigns logistics inward work order."
        size="md"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsSoModalOpen(false)}>Cancel</Button>
            <Button
              variant="primary"
              onClick={() => {
                const c = customers.find((cust) => cust.id === soForm.customerId) || customers[0];
                const p = products.find((prod) => prod.id === soForm.productId) || products[0];
                createSalesOrder({
                  customerId: c.id,
                  customerName: c.companyName,
                  consignee: c.companyName,
                  buyer: c.companyName,
                  items: [{
                    srNo: 1,
                    productId: p.id,
                    productName: p.productName,
                    tradeName: p.productCode,
                    packaging: 'Bulk Road Tanker',
                    unitPrice: soForm.unitPrice,
                    qty: Number(soForm.quantity),
                    uom: 'MT',
                    total: Number(soForm.unitPrice) * Number(soForm.quantity),
                  }],
                  totalValue: Number(soForm.unitPrice) * Number(soForm.quantity),
                  orderTerms: soForm.orderTerms,
                  countryOfOrigin: 'India',
                  portOfLoading: soForm.portOfLoading,
                  portOfDelivery: soForm.portOfDelivery,
                  paymentTerms: soForm.paymentTerms,
                  deliverySchedule: 'Immediate production',
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
        <div className="erp-form-grid">
          <Select
            label="Customer Account (from Master)"
            value={soForm.customerId}
            onChange={(e) => setSoForm({ ...soForm, customerId: e.target.value })}
            options={customers.map((c) => ({ value: c.id, label: c.companyName }))}
          />
          <Select
            label="Product Grade (from Master)"
            value={soForm.productId}
            onChange={(e) => setSoForm({ ...soForm, productId: e.target.value })}
            options={products.map((p) => ({ value: p.id, label: p.productName }))}
          />
          <Input
            label="Volume (MT)"
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
