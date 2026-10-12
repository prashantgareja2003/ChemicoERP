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
import { Plus, Download, Printer, ArrowRight, ShieldCheck, FileText, Pencil, Eye, ShoppingCart, Landmark, Building2, CheckCircle2, Truck, Trash2 } from 'lucide-react';

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

  // Edit tracking states
  const [editingSoId, setEditingSoId] = useState(null);
  const [editingQuoteId, setEditingQuoteId] = useState(null);

  const handleOpenAddSo = () => {
    setEditingSoId(null);
    const defaultCust = customers[0] || {};
    const defaultProd = products[0] || {};
    setSoForm({
      customerId: defaultCust.id || '',
      consignee: defaultCust.companyName || '',
      buyerOtherThanConsignee: '',
      refPoNumber: 'PO-2026-881',
      inwardPoTraded: 'No',
      orderTerms: 'Ex-Work',
      countryOfOrigin: 'India',
      portOfLoading: 'Dahej Industrial Port / JNPT',
      portOfDelivery: 'Client Delivery Site',
      isMultiDelivery: true,
      paymentTerms: '30 Days Net',
      deliverySchedule: 'Split D1 (20 MT) & D2 (20 MT)',
    });
    setSoItems([
      {
        productId: defaultProd.id || '',
        productName: defaultProd.productName || 'Refined Glycerin 99.7% IP/USP',
        tradeName: defaultProd.productCode || 'OleoPure Gly-997',
        hsn: '29054500',
        spec: 'USP / IP 99.7% Min, APHA <10, Moisture <0.3%',
        packaging: 'Bulk Road Tanker',
        containerType: '20ft ISO Tank / FCL',
        loadingCapacity: '20 MT / Tanker',
        quantity: 40,
        unitPrice: defaultProd.rate || 96000,
      },
    ]);
    setIsSoModalOpen(true);
  };

  const handleOpenEditSo = (row) => {
    setEditingSoId(row.id);
    setSoForm({
      customerId: row.customerId || customers.find((c) => c.companyName === row.customerName)?.id || customers[0]?.id || '',
      consignee: row.consignee || row.customerName || '',
      buyerOtherThanConsignee: row.buyerOtherThanConsignee || (row.buyer !== row.consignee ? row.buyer : '') || '',
      refPoNumber: row.poRef || row.refPoNumber || '',
      inwardPoTraded: row.inwardPoTraded || 'No',
      orderTerms: row.orderTerms || 'Ex-Work',
      countryOfOrigin: row.countryOfOrigin || 'India',
      portOfLoading: row.portOfLoading || 'Dahej Port / JNPT',
      portOfDelivery: row.portOfDelivery || 'Customer Destination',
      isMultiDelivery: Boolean(row.isMultiDelivery || row.deliveries?.length > 1),
      paymentTerms: row.paymentTerms || '30 Days Net',
      deliverySchedule: row.deliverySchedule || '',
    });
    const loadedItems = (row.items && row.items.length > 0) ? row.items.map((it) => ({
      productId: it.productId || '',
      productName: it.productName || '',
      tradeName: it.tradeName || '',
      hsn: it.hsn || '29054500',
      spec: it.spec || 'Standard Monograph Guaranteed',
      packaging: it.packaging || 'Bulk Road Tanker',
      containerType: it.containerType || row.containerType || '20ft ISO Tank / FCL',
      loadingCapacity: it.loadingCapacity || row.loadingCapacity || '20 MT / Tanker',
      quantity: it.qty || 1,
      unitPrice: it.unitPrice || 0,
    })) : [
      {
        productId: products[0]?.id || '',
        productName: products[0]?.productName || '',
        tradeName: products[0]?.productCode || '',
        hsn: '29054500',
        spec: 'Standard Monograph Guaranteed',
        packaging: 'Bulk Road Tanker',
        containerType: '20ft ISO Tank / FCL',
        loadingCapacity: '20 MT / Tanker',
        quantity: row.quantity || 40,
        unitPrice: row.rate || 96000,
      },
    ];
    setSoItems(loadedItems);
    setIsSoModalOpen(true);
  };

  const handleOpenAddQuote = () => {
    setEditingQuoteId(null);
    const defaultCust = customers[0] || {};
    const defaultProd = products[0] || {};
    setQuoteForm({
      customerId: defaultCust.id || '',
      fromPlace: 'SDF Oilchems Limited, Dahej Plant #1',
      containerType: '20ft FCL / Tanker',
      loadingCapacity: '40 MT',
      leadTime: '5-7 Business Days',
      deliverySchedule: 'Part delivery (20 MT + 20 MT)',
      paymentTerms: '30 Days Net',
      offerValidity: '15 Days from quote date',
    });
    setQuoteItems([
      {
        productId: defaultProd.id || '',
        productName: defaultProd.productName || 'Refined Glycerin 99.7% IP/USP',
        tradeName: defaultProd.productCode || 'OleoPure Gly-997',
        packaging: '250 kg Drum / Bulk Tanker',
        containerType: '20ft FCL / Road Tanker',
        loadingCapacity: '40 MT (2 Tankers)',
        quantity: 40,
        unitPrice: defaultProd.rate || 96000,
      },
    ]);
    setIsQuoteModalOpen(true);
  };

  const handleOpenEditQuote = (row) => {
    setEditingQuoteId(row.id);
    setQuoteForm({
      customerId: row.customerId || customers.find((c) => c.companyName === row.customerName)?.id || customers[0]?.id || '',
      fromPlace: row.fromPlace || 'SDF Oilchems Limited, Dahej Plant #1',
      containerType: row.containerType || '20ft FCL / Tanker',
      loadingCapacity: row.loadingCapacity || '40 MT',
      leadTime: row.leadTime || '5-7 Business Days',
      deliverySchedule: row.deliverySchedule || 'Part delivery (20 MT + 20 MT)',
      paymentTerms: row.paymentTerms || '30 Days Net',
      offerValidity: row.offerValidity || '15 Days from quote date',
    });
    const loadedItems = (row.items && row.items.length > 0) ? row.items.map((it) => ({
      productId: it.productId || '',
      productName: it.productName || '',
      tradeName: it.tradeName || '',
      packaging: it.packaging || '250 kg Drum',
      containerType: it.containerType || row.containerType || '20ft FCL / Tanker',
      loadingCapacity: it.loadingCapacity || row.loadingCapacity || '40 MT',
      quantity: it.qty || 1,
      unitPrice: it.unitPrice || 0,
    })) : [
      {
        productId: products[0]?.id || '',
        productName: products[0]?.productName || '',
        tradeName: products[0]?.productCode || '',
        packaging: '250 kg Drum',
        containerType: '20ft FCL / Tanker',
        loadingCapacity: '40 MT',
        quantity: row.qty || 40,
        unitPrice: row.unitPrice || 96000,
      },
    ];
    setQuoteItems(loadedItems);
    setIsQuoteModalOpen(true);
  };

  // Direct SO Form matching Section 1 spec with Table Grid for multiple items
  const [soForm, setSoForm] = useState({
    customerId: '',
    consignee: '',
    buyerOtherThanConsignee: '',
    refPoNumber: 'PO-2026-881',
    inwardPoTraded: 'No',
    orderTerms: 'Ex-Work',
    countryOfOrigin: 'India',
    portOfLoading: 'Dahej Industrial Port / JNPT',
    portOfDelivery: 'Client Delivery Site',
    isMultiDelivery: true,
    paymentTerms: '30 Days Net',
    deliverySchedule: 'Split D1 (20 MT) & D2 (20 MT)',
  });

  const [soItems, setSoItems] = useState([
    {
      productId: '',
      productName: 'Refined Glycerin 99.7% IP/USP',
      tradeName: 'OleoPure Gly-997',
      hsn: '29054500',
      spec: 'USP / IP 99.7% Min, APHA <10, Moisture <0.3%',
      packaging: 'Bulk Road Tanker',
      containerType: '20ft ISO Tank / FCL',
      loadingCapacity: '20 MT / Tanker',
      quantity: 40,
      unitPrice: 96000,
    },
  ]);

  const handleAddSoItem = () => {
    const defaultProd = products[0] || {};
    setSoItems((prev) => [
      ...prev,
      {
        productId: defaultProd.id || '',
        productName: defaultProd.productName || '',
        tradeName: defaultProd.productCode || '',
        hsn: '29054500',
        spec: 'Standard Monograph Guaranteed',
        packaging: 'Bulk Road Tanker',
        containerType: '20ft ISO Tank / FCL',
        loadingCapacity: '20 MT / Tanker',
        quantity: 20,
        unitPrice: defaultProd.rate || 90000,
      },
    ]);
  };

  const handleRemoveSoItem = (index) => {
    if (soItems.length <= 1) return;
    setSoItems((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleUpdateSoItem = (index, field, value) => {
    setSoItems((prev) =>
      prev.map((item, idx) => {
        if (idx !== index) return item;
        if (field === 'productId') {
          const matchedProd = products.find((p) => p.id === value);
          return {
            ...item,
            productId: value,
            productName: matchedProd?.productName || item.productName,
            tradeName: matchedProd?.productCode || item.tradeName,
            unitPrice: matchedProd?.rate || item.unitPrice,
          };
        }
        return { ...item, [field]: value };
      })
    );
  };

  // Quotation Form matching Section 3 with Table Grid for multiple items
  const [quoteForm, setQuoteForm] = useState({
    customerId: '',
    fromPlace: 'SDF Oilchems Limited, Dahej Plant #1',
    containerType: '20ft FCL / Tanker',
    loadingCapacity: '40 MT',
    leadTime: '5-7 Business Days',
    deliverySchedule: 'Part delivery (20 MT + 20 MT)',
    paymentTerms: '30 Days Net',
    offerValidity: '15 Days from quote date',
  });

  const [quoteItems, setQuoteItems] = useState([
    {
      productId: '',
      productName: 'Refined Glycerin 99.7% IP/USP',
      tradeName: 'OleoPure Gly-997',
      packaging: '250 kg Drum / Bulk Tanker',
      containerType: '20ft FCL / Road Tanker',
      loadingCapacity: '40 MT (2 Tankers)',
      quantity: 40,
      unitPrice: 96000,
    },
  ]);

  const handleAddQuoteItem = () => {
    const defaultProd = products[0] || {};
    setQuoteItems((prev) => [
      ...prev,
      {
        productId: defaultProd.id || '',
        productName: defaultProd.productName || '',
        tradeName: defaultProd.productCode || '',
        packaging: '250 kg Drum',
        containerType: '20ft FCL / Tanker',
        loadingCapacity: '20 MT / Tanker',
        quantity: 20,
        unitPrice: defaultProd.rate || 90000,
      },
    ]);
  };

  const handleRemoveQuoteItem = (index) => {
    if (quoteItems.length <= 1) return;
    setQuoteItems((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleUpdateQuoteItem = (index, field, value) => {
    setQuoteItems((prev) =>
      prev.map((item, idx) => {
        if (idx !== index) return item;
        if (field === 'productId') {
          const matchedProd = products.find((p) => p.id === value);
          return {
            ...item,
            productId: value,
            productName: matchedProd?.productName || item.productName,
            tradeName: matchedProd?.productCode || item.tradeName,
            unitPrice: matchedProd?.rate || item.unitPrice,
          };
        }
        return { ...item, [field]: value };
      })
    );
  };

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
        title="Sales Orders & Customer Contracts"
        description="Workflow: Quotation (SOL/Q) → HOD Approval → Sales Order (SOL/SO) → Production, QC/QA, Logistics & Payment"
        actions={
          activeTab === 'orders' ? (
            <Button variant="primary" icon={<Plus size={15} />} onClick={handleOpenAddSo}>
              + Direct Sales Order (SOL/SO)
            </Button>
          ) : (
            <Button variant="primary" icon={<Plus size={15} />} onClick={handleOpenAddQuote}>
              + Create Quotation (SOL/Q)
            </Button>
          )
        }
      />

      {/* Tab Switcher: Sales Orders vs Quotations & Bids */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 'var(--space-4)' }}>
        <button
          type="button"
          className={`erp-dash-pill ${activeTab === 'orders' ? 'active' : ''}`}
          onClick={() => setActiveTab('orders')}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
        >
          <ShoppingCart size={14} />
          <span>Sales Orders ({salesOrders.length})</span>
        </button>
        <button
          type="button"
          className={`erp-dash-pill ${activeTab === 'quotations' ? 'active' : ''}`}
          onClick={() => setActiveTab('quotations')}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
        >
          <FileText size={14} />
          <span>Quotations & Bids ({quotations.length})</span>
        </button>
      </div>

      <FilterBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder={activeTab === 'orders' ? "Search SO # or customer..." : "Search Quote # or client..."}
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

      {/* Create / Edit Quote Modal with Multi-Item Grid */}
      <Modal
        isOpen={isQuoteModalOpen}
        onClose={() => {
          setIsQuoteModalOpen(false);
          setEditingQuoteId(null);
        }}
        title={editingQuoteId ? `Edit Quotation: ${editingQuoteId}` : 'Create Chemical Sales Quotation (SOL/Q)'}
        description={editingQuoteId ? 'Update commercial quotation details and multi-item grid products.' : 'Auto-generates SOL/Q series with multi-item grid and routes for mandatory HOD review.'}
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => {
              setIsQuoteModalOpen(false);
              setEditingQuoteId(null);
            }}>Cancel</Button>
            <Button
              variant="primary"
              onClick={() => {
                const c = customers.find((cust) => cust.id === quoteForm.customerId) || customers[0];
                const validItems = quoteItems.map((item, idx) => {
                  const p = products.find((prod) => prod.id === item.productId) || products[0];
                  const qty = Number(item.quantity) || 1;
                  const price = Number(item.unitPrice) || 96000;
                  return {
                    srNo: idx + 1,
                    productId: item.productId || p.id,
                    productName: item.productName || p.productName,
                    tradeName: item.tradeName || p.productCode,
                    packaging: item.packaging,
                    unitPrice: price,
                    qty: qty,
                    uom: 'MT',
                    containerType: item.containerType,
                    loadingCapacity: item.loadingCapacity,
                    total: qty * price,
                  };
                });

                if (editingQuoteId) {
                  updateQuotation(editingQuoteId, {
                    customerId: c.id,
                    customerName: c.companyName,
                    fromPlace: quoteForm.fromPlace,
                    containerType: validItems[0]?.containerType || quoteForm.containerType,
                    loadingCapacity: validItems[0]?.loadingCapacity || quoteForm.loadingCapacity,
                    leadTime: quoteForm.leadTime,
                    deliverySchedule: quoteForm.deliverySchedule,
                    paymentTerms: quoteForm.paymentTerms,
                    offerValidity: quoteForm.offerValidity,
                    items: validItems,
                  });
                } else {
                  createQuotation({
                    customerId: c.id,
                    customerName: c.companyName,
                    fromPlace: quoteForm.fromPlace,
                    containerType: validItems[0]?.containerType || quoteForm.containerType,
                    loadingCapacity: validItems[0]?.loadingCapacity || quoteForm.loadingCapacity,
                    leadTime: quoteForm.leadTime,
                    deliverySchedule: quoteForm.deliverySchedule,
                    paymentTerms: quoteForm.paymentTerms,
                    offerValidity: quoteForm.offerValidity,
                    items: validItems,
                  });
                }
                setIsQuoteModalOpen(false);
                setEditingQuoteId(null);
              }}
            >
              {editingQuoteId ? 'Save Changes' : 'Generate Quotation (SOL/Q)'}
            </Button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Quote Header */}
          <div className="erp-form-grid">
            <Select
              label="Customer Account (From Master)"
              value={quoteForm.customerId}
              onChange={(e) => setQuoteForm({ ...quoteForm, customerId: e.target.value })}
              options={customers.map((c) => ({ value: c.id, label: c.companyName }))}
            />
            <Input
              label="From (Consignor / Location)"
              value={quoteForm.fromPlace}
              onChange={(e) => setQuoteForm({ ...quoteForm, fromPlace: e.target.value })}
            />
            <Input
              label="Lead Time"
              value={quoteForm.leadTime}
              onChange={(e) => setQuoteForm({ ...quoteForm, leadTime: e.target.value })}
            />
            <Input
              label="Offer Validity"
              value={quoteForm.offerValidity}
              onChange={(e) => setQuoteForm({ ...quoteForm, offerValidity: e.target.value })}
            />
            <Input
              label="Delivery Schedule"
              value={quoteForm.deliverySchedule}
              onChange={(e) => setQuoteForm({ ...quoteForm, deliverySchedule: e.target.value })}
            />
            <Select
              label="Payment Terms"
              value={quoteForm.paymentTerms}
              onChange={(e) => setQuoteForm({ ...quoteForm, paymentTerms: e.target.value })}
              options={[
                { value: '30 Days Net', label: '30 Days Net' },
                { value: '100% Against Documents', label: '100% Against Documents (CAD)' },
                { value: 'Letter of Credit (LC) at Sight', label: 'Letter of Credit (LC) at Sight' },
                { value: '15 Days Net', label: '15 Days Net' },
                { value: 'Advance Payment', label: '100% Advance Wire Transfer' },
              ]}
            />
          </div>

          {/* Quotation Table Grid (Multiple Items) */}
          <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <h4 style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--color-primary-dark)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <ShoppingCart size={14} /> Quotation Items Grid ({quoteItems.length} Products)
              </h4>
              <Button size="sm" variant="secondary" icon={<Plus size={13} />} onClick={handleAddQuoteItem}>
                Add Another Product
              </Button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {quoteItems.map((item, index) => (
                <div
                  key={index}
                  style={{
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-sm)',
                    padding: 10,
                    background: index % 2 === 0 ? '#FAFAFB' : '#FFFFFF',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 8,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <strong style={{ fontSize: '0.75rem', color: 'var(--color-primary-dark)' }}>
                      Item #{index + 1}: {item.productName || 'Select Product'}
                    </strong>
                    {quoteItems.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveQuoteItem(index)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--color-error)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4,
                          fontSize: '0.6875rem',
                          fontWeight: 600,
                        }}
                      >
                        <Trash2 size={12} /> Remove
                      </button>
                    )}
                  </div>

                  <div className="erp-form-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))' }}>
                    <Select
                      label="Product Name"
                      value={item.productId}
                      onChange={(e) => handleUpdateQuoteItem(index, 'productId', e.target.value)}
                      options={products.map((p) => ({ value: p.id, label: p.productName }))}
                    />
                    <Input
                      label="Trade Name"
                      value={item.tradeName}
                      onChange={(e) => handleUpdateQuoteItem(index, 'tradeName', e.target.value)}
                    />
                    <Input
                      label="Packaging"
                      value={item.packaging}
                      onChange={(e) => handleUpdateQuoteItem(index, 'packaging', e.target.value)}
                    />
                    <Input
                      label="Container Type"
                      value={item.containerType}
                      onChange={(e) => handleUpdateQuoteItem(index, 'containerType', e.target.value)}
                    />
                    <Input
                      label="Loading Capacity"
                      value={item.loadingCapacity}
                      onChange={(e) => handleUpdateQuoteItem(index, 'loadingCapacity', e.target.value)}
                    />
                    <Input
                      label="Quantity (MT)"
                      type="number"
                      value={item.quantity}
                      onChange={(e) => handleUpdateQuoteItem(index, 'quantity', e.target.value)}
                    />
                    <Input
                      label="Unit Rate / MT (INR)"
                      type="number"
                      value={item.unitPrice}
                      onChange={(e) => handleUpdateQuoteItem(index, 'unitPrice', e.target.value)}
                    />
                  </div>

                  <div style={{ textAlign: 'right', fontSize: '0.6875rem', color: 'var(--color-primary-dark)', fontWeight: 700 }}>
                    Item Line Total: ₹{((Number(item.quantity) || 0) * (Number(item.unitPrice) || 0)).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, padding: '8px 12px', background: 'var(--color-primary-light)', borderRadius: 'var(--radius-sm)' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>Total Quotation Value ({quoteItems.length} Items):</span>
              <strong style={{ fontSize: '0.9375rem', color: 'var(--color-primary-dark)' }}>
                ₹{quoteItems.reduce((acc, it) => acc + (Number(it.quantity || 0) * Number(it.unitPrice || 0)), 0).toLocaleString()}
              </strong>
            </div>
          </div>
        </div>
      </Modal>

      {/* Create / Edit Direct SO Modal with Multi-Item Grid */}
      <Modal
        isOpen={isSoModalOpen}
        onClose={() => {
          setIsSoModalOpen(false);
          setEditingSoId(null);
        }}
        title={editingSoId ? `Edit Sales Order: ${editingSoId}` : 'Direct Sales Order Booking (SOL/SO)'}
        description={editingSoId ? 'Modify sales order contracting parties, container specifications, and product item grid.' : 'Creates production-committed order (SOL/SO) with dynamic multi-product table grid, routes to HOD.'}
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => {
              setIsSoModalOpen(false);
              setEditingSoId(null);
            }}>Cancel</Button>
            <Button
              variant="primary"
              onClick={() => {
                const c = customers.find((cust) => cust.id === soForm.customerId) || customers[0];
                const validItems = soItems.map((item, idx) => {
                  const p = products.find((prod) => prod.id === item.productId) || products[0];
                  const qty = Number(item.quantity) || 1;
                  const unitPrice = Number(item.unitPrice) || 96000;
                  return {
                    srNo: idx + 1,
                    productId: item.productId || p.id,
                    productName: item.productName || p.productName,
                    tradeName: item.tradeName || p.productCode,
                    hsn: item.hsn || '29054500',
                    spec: item.spec || 'Standard Monograph Guaranteed',
                    packaging: item.packaging,
                    containerType: item.containerType,
                    loadingCapacity: item.loadingCapacity,
                    unitPrice: unitPrice,
                    qty: qty,
                    uom: 'MT',
                    total: qty * unitPrice,
                  };
                });

                const totalVal = validItems.reduce((sum, it) => sum + it.total, 0);

                if (editingSoId) {
                  updateSalesOrder(editingSoId, {
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
                    containerType: validItems[0]?.containerType || '20ft ISO Tank / FCL',
                    loadingCapacity: validItems[0]?.loadingCapacity || '20 MT / Tanker',
                    isMultiDelivery: Boolean(soForm.isMultiDelivery),
                    items: validItems,
                    totalValue: totalVal,
                    paymentTerms: soForm.paymentTerms,
                    deliverySchedule: soForm.deliverySchedule,
                  });
                } else {
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
                    containerType: validItems[0]?.containerType || '20ft ISO Tank / FCL',
                    loadingCapacity: validItems[0]?.loadingCapacity || '20 MT / Tanker',
                    isMultiDelivery: Boolean(soForm.isMultiDelivery),
                    items: validItems,
                    totalValue: totalVal,
                    paymentTerms: soForm.paymentTerms,
                    deliverySchedule: soForm.deliverySchedule,
                    preparedBy: currentUser.name,
                    authorizedSign: 'Rajesh Sharma (Plant Head / HOD)',
                  });
                }
                setIsSoModalOpen(false);
                setEditingSoId(null);
              }}
            >
              {editingSoId ? 'Save Changes' : 'Book Sales Order (SOL/SO)'}
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

          {/* Section 1.2: Items Specification & Logistics (Dynamic Multi-Product Table Grid) */}
          <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <h4 style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--color-primary-dark)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Truck size={14} /> 2. Items Specification, Container & Packaging Table Grid ({soItems.length} Products)
              </h4>
              <Button size="sm" variant="secondary" icon={<Plus size={13} />} onClick={handleAddSoItem}>
                Add Another Product
              </Button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {soItems.map((item, index) => (
                <div
                  key={index}
                  style={{
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-sm)',
                    padding: 12,
                    background: index % 2 === 0 ? '#FAFAFB' : '#FFFFFF',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 10,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span
                        style={{
                          background: 'var(--color-primary-light)',
                          color: 'var(--color-primary-dark)',
                          fontWeight: 700,
                          fontSize: '0.6875rem',
                          padding: '2px 8px',
                          borderRadius: 'var(--radius-pill)',
                        }}
                      >
                        Sr. #{index + 1}
                      </span>
                      <strong style={{ fontSize: '0.8125rem' }}>{item.productName || 'Select Product'}</strong>
                    </div>
                    {soItems.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveSoItem(index)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--color-error)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4,
                          fontSize: '0.6875rem',
                          fontWeight: 600,
                        }}
                      >
                        <Trash2 size={13} /> Remove Item
                      </button>
                    )}
                  </div>

                  <div className="erp-form-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))' }}>
                    <Select
                      label="Product Name"
                      value={item.productId}
                      onChange={(e) => handleUpdateSoItem(index, 'productId', e.target.value)}
                      options={products.map((p) => ({ value: p.id, label: p.productName }))}
                    />
                    <Input
                      label="Trade Name"
                      value={item.tradeName}
                      onChange={(e) => handleUpdateSoItem(index, 'tradeName', e.target.value)}
                    />
                    <Input
                      label="HSN Code"
                      value={item.hsn}
                      onChange={(e) => handleUpdateSoItem(index, 'hsn', e.target.value)}
                    />
                    <Input
                      label="Specification Guarantee"
                      value={item.spec}
                      onChange={(e) => handleUpdateSoItem(index, 'spec', e.target.value)}
                    />
                    <Select
                      label="Packaging"
                      value={item.packaging}
                      onChange={(e) => handleUpdateSoItem(index, 'packaging', e.target.value)}
                      options={[
                        { value: 'Bulk Road Tanker', label: 'Bulk Road Tanker (Insulated)' },
                        { value: '250 kg Drum', label: '250 kg HM-HDPE Drums' },
                        { value: '1000L IBC Tote', label: '1000L Composite IBC Tote' },
                        { value: '25 kg Bags on Pallets', label: '25 kg Bags on Pallets' },
                      ]}
                    />
                    <Select
                      label="Container Type"
                      value={item.containerType}
                      onChange={(e) => handleUpdateSoItem(index, 'containerType', e.target.value)}
                      options={[
                        { value: '20ft ISO Tank / FCL', label: '20ft ISO Tank / FCL' },
                        { value: '20ft FCL Box Container', label: '20ft FCL Box Container' },
                        { value: 'Road Tanker (3-Axle)', label: 'Road Tanker (3-Axle)' },
                        { value: '40ft High Cube Container', label: '40ft High Cube Container' },
                      ]}
                    />
                    <Input
                      label="Loading Capacity"
                      value={item.loadingCapacity}
                      onChange={(e) => handleUpdateSoItem(index, 'loadingCapacity', e.target.value)}
                    />
                    <Input
                      label="Quantity (MT)"
                      type="number"
                      value={item.quantity}
                      onChange={(e) => handleUpdateSoItem(index, 'quantity', e.target.value)}
                    />
                    <Input
                      label="Unit Rate / MT (INR)"
                      type="number"
                      value={item.unitPrice}
                      onChange={(e) => handleUpdateSoItem(index, 'unitPrice', e.target.value)}
                    />
                  </div>

                  <div style={{ textAlign: 'right', fontSize: '0.6875rem', color: 'var(--color-primary-dark)', fontWeight: 700 }}>
                    Item Line Total: ₹{((Number(item.quantity) || 0) * (Number(item.unitPrice) || 0)).toLocaleString()}
                  </div>
                </div>
              ))}
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
              <strong>Total Sales Order Value ({soItems.length} Products in Grid):</strong>
              <strong style={{ fontSize: '1rem', color: 'var(--color-primary-dark)' }}>
                ₹{soItems.reduce((acc, it) => acc + (Number(it.quantity || 0) * Number(it.unitPrice || 0)), 0).toLocaleString()}
              </strong>
            </div>
            <div style={{ color: 'var(--color-text-secondary)', fontSize: '0.6875rem' }}>
              ✓ Default Bank Remittance: HDFC Bank Dahej (A/C: 002105001892, IFSC: HDFC0000021) • Intermediary: SCBLINBB<br />
              ✓ On submission, order routes to HOD for sign-off and auto-generates Logistics Inward Work Order.
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default SalesPage;
