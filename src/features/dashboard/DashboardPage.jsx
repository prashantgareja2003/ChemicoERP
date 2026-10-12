import { useState, useMemo } from 'react';
import PageHeader from '../../components/layout/PageHeader';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import DataTable from '../../components/ui/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import ApprovalModal from '../../components/common/ApprovalModal';
import GatePassModal from '../../components/common/GatePassModal';
import DocumentPdfModal from '../../components/common/DocumentPdfModal';
import DashboardCharts from '../../components/common/DashboardCharts';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import { useErp } from '../../hooks/useErp';
import {
  Plus,
  Download,
  Filter,
  TrendingUp,
  ShoppingBag,
  Factory,
  Clock,
  ArrowUpRight,
  ShieldAlert,
  LayoutDashboard,
  ShoppingCart,
  Boxes,
  FlaskConical,
  Truck,
  Receipt,
  CheckCircle2,
  FileText,
  Printer,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

export function DashboardPage() {
  const {
    currentUser,
    quotations,
    salesOrders,
    purchaseOrders,
    qcRecords,
    logisticsTasks,
    products,
    customers,
    createQuotation,
    convertQuotationToSalesOrder,
    notify,
  } = useErp();

  const [userSelectedTab, setUserSelectedTab] = useState(null);
  const [isGatePassModalOpen, setIsGatePassModalOpen] = useState(false);
  const [selectedGatePassConsignment, setSelectedGatePassConsignment] = useState(null);
  const [selectedQuoteForPdf, setSelectedQuoteForPdf] = useState(null);
  const [quoteFilter, setQuoteFilter] = useState('all');

  // Default dashboard cleanly derived from active stakeholder role
  const defaultTabForRole = useMemo(() => {
    const role = currentUser?.role;
    if (role === 'Sales') return 'Sales';
    if (role === 'Prod' || role === 'QC/QA') return 'Production & Quality';
    if (role === 'Logistics') return 'Dispatch';
    if (role === 'Finance') return 'Finance';
    if (role === 'HOD') return 'Approvals';
    return 'Management';
  }, [currentUser?.role]);

  const activeDashboard = userSelectedTab ?? defaultTabForRole;
  const setActiveDashboard = setUserSelectedTab;

  // Universal Approval Modal
  const [approvalModalState, setApprovalModalState] = useState({
    isOpen: false,
    targetType: null,
    record: null,
  });

  // Create Quotation Modal
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [quoteForm, setQuoteForm] = useState({
    customerId: '',
    customerName: '',
    productId: '',
    productName: '',
    qty: 40,
    unitPrice: 96000,
    packaging: '250 kg Drum / Bulk Tanker',
    containerType: '20ft FCL / Road Tanker',
    loadingCapacity: '40 MT',
    leadTime: '5-7 Days',
    deliverySchedule: 'Part delivery (20 MT + 20 MT)',
    paymentTerms: '30 Days Net',
    offerValidity: '15 Days',
  });

  // Drilldown Modal
  const [drilldownData, setDrilldownData] = useState(null);

  // Dynamic Metrics calculations
  const pendingApprovalsList = useMemo(() => {
    const list = [];
    quotations.filter((q) => q.status === 'awaiting approval').forEach((q) => {
      list.push({
        id: q.id,
        type: 'quotation',
        tag: 'SALES QUOTE',
        time: 'Today',
        title: `Quotation Approval: ${q.customerName}`,
        description: `${q.items[0]?.productName || 'Chemicals'} (${q.items[0]?.qty || 20} MT). Awaiting HOD commercial review.`,
        ref: q.id,
        record: q,
      });
    });
    purchaseOrders.filter((p) => p.status === 'awaiting approval').forEach((p) => {
      list.push({
        id: p.id,
        type: 'purchase_order',
        tag: 'RAW MATERIAL PO',
        time: 'Yesterday',
        title: `Bulk ${p.material}`,
        description: `${p.qty} ${p.uom} from ${p.supplierName}. Value ₹${(p.totalWithTax || p.totalValue).toLocaleString()}.`,
        ref: p.id,
        record: p,
      });
    });
    qcRecords.filter((qc) => qc.status === 'failed').forEach((qc) => {
      list.push({
        id: qc.id,
        type: 'qc_failed',
        tag: 'CRITICAL • QC LAB',
        time: '09:42 AM',
        title: `QC Batch Release: ${qc.product}`,
        description: `Failed on Iodine Value. Batch #${qc.batchNo} (${qc.quantityKg / 1000} MT) awaiting disposition sign-off.`,
        ref: qc.id,
        record: qc,
      });
    });
    return list;
  }, [quotations, purchaseOrders, qcRecords]);

  // Orders table data matching screenshot
  const displayOrders = useMemo(() => {
    return [
      {
        id: 'SO-2026-8941',
        client: 'Godrej Consumer Products Ltd',
        product: 'Refined Glycerin',
        spec: '99.7% IP/USP Grade',
        volume: '40 MT',
        value: '₹38,40,000',
        status: 'In Production',
        dispatch: '12 Oct 2026',
      },
      {
        id: 'SO-2026-8940',
        client: 'Hindustan Unilever Ltd (HUL)',
        product: 'Triple Pressed Stearic Acid',
        spec: 'Flakes • Cosmetic Spec',
        volume: '60 MT',
        value: '₹64,20,000',
        status: 'Approved',
        dispatch: '14 Oct 2026',
      },
      {
        id: 'SO-2026-8939',
        client: 'Pidilite Industries Ltd',
        product: 'Distilled Oleic Acid',
        spec: 'Special Grade 90+',
        volume: '24 MT',
        value: '₹26,88,000',
        status: 'Dispatched',
        dispatch: 'Today',
      },
    ];
  }, []);

  // CSV / Excel export helper
  const handleExportCSV = (tableTitle, dataRows) => {
    if (!dataRows || dataRows.length === 0) return;
    const headers = Object.keys(dataRows[0]).join(',');
    const rows = dataRows.map((r) => Object.values(r).map((v) => `"${v}"`).join(',')).join('\n');
    const blob = new Blob([`${headers}\n${rows}`], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${tableTitle.toLowerCase().replace(/\s+/g, '_')}_export.csv`;
    a.click();
    notify(`Exported ${tableTitle} to Excel/CSV`);
  };

  const handleCreateQuote = (e) => {
    e.preventDefault();
    if (!quoteForm.customerId || !quoteForm.productId) {
      notify('Please select both Customer and Product from the masters.', 'error');
      return;
    }

    const selectedCust = customers.find((c) => c.id === quoteForm.customerId);
    const selectedProd = products.find((p) => p.id === quoteForm.productId);

    createQuotation({
      customerId: selectedCust.id,
      customerName: selectedCust.companyName,
      items: [
        {
          srNo: 1,
          productId: selectedProd.id,
          productName: selectedProd.productName,
          tradeName: selectedProd.productCode,
          packaging: quoteForm.packaging,
          unitPrice: Number(quoteForm.unitPrice),
          qty: Number(quoteForm.qty),
          uom: selectedProd.uom || 'MT',
        },
      ],
      containerType: quoteForm.containerType,
      loadingCapacity: quoteForm.loadingCapacity,
      leadTime: quoteForm.leadTime,
      deliverySchedule: quoteForm.deliverySchedule,
      paymentTerms: quoteForm.paymentTerms,
      offerValidity: quoteForm.offerValidity,
    });

    setIsQuoteModalOpen(false);
  };

  // Orders Table Columns matching screenshot
  const orderColumns = [
    {
      key: 'id',
      title: 'ORDER ID & CLIENT',
      render: (_, row) => (
        <div>
          <span
            style={{
              display: 'inline-block',
              fontSize: '0.6875rem',
              fontWeight: 700,
              color: 'var(--color-primary-dark)',
              background: 'var(--color-primary-light)',
              padding: '1px 6px',
              borderRadius: '4px',
              fontFamily: 'monospace',
              letterSpacing: '-0.01em',
              marginBottom: 2,
            }}
          >
            {row.id}
          </span>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#0F172A' }}>
            {row.client}
          </div>
        </div>
      ),
    },
    {
      key: 'product',
      title: 'CHEMICAL GRADE',
      render: (_, row) => (
        <div>
          <div style={{ fontWeight: 600, color: '#0F172A' }}>{row.product}</div>
          <div style={{ fontSize: '0.6875rem', color: '#64748B' }}>{row.spec}</div>
        </div>
      ),
    },
    {
      key: 'volume',
      title: 'VOLUME',
      align: 'right',
      render: (val) => <span style={{ fontWeight: 600, color: '#334155' }}>{val}</span>,
    },
    {
      key: 'value',
      title: 'VALUE',
      align: 'right',
      render: (val) => <strong style={{ color: '#0F172A' }}>{val}</strong>,
    },
    {
      key: 'status',
      title: 'STATUS',
      render: (val) => <StatusBadge status={val} />,
    },
    {
      key: 'dispatch',
      title: 'DISPATCH',
      align: 'right',
      render: (val) => (
        <span
          style={{
            fontSize: '0.6875rem',
            color: val === 'Today' ? '#059669' : '#64748B',
            fontWeight: val === 'Today' ? 700 : 500,
            background: val === 'Today' ? '#ECFDF5' : 'transparent',
            padding: val === 'Today' ? '1px 6px' : '0',
            borderRadius: val === 'Today' ? '4px' : '0',
          }}
        >
          {val}
        </span>
      ),
    },
    {
      key: 'actions',
      title: 'ACTIONS',
      align: 'right',
      render: (_, row) => (
        <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end', alignItems: 'center' }}>
          {row.status === 'Dispatched' ? (
            <Button
              size="sm"
              variant="secondary"
              icon={<Printer size={12} />}
              onClick={() => {
                setSelectedGatePassConsignment({
                  id: `GP-${row.id?.replace(/[^0-9]/g, '') || '26-8921'}`,
                  soNumber: row.id,
                  deliveryId: 'D1',
                  client: row.client,
                  consignee: `${row.client}, Plant Unit #2, Vapi, Gujarat`,
                  product: row.product,
                  spec: row.spec,
                  volume: row.volume,
                  weightMT: parseInt(row.volume) || 24,
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
                  gateNo: 'Security Gate #2 (Tanker Bay)',
                  ewayBill: '2410 8829 4410',
                  invoiceNo: 'INV-2026-1082',
                });
                setIsGatePassModalOpen(true);
              }}
            >
              Gate Pass
            </Button>
          ) : (
            <span style={{ fontSize: '0.6875rem', color: '#94A3B8' }}>—</span>
          )}
        </div>
      ),
    },
  ];

  // Quotations Dashboard Table Columns
  const quotationDashboardColumns = [
    {
      key: 'id',
      title: 'QUOTATION #',
      render: (val) => (
        <span
          style={{
            fontFamily: 'monospace',
            fontWeight: 700,
            color: 'var(--color-primary-dark)',
            background: 'var(--color-primary-light)',
            padding: '2px 6px',
            borderRadius: 4,
          }}
        >
          {val}
        </span>
      ),
    },
    {
      key: 'client',
      title: 'CLIENT / CONSIGNEE',
      render: (_, row) => (
        <div>
          <strong style={{ color: '#0F172A', fontSize: '0.8125rem' }}>
            {row.customerName || row.client || '—'}
          </strong>
          <div style={{ fontSize: '0.6875rem', color: '#64748B' }}>
            {row.consignee || 'Consignee Plant Delivery'}
          </div>
        </div>
      ),
    },
    {
      key: 'product',
      title: 'CHEMICAL GRADE',
      render: (_, row) => {
        const item = row.items?.[0];
        return (
          <div>
            <div style={{ fontWeight: 600, color: '#0F172A' }}>
              {item?.productName || row.product || 'Refined Chemical Grade'}
            </div>
            <div style={{ fontSize: '0.6875rem', color: '#64748B' }}>
              {item?.spec || row.spec || 'Standard Guaranteed Spec'}
            </div>
          </div>
        );
      },
    },
    {
      key: 'volume',
      title: 'VOLUME',
      align: 'right',
      render: (_, row) => {
        const item = row.items?.[0];
        const qty = item?.qty || row.qty || row.volume || 20;
        return <strong style={{ color: '#334155' }}>{qty} MT</strong>;
      },
    },
    {
      key: 'value',
      title: 'TOTAL VALUE',
      align: 'right',
      render: (_, row) => {
        const val =
          row.totalValue ||
          (Number(row.qty || row.items?.[0]?.qty || 1) *
            Number(row.unitPrice || row.items?.[0]?.unitPrice || 0));
        return <strong style={{ color: '#065F46' }}>₹{Number(val).toLocaleString()}</strong>;
      },
    },
    {
      key: 'status',
      title: 'STATUS',
      render: (val) => <StatusBadge status={val} />,
    },
    {
      key: 'actions',
      title: 'ACTIONS',
      align: 'right',
      render: (_, row) => (
        <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end', alignItems: 'center' }}>
          <Button
            size="sm"
            variant="secondary"
            icon={<Printer size={13} />}
            onClick={() => setSelectedQuoteForPdf(row)}
          >
            Download / Print PDF
          </Button>

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

          {row.status === 'awaiting approval' && (
            <Button
              size="sm"
              variant="primary"
              icon={<CheckCircle2 size={13} />}
              onClick={() =>
                setApprovalModalState({
                  isOpen: true,
                  targetType: 'quotation',
                  record: row,
                })
              }
            >
              HOD Sign-off
            </Button>
          )}
        </div>
      ),
    },
  ];

  const filteredQuotationsList = useMemo(() => {
    if (quoteFilter === 'all') return quotations;
    return quotations.filter((q) => q.status === quoteFilter);
  }, [quotations, quoteFilter]);

  return (
    <div>
      {/* Page Header with Screenshot Action Buttons */}
      <PageHeader
        title="Plant Throughput & Dispatch Ops"
        description="Real-time reactor performance and bulk chemical dispatch monitoring."
        actions={
          <>
            <Button
              variant="secondary"
              icon={<Printer size={15} />}
              onClick={() => setIsGatePassModalOpen(true)}
            >
              Print Gate Pass
            </Button>
            <Button
              variant="primary"
              icon={<Plus size={15} />}
              onClick={() => setIsQuoteModalOpen(true)}
            >
              Create Quotation
            </Button>
          </>
        }
      />

      {/* 9-Dashboard Specialized Tabs with Icons & Colors including Quotations */}
      <div className="erp-dash-pill-group">
        {[
          { key: 'Management', label: 'Management', icon: LayoutDashboard, color: '#2563EB' },
          { key: 'Sales', label: 'Sales Orders', icon: ShoppingCart, color: '#0D9488' },
          { key: 'Quotations', label: 'Quotations', icon: FileText, color: '#7C3AED' },
          { key: 'Stock', label: 'Stock & Inventory', icon: Boxes, color: '#4F46E5' },
          { key: 'Production & Quality', label: 'Production & QC', icon: Factory, color: '#EA580C' },
          { key: 'Purchase', label: 'Purchase & Inward', icon: ShoppingBag, color: '#D97706' },
          { key: 'Dispatch', label: 'Tanker Dispatch', icon: Truck, color: '#0284C7' },
          { key: 'Finance', label: 'Finance & Accounts', icon: Receipt, color: '#059669' },
          { key: 'Approvals', label: 'Approvals Queue', icon: CheckCircle2, color: '#16A34A' },
        ].map((tab) => {
          const isActive = activeDashboard === tab.key;
          const IconComponent = tab.icon;
          return (
            <button
              key={tab.key}
              type="button"
              className={`erp-dash-pill ${isActive ? 'active' : ''}`}
              onClick={() => setActiveDashboard(tab.key)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: isActive ? '#34D399' : tab.color,
                  transition: 'transform 0.15s ease',
                }}
              >
                <IconComponent size={13} strokeWidth={2.2} />
              </span>
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Conditional Dashboard View: Quotations Dashboard vs Standard Operations Deck */}
      {activeDashboard === 'Quotations' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {/* 4 Clean Metric Cards for Quotations */}
          <div className="erp-grid-kpi">
            <div className="erp-metric-card-clean">
              <div className="erp-metric-top">
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 26,
                      height: 26,
                      borderRadius: 6,
                      background: '#F3E8FF',
                      color: '#7C3AED',
                      border: '1px solid #DDD6FE',
                    }}
                  >
                    <FileText size={14} strokeWidth={2.4} />
                  </span>
                  <span className="erp-metric-label-clean">Total Quotations</span>
                </div>
                <span className="erp-metric-pill erp-metric-pill-blue">SOL/Q Series</span>
              </div>
              <div className="erp-metric-value-clean">{quotations.length} Bids</div>
              <div className="erp-metric-subline">
                <span>Active Commercial Offers</span>
                <span style={{ color: '#7C3AED', fontWeight: 600 }}>Dahej Plant</span>
              </div>
            </div>

            <div
              className="erp-metric-card-clean"
              style={{ border: '1.5px solid #10B981', background: '#F0FDF4' }}
            >
              <div className="erp-metric-top">
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 26,
                      height: 26,
                      borderRadius: 6,
                      background: '#DCFCE7',
                      color: '#059669',
                      border: '1px solid #86EFAC',
                    }}
                  >
                    <CheckCircle2 size={14} strokeWidth={2.4} />
                  </span>
                  <span className="erp-metric-label-clean" style={{ color: '#065F46' }}>
                    Approved Quotations
                  </span>
                </div>
                <span className="erp-metric-pill erp-metric-pill-green">PDF Ready</span>
              </div>
              <div className="erp-metric-value-clean" style={{ color: '#047857' }}>
                {quotations.filter((q) => q.status === 'approved').length} Approved
              </div>
              <div className="erp-metric-subline">
                <span style={{ color: '#059669', fontWeight: 600 }}>
                  Ready for PDF Download & 1-Click SO Conversion
                </span>
              </div>
            </div>

            <div className="erp-metric-card-clean">
              <div className="erp-metric-top">
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 26,
                      height: 26,
                      borderRadius: 6,
                      background: '#FEF2F2',
                      color: '#D97706',
                      border: '1px solid #FDE68A',
                    }}
                  >
                    <Clock size={14} strokeWidth={2.4} />
                  </span>
                  <span className="erp-metric-label-clean">Awaiting Sign-Off</span>
                </div>
                <span className="erp-metric-pill erp-metric-pill-orange">HOD Action</span>
              </div>
              <div className="erp-metric-value-clean">
                {quotations.filter((q) => q.status === 'awaiting approval').length} Pending
              </div>
              <div className="erp-metric-subline">
                <span>Requires Commercial Review</span>
              </div>
            </div>

            <div className="erp-metric-card-clean">
              <div className="erp-metric-top">
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 26,
                      height: 26,
                      borderRadius: 6,
                      background: '#EFF6FF',
                      color: '#2563EB',
                      border: '1px solid #BFDBFE',
                    }}
                  >
                    <TrendingUp size={14} strokeWidth={2.4} />
                  </span>
                  <span className="erp-metric-label-clean">Pipeline Value</span>
                </div>
                <span className="erp-metric-pill erp-metric-pill-green">+18.5%</span>
              </div>
              <div className="erp-metric-value-clean">
                ₹{quotations
                  .reduce(
                    (sum, q) =>
                      sum +
                      (Number(q.totalValue) ||
                        Number(q.qty || q.items?.[0]?.qty || 1) *
                          Number(q.unitPrice || q.items?.[0]?.unitPrice || 0)),
                    0
                  )
                  .toLocaleString()}
              </div>
              <div className="erp-metric-subline">
                <span>Total Active Quotes Value</span>
              </div>
            </div>
          </div>

          {/* Quotations Main Card */}
          <Card
            title="Commercial Chemical Quotations & Contract Bids"
            subtitle="Download authorized PDF copies of HOD-approved quotes, or convert them directly to Production Sales Orders."
            actions={
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: 4 }}>
                  {[
                    { key: 'all', label: `All (${quotations.length})` },
                    { key: 'approved', label: `Approved (${quotations.filter((q) => q.status === 'approved').length})` },
                    { key: 'awaiting approval', label: `Awaiting (${quotations.filter((q) => q.status === 'awaiting approval').length})` },
                    { key: 'converted', label: `Converted (${quotations.filter((q) => q.status === 'converted').length})` },
                  ].map((filterTab) => (
                    <button
                      key={filterTab.key}
                      type="button"
                      className={`erp-dash-pill ${quoteFilter === filterTab.key ? 'active' : ''}`}
                      onClick={() => setQuoteFilter(filterTab.key)}
                      style={{ fontSize: '0.6875rem', padding: '3px 8px' }}
                    >
                      {filterTab.label}
                    </button>
                  ))}
                </div>
                <Button
                  size="sm"
                  variant="primary"
                  icon={<Plus size={13} />}
                  onClick={() => setIsQuoteModalOpen(true)}
                >
                  + New Quotation
                </Button>
              </div>
            }
            noPadding
          >
            <DataTable
              columns={quotationDashboardColumns}
              data={filteredQuotationsList}
              keyField="id"
            />
          </Card>
        </div>
      ) : (
        <>
          {/* 4 Clean Metric Cards with Colorful Icons */}
      <div className="erp-grid-kpi">
        {/* Metric 1: Total Sales */}
        <div
          className="erp-metric-card-clean"
          style={{ cursor: 'pointer' }}
          onClick={() =>
            setDrilldownData({
              title: 'Total Sales (MTD) Breakdown',
              records: salesOrders,
              type: 'sales',
            })
          }
        >
          <div className="erp-metric-top">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 26,
                  height: 26,
                  borderRadius: 6,
                  background: '#ECFDF5',
                  color: '#059669',
                  border: '1px solid #A7F3D0',
                }}
              >
                <TrendingUp size={14} strokeWidth={2.4} />
              </span>
              <span className="erp-metric-label-clean">Total Sales (MTD)</span>
            </div>
            <span className="erp-metric-pill erp-metric-pill-green">+14.2%</span>
          </div>
          <div className="erp-metric-value-clean">₹8.42 Cr</div>
          <div className="erp-metric-subline">
            <span>2,840 MT Shipped</span>
            <span style={{ color: 'var(--color-text-muted)' }}>Target: 3,200 MT</span>
          </div>
        </div>

        {/* Metric 2: Active Backlog */}
        <div
          className="erp-metric-card-clean"
          style={{ cursor: 'pointer' }}
          onClick={() =>
            setDrilldownData({
              title: 'Active Order Backlog',
              records: salesOrders.filter((s) => s.status !== 'completed'),
              type: 'sales',
            })
          }
        >
          <div className="erp-metric-top">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 26,
                  height: 26,
                  borderRadius: 6,
                  background: '#EFF6FF',
                  color: '#2563EB',
                  border: '1px solid #BFDBFE',
                }}
              >
                <ShoppingBag size={14} strokeWidth={2.4} />
              </span>
              <span className="erp-metric-label-clean">Active Backlog</span>
            </div>
            <span className="erp-metric-pill erp-metric-pill-blue">4 High Priority</span>
          </div>
          <div className="erp-metric-value-clean">18 Orders</div>
          <div className="erp-metric-subline">
            <span>1,120 MT Committed</span>
            <span style={{ color: 'var(--color-text-muted)' }}>Avg Lead: 4.2d</span>
          </div>
        </div>

        {/* Metric 3: Reactor Yield */}
        <div
          className="erp-metric-card-clean"
          style={{ cursor: 'pointer' }}
          onClick={() =>
            setDrilldownData({
              title: 'Plant Reactor Units & OEE Yield',
              records: [
                { unit: 'Reactor R-101 (Fractionation)', status: 'Active Run', yield: '97.2%' },
                { unit: 'Reactor R-102 (Esterification)', status: 'Active Run', yield: '96.8%' },
                { unit: 'Reactor R-103 (Autoclave)', status: 'Active Run', yield: '98.1%' },
                { unit: 'Reactor R-104 (Vacuum Gly)', status: 'Active Run', yield: '97.4%' },
                { unit: 'Reactor R-105 (Acid Split)', status: 'CIP Cleaning', yield: 'Standby' },
              ],
              type: 'reactors',
            })
          }
        >
          <div className="erp-metric-top">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 26,
                  height: 26,
                  borderRadius: 6,
                  background: '#FFF7ED',
                  color: '#EA580C',
                  border: '1px solid #FED7AA',
                }}
              >
                <Factory size={14} strokeWidth={2.4} />
              </span>
              <span className="erp-metric-label-clean">Reactor Yield</span>
            </div>
            <span className="erp-metric-pill erp-metric-pill-blue">94.8% OEE</span>
          </div>
          <div className="erp-metric-value-clean">4 / 5 Units</div>
          <div className="erp-metric-subline">
            <span>142 MT Daily Output</span>
            <span style={{ color: 'var(--color-text-muted)' }}>Unit #5: CIP</span>
          </div>
        </div>

        {/* Metric 4: Sign-off Queue */}
        <div
          className="erp-metric-card-clean"
          style={{ cursor: 'pointer' }}
          onClick={() =>
            setDrilldownData({
              title: 'Pending Approvals Queue',
              records: pendingApprovalsList,
              type: 'approvals',
            })
          }
        >
          <div className="erp-metric-top">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 26,
                  height: 26,
                  borderRadius: 6,
                  background: '#FEF2F2',
                  color: '#DC2626',
                  border: '1px solid #FECACA',
                }}
              >
                <ShieldAlert size={14} strokeWidth={2.4} />
              </span>
              <span className="erp-metric-label-clean">Sign-Off Queue</span>
            </div>
            <span className="erp-metric-pill erp-metric-pill-orange">Action Required</span>
          </div>
          <div className="erp-metric-value-clean">
            {pendingApprovalsList.length} Pending
          </div>
          <div className="erp-metric-subline">
            <span>Requires Sign-off</span>
            <span style={{ color: 'var(--color-error)', fontWeight: 600 }}>1 Critical QC</span>
          </div>
        </div>
      </div>

      {/* Admin Order Lifecycle Phase Visibility (Production / Transportation / Payment) */}
      <div
        style={{
          background: '#FFFFFF',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-md)',
          padding: '12px 16px',
          marginBottom: 'var(--space-4)',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <strong style={{ fontSize: '0.8125rem', color: 'var(--color-primary-dark)', display: 'flex', alignItems: 'center', gap: 6 }}>
            <LayoutDashboard size={14} /> Admin Order Lifecycle Phase Monitor
          </strong>
          <span style={{ fontSize: '0.6875rem', color: 'var(--color-text-secondary)' }}>
            Orders Phase Visibility: Production ➔ Transportation ➔ Payment ➔ Completed
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
          {/* Phase 1: Production */}
          <div
            style={{
              padding: '10px 12px',
              borderRadius: 'var(--radius-sm)',
              background: '#FFF7ED',
              border: '1px solid #FFEDD5',
              cursor: 'pointer',
            }}
            onClick={() =>
              setDrilldownData({
                title: 'Orders in Production Phase',
                records: salesOrders.filter((s) => s.status === 'in production'),
                type: 'sales',
              })
            }
          >
            <div style={{ fontSize: '0.6875rem', fontWeight: 600, color: '#C2410C', display: 'flex', alignItems: 'center', gap: 5 }}>
              <Factory size={13} /> In Production Phase
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#9A3412', marginTop: 2 }}>
              {salesOrders.filter((s) => s.status === 'in production').length} Orders
            </div>
            <div style={{ fontSize: '0.625rem', color: '#EA580C' }}>
              Reactor synthesis & yield
            </div>
          </div>

          {/* Phase 2: Transportation / Dispatch */}
          <div
            style={{
              padding: '10px 12px',
              borderRadius: 'var(--radius-sm)',
              background: '#F0F9FF',
              border: '1px solid #E0F2FE',
              cursor: 'pointer',
            }}
            onClick={() =>
              setDrilldownData({
                title: 'Orders in Transportation / Dispatch Phase',
                records: salesOrders.filter((s) => s.status === 'part-delivered' || s.status === 'delivered'),
                type: 'sales',
              })
            }
          >
            <div style={{ fontSize: '0.6875rem', fontWeight: 600, color: '#0369A1', display: 'flex', alignItems: 'center', gap: 5 }}>
              <Truck size={13} /> In Transportation Phase
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#075985', marginTop: 2 }}>
              {salesOrders.filter((s) => s.status === 'part-delivered' || s.status === 'delivered').length} Orders
            </div>
            <div style={{ fontSize: '0.625rem', color: '#0284C7' }}>
              Tankers dispatched & tracking
            </div>
          </div>

          {/* Phase 3: Payment & Invoicing */}
          <div
            style={{
              padding: '10px 12px',
              borderRadius: 'var(--radius-sm)',
              background: '#FAF5FF',
              border: '1px solid #F3E8FF',
              cursor: 'pointer',
            }}
            onClick={() =>
              setDrilldownData({
                title: 'Orders in Payment & Invoicing Phase',
                records: salesOrders.filter((s) => s.status === 'invoiced' || (s.status !== 'completed' && s.status !== 'open' && s.status !== 'in production')),
                type: 'sales',
              })
            }
          >
            <div style={{ fontSize: '0.6875rem', fontWeight: 600, color: '#7E22CE', display: 'flex', alignItems: 'center', gap: 5 }}>
              <Receipt size={13} /> In Payment Phase
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#6B21A8', marginTop: 2 }}>
              {salesOrders.filter((s) => s.status === 'invoiced' || (s.status !== 'completed' && s.status !== 'open' && s.status !== 'in production')).length} Orders
            </div>
            <div style={{ fontSize: '0.625rem', color: '#9333EA' }}>
              Pending ≥95% settlement
            </div>
          </div>

          {/* Phase 4: Completed */}
          <div
            style={{
              padding: '10px 12px',
              borderRadius: 'var(--radius-sm)',
              background: '#F0FDF4',
              border: '1px solid #DCFCE7',
              cursor: 'pointer',
            }}
            onClick={() =>
              setDrilldownData({
                title: 'Settled & Completed Orders',
                records: salesOrders.filter((s) => s.status === 'completed'),
                type: 'sales',
              })
            }
          >
            <div style={{ fontSize: '0.6875rem', fontWeight: 600, color: '#15803D', display: 'flex', alignItems: 'center', gap: 5 }}>
              <CheckCircle2 size={13} /> SO Completed (≥95%)
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#166534', marginTop: 2 }}>
              {salesOrders.filter((s) => s.status === 'completed').length} Orders
            </div>
            <div style={{ fontSize: '0.625rem', color: '#16A34A' }}>
              Fully closed & settled
            </div>
          </div>
        </div>
      </div>

      {/* Chemical Product Share & Order Phase Analytics (Pie / Donut Charts) */}
      <DashboardCharts salesOrders={salesOrders} quotations={quotations} />

      {/* Main Grid: Orders & Approval Queue matching screenshot */}
      <div className="erp-grid-2col">
        {/* Left: Recent Sales & Dispatch Execution Table */}
        <Card
          title="Recent Sales & Dispatch Execution"
          subtitle="Real-time tracking from synthesis to tanker loading"
          actions={
            <div style={{ display: 'flex', gap: 6 }}>
              <Button
                size="sm"
                variant="secondary"
                icon={<Filter size={13} />}
                onClick={() => notify('Filter drawer active')}
              >
                Filter
              </Button>
              <Button
                size="sm"
                variant="secondary"
                icon={<Download size={13} />}
                onClick={() => handleExportCSV('Recent_Sales_Orders', displayOrders)}
              >
                Export
              </Button>
            </div>
          }
          noPadding
        >
          <DataTable columns={orderColumns} data={displayOrders} keyField="id" />
        </Card>

        {/* Right: Pending Approvals Queue matching screenshot */}
        <Card
          title="Pending Approvals"
          subtitle="Sign-off and gate control queue"
          actions={
            <button
              type="button"
              onClick={() =>
                setDrilldownData({
                  title: 'All Sign-off Authorizations',
                  records: pendingApprovalsList,
                  type: 'approvals',
                })
              }
              style={{
                fontSize: 'var(--font-size-xs)',
                fontWeight: 600,
                color: 'var(--color-primary-dark)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Review All
            </button>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {/* Item 1: Critical QC Lab Release */}
            <div
              style={{
                padding: '10px 12px',
                borderRadius: '6px',
                border: '1px solid #E2E8F0',
                borderLeft: '3px solid var(--color-error)',
                background: '#FAFAFB',
                display: 'flex',
                flexDirection: 'column',
                gap: 4,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span
                  style={{
                    fontSize: '0.625rem',
                    fontWeight: 700,
                    letterSpacing: '0.04em',
                    color: 'var(--color-error)',
                    background: 'var(--color-error-bg)',
                    padding: '2px 6px',
                    borderRadius: 'var(--radius-pill)',
                  }}
                >
                  CRITICAL • QC LAB
                </span>
                <span style={{ fontSize: '0.6875rem', color: 'var(--color-text-secondary)' }}>
                  09:42 AM
                </span>
              </div>

              <div style={{ fontWeight: 700, fontSize: '0.75rem', color: '#0F172A' }}>
                QC Batch Release: Refined Glycerin
              </div>

              <p style={{ fontSize: '0.6875rem', color: '#64748B', margin: 0, lineHeight: 1.35 }}>
                99.7% USP test passed (Color &lt;10 APHA, Heavy metals &lt;5ppm). 40 MT batch awaiting dispatch sign-off.
              </p>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 2 }}>
                <span style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)' }}>
                  Ref: <strong style={{ color: '#475569' }}>QC-26-881</strong>
                </span>

                <Button
                  size="sm"
                  variant="primary"
                  onClick={() =>
                    setApprovalModalState({
                      isOpen: true,
                      targetType: 'qc_failed',
                      record: qcRecords[0],
                    })
                  }
                  style={{ height: 26, fontSize: '0.6875rem', padding: '0 8px' }}
                >
                  Sign & Release
                </Button>
              </div>
            </div>

            {/* Item 2: Raw Material PO Approval */}
            <div
              style={{
                padding: '10px 12px',
                borderRadius: '6px',
                border: '1px solid #E2E8F0',
                borderLeft: '3px solid var(--color-primary-dark)',
                background: '#FAFAFB',
                display: 'flex',
                flexDirection: 'column',
                gap: 4,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span
                  style={{
                    fontSize: '0.625rem',
                    fontWeight: 700,
                    letterSpacing: '0.04em',
                    color: 'var(--color-primary-dark)',
                    background: 'var(--color-primary-light)',
                    padding: '2px 6px',
                    borderRadius: 'var(--radius-pill)',
                  }}
                >
                  RAW MATERIAL PO
                </span>
                <span style={{ fontSize: '0.6875rem', color: 'var(--color-text-secondary)' }}>
                  Yesterday
                </span>
              </div>

              <div style={{ fontWeight: 700, fontSize: '0.75rem', color: '#0F172A' }}>
                Bulk Caustic Soda Lye 48%
              </div>

              <p style={{ fontSize: '0.6875rem', color: '#64748B', margin: 0, lineHeight: 1.35 }}>
                120 MT from Gujarat Alkalies. Value ₹34,80,000.
              </p>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 2 }}>
                <span style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)' }}>
                  Ref: <strong style={{ color: '#475569' }}>PO-2026-4412</strong>
                </span>

                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() =>
                    setApprovalModalState({
                      isOpen: true,
                      targetType: 'purchase_order',
                      record: purchaseOrders[0],
                    })
                  }
                  style={{ height: 26, fontSize: '0.6875rem', padding: '0 8px' }}
                >
                  Approve PO
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>
        </>
      )}

      {/* Universal Approval Modal */}
      <ApprovalModal
        isOpen={approvalModalState.isOpen}
        onClose={() => setApprovalModalState({ isOpen: false, targetType: null, record: null })}
        targetType={approvalModalState.targetType}
        record={approvalModalState.record}
      />

      {/* Create Chemical Quotation Modal */}
      <Modal
        isOpen={isQuoteModalOpen}
        onClose={() => setIsQuoteModalOpen(false)}
        title="Create Chemical Sales Quotation"
        description="Auto-generates SOL/Q/XXXX reference and routes for mandatory HOD review."
        size="md"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsQuoteModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleCreateQuote}>
              Submit for HOD Approval
            </Button>
          </>
        }
      >
        <form onSubmit={handleCreateQuote} className="erp-form-grid">
          <div className="erp-col-span-2">
            <Select
              label="Select Customer Account"
              required
              value={quoteForm.customerId}
              onChange={(e) => setQuoteForm({ ...quoteForm, customerId: e.target.value })}
              options={customers.map((c) => ({ value: c.id, label: `${c.companyName} (${c.gstin})` }))}
            />
          </div>

          <Select
            label="Product Grade (from Master)"
            required
            value={quoteForm.productId}
            onChange={(e) => {
              const prod = products.find((p) => p.id === e.target.value);
              setQuoteForm({
                ...quoteForm,
                productId: e.target.value,
                unitPrice: prod?.rate || quoteForm.unitPrice,
                packaging: prod?.packSize || quoteForm.packaging,
              });
            }}
            options={products.map((p) => ({ value: p.id, label: `${p.productName} [${p.grade}]` }))}
          />

          <Input
            label="Volume Quantity (MT)"
            type="number"
            required
            value={quoteForm.qty}
            onChange={(e) => setQuoteForm({ ...quoteForm, qty: e.target.value })}
          />

          <Input
            label="Rate per MT (INR)"
            type="number"
            required
            value={quoteForm.unitPrice}
            onChange={(e) => setQuoteForm({ ...quoteForm, unitPrice: e.target.value })}
          />

          <Select
            label="Delivery Terms"
            options={[
              { value: '30 Days Net', label: '30 Days Net' },
              { value: '45 Days LC', label: '45 Days LC' },
              { value: 'Advance 50%', label: 'Advance 50%' },
              { value: 'Immediate Against Delivery', label: 'Immediate Against Delivery' },
            ]}
            value={quoteForm.paymentTerms}
            onChange={(e) => setQuoteForm({ ...quoteForm, paymentTerms: e.target.value })}
          />

          <div className="erp-col-span-2">
            <Input
              label="Packaging Specification"
              value={quoteForm.packaging}
              onChange={(e) => setQuoteForm({ ...quoteForm, packaging: e.target.value })}
            />
          </div>
        </form>
      </Modal>

      {/* Drilldown Records Modal */}
      {drilldownData && (
        <Modal
          isOpen={Boolean(drilldownData)}
          onClose={() => setDrilldownData(null)}
          title={drilldownData.title}
          description="Detailed operational data underlying dashboard metric figures."
          size="lg"
          footer={
            <Button variant="secondary" onClick={() => setDrilldownData(null)}>
              Close View
            </Button>
          }
        >
          <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
            <table className="erp-table">
              <thead>
                <tr>
                  <th>Reference</th>
                  <th>Description / Party</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {drilldownData.records.map((r, i) => (
                  <tr key={r.id || i}>
                    <td><strong>{r.id || r.unit}</strong></td>
                    <td>{r.client || r.customerName || r.supplierName || r.title || r.status}</td>
                    <td><StatusBadge status={r.status || 'Active'} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Modal>
      )}

      {/* Official Chemical Outward Road Tanker Gate Pass with Celebratory Animation */}
      <GatePassModal
        isOpen={isGatePassModalOpen}
        onClose={() => {
          setIsGatePassModalOpen(false);
          setSelectedGatePassConsignment(null);
        }}
        consignment={selectedGatePassConsignment}
        availableConsignments={
          logisticsTasks && logisticsTasks.length > 0
            ? logisticsTasks.map((t) => ({
                id: `GP-2026-${t.id?.replace(/[^0-9]/g, '') || '8921'}`,
                soNumber: t.soNumber,
                deliveryId: t.deliveryId,
                client: t.consignee,
                consignee: `${t.consignee}, ${t.pod || 'Customer Destination'}`,
                product: t.productName,
                spec: t.spec || 'USP / BP Chemical Standards Guaranteed',
                volume: `${t.weightMT} MT`,
                weightMT: t.weightMT,
                vehicleNo: t.vehicleNo !== 'TBD' ? t.vehicleNo : 'GJ-16-AX-8921',
                driverName: 'Rameshwar B. Patel',
                driverContact: t.driverContact !== 'TBD' ? t.driverContact : '+91 98251 44921',
                driverLicense: 'GJ16-2018-009124',
                transporter: t.outwardTask?.line || 'SafeChem Bulk Carriers Ltd',
                grossWeightKg: (t.weightMT * 1000) + 14280,
                tareWeightKg: 14280,
                netWeightKg: t.weightMT * 1000,
                sealTop: 'SC-9912A',
                sealBottom: 'SC-9912B',
                inTime: '07:15 AM',
                outTime: '10:30 AM',
                gateNo: 'Security Gate #2 (Tanker Outward Terminal)',
                ewayBill: '2410 8829 4410',
                invoiceNo: `INV-2026-${t.soNumber?.replace(/[^0-9]/g, '').slice(-4) || '1082'}`,
              }))
            : [
                {
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
                },
              ]
        }
        onSelectConsignment={(c) => setSelectedGatePassConsignment(c)}
      />

      {/* Official Chemical Quotation PDF Document Preview & Download Modal */}
      <DocumentPdfModal
        isOpen={Boolean(selectedQuoteForPdf)}
        onClose={() => setSelectedQuoteForPdf(null)}
        type="quote"
        data={selectedQuoteForPdf}
        currentUser={currentUser}
        onConvertToSo={(qid) => convertQuotationToSalesOrder(qid)}
      />
    </div>
  );
}

export default DashboardPage;
