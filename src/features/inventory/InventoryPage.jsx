import { useState, useMemo } from 'react';
import PageHeader from '../../components/layout/PageHeader';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import DataTable from '../../components/ui/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import { useErp } from '../../hooks/useErp';
import {
  Plus,
  ArrowDownLeft,
  ArrowUpRight,
  Factory,
  MinusCircle,
  Boxes,
  Layers,
  AlertTriangle,
  TrendingUp,
  Truck,
  Scale,
  Building2,
  FileText,
  Calendar,
  CheckCircle2,
} from 'lucide-react';

const safeNum = (val) => (val != null && !isNaN(Number(val)) ? Number(val).toLocaleString() : '0');

export function InventoryPage() {
  const {
    currentUser,
    products,
    stores,
    stock,
    suppliers,
    purchaseOrders,
    salesOrders,
    inwardEntries,
    outwardEntries,
    dailyProductionEntries = [],
    localMiscEntries,
    storeMissEntries,
    addInwardEntry,
    addOutwardEntry,
    addProductionOutput,
    deductDailyStockUsage,
    addLocalMiscEntry,
    addStoreMissEntry,
  } = useErp();

  // Active Screen Switcher in step-by-step order: 1.1 Inward | 1.2 Outward | 1.3 Production | 1.4 Stock | 1.5 Local Misc
  const [activeTab, setActiveTab] = useState('inward');

  // Modal type: 'inward' | 'outward' | 'production' | 'deduct' | 'misc' | 'miss'
  const [modalType, setModalType] = useState(null);

  // 1.1 Inwards Form State
  const [inwardForm, setInwardForm] = useState({
    productId: products[0]?.id || '',
    supplier: suppliers[0]?.companyName || '',
    quantityKg: '',
    poNo: 'SOL/PO/4411',
    packagingType: 'Bulk Road Tanker',
    vehicleNo: 'GJ-12-BW-9021',
    invoiceNo: 'AWL-EXP-88910',
    ewayBillNo: '241928491029',
    storeId: 'STORE-1',
  });

  // 1.2 Outwards Form State
  const [outwardForm, setOutwardForm] = useState({
    productId: products[0]?.id || '',
    quantityKg: '',
    soNo: 'SOL/SO/2891',
    packagingType: 'Bulk Road Tanker',
    invoiceNo: 'SOL/EXP/0911',
    vehicleNo: 'GJ-16-AX-8921',
    ewayBill: '248901928410',
    pol: 'Dahej Plant Gate',
    pod: 'Customer Delivery Plant',
  });

  // 1.3 Production Form State
  const [prodForm, setProdForm] = useState({
    productId: products[0]?.id || '',
    quantityKg: 20000,
    reactor: 'Reactor R-101 (Fractionation)',
    batchNo: `B-2610-${Date.now().toString().slice(-3)}`,
  });

  // 1.4 Daily Stock Deduction Form State
  const [deductForm, setDeductForm] = useState({
    productId: products[0]?.id || '',
    quantityKg: 5000,
    reason: 'Daily Plant Production Consumption',
    reactor: 'Reactor R-101 (Fractionation)',
  });

  // 1.5 Local Misc Form State (SOL/MIS/XX)
  const [miscForm, setMiscForm] = useState({
    productName: '',
    value: '',
    askedBy: '',
    purpose: '',
  });

  // Store Miss Discrepancy Form State
  const [missForm, setMissForm] = useState({
    product: '',
    expectedKg: '',
    foundKg: '',
    reason: '',
  });

  // Calculations for Admin / Manager Stock Overview
  const totalStockKg = stock.reduce((sum, s) => sum + s.stockKg, 0);
  const totalStockMT = (totalStockKg / 1000).toFixed(1);

  const totalInwardTodayKg = inwardEntries.reduce((sum, i) => sum + (Number(i.quantityKg) || 0), 0);
  const totalInwardTodayMT = (totalInwardTodayKg / 1000).toFixed(1);

  const totalOutwardTodayKg = outwardEntries.reduce((sum, o) => sum + (Number(o.quantityKg) || 0), 0);
  const totalOutwardTodayMT = (totalOutwardTodayKg / 1000).toFixed(1);

  const totalProdTodayKg = dailyProductionEntries.reduce((sum, p) => sum + (Number(p.quantityKg) || 0), 0);
  const totalProdTodayMT = (totalProdTodayKg / 1000).toFixed(1);

  // 1.4 Stock Ledger Rows joining product and warehouse silo data
  const stockRows = useMemo(() => {
    return stock.map((s) => {
      const prod = products.find((p) => p.id === s.productId);
      const store = stores.find((st) => st.id === s.storeId);
      const prodInwardKg = inwardEntries
        .filter((i) => i.productId === s.productId)
        .reduce((sum, i) => sum + (Number(i.quantityKg) || 0), 0);
      const prodOutwardKg = outwardEntries
        .filter((o) => o.productId === s.productId)
        .reduce((sum, o) => sum + (Number(o.quantityKg) || 0), 0);
      const prodRunKg = dailyProductionEntries
        .filter((p) => p.productId === s.productId)
        .reduce((sum, p) => sum + (Number(p.quantityKg) || 0), 0);

      const healthStatus =
        s.stockKg < s.minStockKg
          ? 'Low Stock Alert'
          : s.stockKg < s.minStockKg * 1.25
          ? 'Reorder Level'
          : 'Optimal';

      return {
        id: s.productId,
        productName: prod?.productName || 'Chemical Item',
        code: prod?.productCode || s.productId,
        type: prod?.type || 'Liquid',
        grade: prod?.grade || 'Industrial Grade',
        storeName: store?.name || 'Central Silo',
        inwardKg: prodInwardKg,
        outwardKg: prodOutwardKg,
        productionKg: prodRunKg,
        stockKg: s.stockKg,
        stockMT: (s.stockKg / 1000).toFixed(1),
        minStockMT: (s.minStockKg / 1000).toFixed(1),
        status: healthStatus,
        rawProduct: prod,
      };
    });
  }, [stock, products, stores, inwardEntries, outwardEntries, dailyProductionEntries]);

  // Combined PO options for Inward (Standard POs + Local Misc SOL/MIS)
  const combinedPoOptions = useMemo(() => {
    const list = [];
    purchaseOrders.forEach((po) => {
      list.push({
        value: po.id,
        label: `📋 Standard PO: ${po.id} — ${po.material || po.buyerName || 'Chemical'} (${po.supplierName || 'Vendor'})`,
      });
    });
    localMiscEntries.forEach((m) => {
      list.push({
        value: m.id,
        label: `🏷️ Local PO (1.5): ${m.id} — ${m.productName} [Asked by: ${m.askedBy}] (₹${safeNum(m.value)})`,
      });
    });
    list.push({
      value: 'DIRECT_LOCAL',
      label: '⚡ Direct Gate Inward (Spot Local Cash/Purchase)',
    });
    return list;
  }, [purchaseOrders, localMiscEntries]);

  // Combined SO options for Outward
  const combinedSoOptions = useMemo(() => {
    const list = salesOrders.map((so) => ({
      value: so.id,
      label: `📦 Sales Order: ${so.id} — ${so.customerName} (${so.product || so.items?.[0]?.productName || 'Goods'})`,
    }));
    list.push({
      value: 'SPOT_DISPATCH',
      label: '⚡ Spot Outward (Direct Plant-to-Plant Consignment)',
    });
    return list;
  }, [salesOrders]);

  // Stock Columns
  const stockColumns = [
    {
      key: 'code',
      title: 'Item Code',
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
      key: 'productName',
      title: 'Chemical Grade & Description',
      render: (val, row) => (
        <div>
          <strong style={{ color: '#0F172A' }}>{val}</strong>
          <div style={{ fontSize: '0.6875rem', color: '#64748B' }}>{row.grade}</div>
        </div>
      ),
    },
    { key: 'type', title: 'State' },
    { key: 'storeName', title: 'Designated Silo / Store' },
    {
      key: 'inwardKg',
      title: 'Inwards (+kg)',
      align: 'right',
      render: (val) => (
        <span style={{ color: '#059669', fontWeight: 600 }}>
          {val > 0 ? `+${safeNum(val)}` : '—'}
        </span>
      ),
    },
    {
      key: 'outwardKg',
      title: 'Used / Out (-kg)',
      align: 'right',
      render: (val) => (
        <span style={{ color: '#DC2626', fontWeight: 600 }}>
          {val > 0 ? `-${safeNum(val)}` : '—'}
        </span>
      ),
    },
    {
      key: 'stockMT',
      title: 'Live Stock Balance',
      align: 'right',
      render: (val, row) => (
        <div>
          <strong style={{ fontSize: '0.875rem', color: '#0F172A' }}>{val} MT</strong>
          <div style={{ fontSize: '0.6875rem', color: '#64748B' }}>
            ({safeNum(row?.stockKg)} kg)
          </div>
        </div>
      ),
    },
    {
      key: 'minStockMT',
      title: 'Safety Min (MT)',
      align: 'right',
      render: (val) => `${val} MT`,
    },
    {
      key: 'status',
      title: 'Inventory Health',
      render: (val) => <StatusBadge status={val} />,
    },
    {
      key: 'actions',
      title: 'Quick Actions',
      align: 'right',
      render: (_, row) => (
        <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
          <Button
            size="sm"
            variant="secondary"
            icon={<ArrowDownLeft size={11} />}
            onClick={() => {
              setInwardForm((prev) => ({ ...prev, productId: row.id }));
              setModalType('inward');
            }}
            title="Add Inward Stock"
          >
            Inward
          </Button>
          <Button
            size="sm"
            variant="secondary"
            icon={<MinusCircle size={11} />}
            onClick={() => {
              setDeductForm((prev) => ({ ...prev, productId: row.id }));
              setModalType('deduct');
            }}
            title="Deduct Daily Stock Used"
          >
            Deduct
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      {/* Page Header */}
      <PageHeader
        title="1. Inventory & Bulk Feedstock Management"
        description="Unified live inventory ledger: 1.1 Inwards GRN, 1.2 Outwards Dispatch, 1.3 Daily Production, 1.4 Live Stock, and 1.5 Local Misc Procurement."
      />

      {/* Admin / Manager Executive Live Inventory Overview (Step-by-Step 1.1 to 1.4 KPI Bar) */}
      <div className="erp-grid-kpi" style={{ marginBottom: 'var(--space-4)' }}>
        {/* 1.1 INWARDS */}
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
                  background: '#ECFDF5',
                  color: '#059669',
                  border: '1px solid #A7F3D0',
                }}
              >
                <ArrowDownLeft size={14} strokeWidth={2.4} />
              </span>
              <span className="erp-metric-label-clean">1.1 Inwards Received</span>
            </div>
            <span className="erp-metric-pill erp-metric-pill-green">+{inwardEntries.length} GRNs</span>
          </div>
          <div className="erp-metric-value-clean">+{totalInwardTodayMT} MT</div>
          <div className="erp-metric-subline">
            <span>+{safeNum(totalInwardTodayKg)} KGs Added</span>
          </div>
        </div>

        {/* 1.2 OUTWARDS */}
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
                  color: '#DC2626',
                  border: '1px solid #FECACA',
                }}
              >
                <ArrowUpRight size={14} strokeWidth={2.4} />
              </span>
              <span className="erp-metric-label-clean">1.2 Outwards Dispatched</span>
            </div>
            <span className="erp-metric-pill erp-metric-pill-orange">Deducted</span>
          </div>
          <div className="erp-metric-value-clean">-{totalOutwardTodayMT} MT</div>
          <div className="erp-metric-subline">
            <span>-{safeNum(totalOutwardTodayKg)} KGs Dispatched</span>
          </div>
        </div>

        {/* 1.3 PRODUCTION */}
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
                  background: '#FFF7ED',
                  color: '#EA580C',
                  border: '1px solid #FED7AA',
                }}
              >
                <Factory size={14} strokeWidth={2.4} />
              </span>
              <span className="erp-metric-label-clean">1.3 Production Added</span>
            </div>
            <span className="erp-metric-pill erp-metric-pill-blue">Synthesized</span>
          </div>
          <div className="erp-metric-value-clean">+{totalProdTodayMT} MT</div>
          <div className="erp-metric-subline">
            <span>+{safeNum(totalProdTodayKg)} KGs Finished Goods</span>
          </div>
        </div>

        {/* 1.4 LIVE STOCK */}
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
                  background: '#EEF2FF',
                  color: '#4F46E5',
                  border: '1px solid #C7D2FE',
                }}
              >
                <Boxes size={14} strokeWidth={2.4} />
              </span>
              <span className="erp-metric-label-clean">1.4 Live Stock Balance</span>
            </div>
            <span className="erp-metric-pill erp-metric-pill-green">Verified</span>
          </div>
          <div className="erp-metric-value-clean">{totalStockMT} MT</div>
          <div className="erp-metric-subline">
            <span>{safeNum(totalStockKg)} KGs in Feedstock Silos</span>
          </div>
        </div>
      </div>

      {/* Screen Switcher Tabs in strict Step-by-Step order: 1.1 -> 1.2 -> 1.3 -> 1.4 -> 1.5 */}
      <div className="erp-dash-pill-group" style={{ marginBottom: 'var(--space-4)' }}>
        {[
          { key: 'inward', label: `1.1 Inwards Gate Receipts (${inwardEntries.length})`, icon: ArrowDownLeft },
          { key: 'outward', label: `1.2 Outwards Dispatches (${outwardEntries.length})`, icon: ArrowUpRight },
          { key: 'production', label: `1.3 Daily Production Runs (${dailyProductionEntries.length})`, icon: Factory },
          { key: 'stock', label: '1.4 Stock Ledger & Live Reserves', icon: Boxes },
          { key: 'misc', label: `1.5 Local Misc Procurement (${localMiscEntries.length})`, icon: Layers },
          { key: 'miss', label: `Store Miss Discrepancy Log (${storeMissEntries.length})`, icon: AlertTriangle },
        ].map((tab) => {
          const isActive = activeTab === tab.key;
          const IconComp = tab.icon;
          return (
            <button
              key={tab.key}
              type="button"
              className={`erp-dash-pill ${isActive ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.key)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
            >
              <IconComp size={13} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* =========================================================================
          SCREEN 1.1: INWARDS Gate Receipts
          Fields: Product Name, Supplier Name, Quantity KGS, PO. NO./LOCAL,
                  Packaging Type, Vehicle No., Invoice No., E-Way Bill No.
          ========================================================================= */}
      {activeTab === 'inward' && (
        <Card
          title="1.1 Inwards Feedstock & Raw Material Gate Receipts"
          subtitle="Weighbridge-cleared receipts that increase live physical stock balance."
          actions={
            <Button
              size="sm"
              variant="primary"
              icon={<ArrowDownLeft size={13} />}
              onClick={() => setModalType('inward')}
            >
              + New Inward Receipt
            </Button>
          }
          noPadding
        >
          <div style={{ overflowX: 'auto' }}>
            <table className="erp-table">
              <thead>
                <tr>
                  <th>Receipt #</th>
                  <th>Product Name</th>
                  <th>Supplier Name</th>
                  <th style={{ textAlign: 'right' }}>Quantity (KGS)</th>
                  <th style={{ textAlign: 'right' }}>Payload (MT)</th>
                  <th>PO. NO. / LOCAL</th>
                  <th>Packaging Type</th>
                  <th>Vehicle No.</th>
                  <th>Invoice No.</th>
                  <th>E-Way Bill No.</th>
                  <th>Date & Time</th>
                </tr>
              </thead>
              <tbody>
                {inwardEntries.map((inw) => (
                  <tr key={inw.id}>
                    <td>
                      <strong style={{ color: 'var(--color-primary-dark)', fontFamily: 'monospace' }}>
                        {inw.id}
                      </strong>
                    </td>
                    <td>
                      <strong>{inw.product}</strong>
                    </td>
                    <td>{inw.supplier}</td>
                    <td style={{ textAlign: 'right' }}>
                      <strong style={{ color: '#059669' }}>
                        +{safeNum(inw.quantityKg)} kg
                      </strong>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <strong>{(Number(inw.quantityKg) / 1000).toFixed(1)} MT</strong>
                    </td>
                    <td>
                      <span
                        style={{
                          fontSize: '0.6875rem',
                          padding: '1px 6px',
                          borderRadius: 4,
                          background: inw.poNo?.includes('MIS') ? '#F3E8FF' : '#EFF6FF',
                          color: inw.poNo?.includes('MIS') ? '#7C3AED' : '#1D4ED8',
                          fontWeight: 700,
                          fontFamily: 'monospace',
                        }}
                      >
                        {inw.poNo || 'LOCAL'}
                      </span>
                    </td>
                    <td>{inw.packagingType || 'Bulk Road Tanker'}</td>
                    <td>
                      <code style={{ fontWeight: 600 }}>{inw.vehicleNo}</code>
                    </td>
                    <td>{inw.invoiceNo || '—'}</td>
                    <td>
                      <span style={{ fontSize: '0.6875rem', color: '#64748B', fontFamily: 'monospace' }}>
                        {inw.ewayBillNo || '—'}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.6875rem', color: '#64748B' }}>{inw.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* =========================================================================
          SCREEN 1.2: OUTWARDS Dispatches
          Fields: Product Name, Quantity, SO. NO., Packaging Type,
                  Invoice No., Vehicle No., E-Way Bill, POL and POD
          ========================================================================= */}
      {activeTab === 'outward' && (
        <Card
          title="1.2 Outwards Consignment Dispatches & Tanker Releases"
          subtitle="Authorized gate outward manifests that deduct live physical inventory."
          actions={
            <Button
              size="sm"
              variant="primary"
              icon={<ArrowUpRight size={13} />}
              onClick={() => setModalType('outward')}
            >
              + New Outward Dispatch
            </Button>
          }
          noPadding
        >
          <div style={{ overflowX: 'auto' }}>
            <table className="erp-table">
              <thead>
                <tr>
                  <th>Dispatch #</th>
                  <th>Product Name</th>
                  <th style={{ textAlign: 'right' }}>Quantity (KGS)</th>
                  <th style={{ textAlign: 'right' }}>Payload (MT)</th>
                  <th>SO. NO.</th>
                  <th>Packaging Type</th>
                  <th>Invoice No.</th>
                  <th>Vehicle No.</th>
                  <th>E-Way Bill</th>
                  <th>POL & POD (Port of Loading → Delivery)</th>
                  <th>Dispatch Date</th>
                </tr>
              </thead>
              <tbody>
                {outwardEntries.map((outw) => (
                  <tr key={outw.id}>
                    <td>
                      <strong style={{ color: 'var(--color-primary-dark)', fontFamily: 'monospace' }}>
                        {outw.id}
                      </strong>
                    </td>
                    <td>
                      <strong>{outw.product}</strong>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <strong style={{ color: '#DC2626' }}>
                        -{safeNum(outw.quantityKg)} kg
                      </strong>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <strong>{(Number(outw.quantityKg) / 1000).toFixed(1)} MT</strong>
                    </td>
                    <td>
                      <span
                        style={{
                          fontSize: '0.6875rem',
                          padding: '1px 6px',
                          borderRadius: 4,
                          background: '#ECFDF5',
                          color: '#065F46',
                          fontWeight: 700,
                          fontFamily: 'monospace',
                        }}
                      >
                        {outw.soNo}
                      </span>
                    </td>
                    <td>{outw.packagingType || 'Bulk Road Tanker'}</td>
                    <td>{outw.invoiceNo || 'SOL/EXP/0909'}</td>
                    <td>
                      <code style={{ fontWeight: 600 }}>{outw.vehicleNo}</code>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.6875rem', color: '#64748B', fontFamily: 'monospace' }}>
                        {outw.ewayBill || '—'}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.75rem' }}>
                      <strong>{outw.pol || 'Dahej Plant Gate'}</strong> →{' '}
                      <span style={{ color: '#047857' }}>{outw.pod || 'Customer Destination'}</span>
                    </td>
                    <td style={{ fontSize: '0.6875rem', color: '#64748B' }}>{outw.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* =========================================================================
          SCREEN 1.3: PRODUCTION Runs
          Fields: Drop Down Menu - User Selection of product in KGs,
                  Number of product produced in KGs
          ========================================================================= */}
      {activeTab === 'production' && (
        <Card
          title="1.3 Daily Production Runs & Chemical Synthesis"
          subtitle="Produced batches synthesized in plant reactors and added into finished inventory."
          actions={
            <Button
              size="sm"
              variant="primary"
              icon={<Factory size={13} />}
              onClick={() => setModalType('production')}
            >
              + Record Daily Production
            </Button>
          }
          noPadding
        >
          <div style={{ overflowX: 'auto' }}>
            <table className="erp-table">
              <thead>
                <tr>
                  <th>Production Run #</th>
                  <th>Product Produced</th>
                  <th style={{ textAlign: 'right' }}>Quantity (KGS)</th>
                  <th style={{ textAlign: 'right' }}>Volume (MT)</th>
                  <th>Reactor Vessel / Unit</th>
                  <th>Batch Ref</th>
                  <th>Supervisor / Operator</th>
                  <th>Date & Shift</th>
                  <th>Stock Status</th>
                </tr>
              </thead>
              <tbody>
                {dailyProductionEntries.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <strong style={{ color: 'var(--color-primary-dark)', fontFamily: 'monospace' }}>
                        {p.id}
                      </strong>
                    </td>
                    <td>
                      <strong>{p.productName}</strong>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <strong style={{ color: '#059669' }}>
                        +{safeNum(p.quantityKg)} kg
                      </strong>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <strong>{(Number(p.quantityKg) / 1000).toFixed(1)} MT</strong>
                    </td>
                    <td>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        <Factory size={12} style={{ color: '#EA580C' }} /> {p.reactor}
                      </span>
                    </td>
                    <td>
                      <code>{p.batchNo}</code>
                    </td>
                    <td>{p.operator || currentUser?.name}</td>
                    <td style={{ fontSize: '0.6875rem', color: '#64748B' }}>{p.date}</td>
                    <td>
                      <span
                        style={{
                          fontSize: '0.6875rem',
                          padding: '1px 6px',
                          borderRadius: 4,
                          background: '#DCFCE7',
                          color: '#15803D',
                          fontWeight: 700,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 3,
                        }}
                      >
                        <CheckCircle2 size={11} /> Posted to Stock
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* =========================================================================
          SCREEN 1.4: STOCK (Live Inventory Ledger for Admin / Manager)
          ========================================================================= */}
      {activeTab === 'stock' && (
        <Card
          title="1.4 Live Stock Reserves & Chemical Silo Balances"
          subtitle="Real-time multi-silo inventory: Inward receipts add to stock, daily reactor production adds finished goods, and outward dispatches / daily usage deduct live balances."
          actions={
            <div style={{ display: 'flex', gap: 6 }}>
              <Button
                size="sm"
                variant="secondary"
                icon={<ArrowDownLeft size={12} />}
                onClick={() => setModalType('inward')}
              >
                + Add Inward Stock
              </Button>
              <Button
                size="sm"
                variant="secondary"
                icon={<MinusCircle size={12} />}
                onClick={() => setModalType('deduct')}
              >
                - Deduct Daily Used
              </Button>
              <Button
                size="sm"
                variant="primary"
                icon={<Factory size={12} />}
                onClick={() => setModalType('production')}
              >
                + Production Run
              </Button>
            </div>
          }
          noPadding
        >
          <DataTable columns={stockColumns} data={stockRows} keyField="code" />
        </Card>
      )}

      {/* =========================================================================
          SCREEN 1.5: LOCAL MISSC. (SOL/MIS/XX)
          Convention: SOL/MIS/XX
          Fields: Name of Product, Value, Created By, Asked By
          ========================================================================= */}
      {activeTab === 'misc' && (
        <Card
          title="1.5 Local Miscellaneous Procurement (SOL/MIS/XX)"
          subtitle="Generate Local Purchase Orders with convention SOL/MIS/XX for off-catalog workshop items and urgent chemical consumables."
          actions={
            <Button
              size="sm"
              variant="primary"
              icon={<Plus size={13} />}
              onClick={() => setModalType('misc')}
            >
              + Generate Local PO (SOL/MIS)
            </Button>
          }
          noPadding
        >
          <div style={{ overflowX: 'auto' }}>
            <table className="erp-table">
              <thead>
                <tr>
                  <th>Local PO # (Convention SOL/MIS/XX)</th>
                  <th>Name of Product</th>
                  <th style={{ textAlign: 'right' }}>Value (INR)</th>
                  <th>Created By</th>
                  <th>Asked By (Requisitioner)</th>
                  <th>Operational Purpose</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {localMiscEntries.map((m) => (
                  <tr key={m.id}>
                    <td>
                      <strong
                        style={{
                          color: '#7C3AED',
                          background: '#F3E8FF',
                          padding: '2px 8px',
                          borderRadius: 4,
                          fontFamily: 'monospace',
                        }}
                      >
                        {m.id}
                      </strong>
                    </td>
                    <td>
                      <strong>{m.productName}</strong>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <strong style={{ color: '#065F46' }}>
                        ₹{safeNum(m.value)}
                      </strong>
                    </td>
                    <td>{m.createdBy}</td>
                    <td>
                      <strong>{m.askedBy}</strong>
                    </td>
                    <td style={{ fontSize: '0.71875rem', color: '#475569', maxWidth: 280 }}>
                      {m.purpose || 'Operational store requisition'}
                    </td>
                    <td style={{ fontSize: '0.6875rem', color: '#64748B' }}>{m.date}</td>
                    <td>
                      <span
                        style={{
                          fontSize: '0.6875rem',
                          padding: '2px 6px',
                          borderRadius: 4,
                          background: '#ECFDF5',
                          color: '#065F46',
                          fontWeight: 600,
                        }}
                      >
                        Active Requisition
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <Button
                        size="sm"
                        variant="secondary"
                        icon={<ArrowDownLeft size={11} />}
                        onClick={() => {
                          setInwardForm((prev) => ({
                            ...prev,
                            poNo: m.id,
                            supplier: 'Local Procurement Desk',
                          }));
                          setModalType('inward');
                        }}
                      >
                        Use in Inward (1.1)
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* =========================================================================
          SCREEN: STORE MISS Discrepancy Incidents
          ========================================================================= */}
      {activeTab === 'miss' && (
        <Card
          title="Store Miss Physical Variance & Audit Incidents"
          subtitle="Materials expected on system count during picking or plant audit but physically missing."
          actions={
            <Button
              size="sm"
              variant="danger"
              icon={<AlertTriangle size={13} />}
              onClick={() => setModalType('miss')}
            >
              Log Store Miss Incident
            </Button>
          }
          noPadding
        >
          <div style={{ overflowX: 'auto' }}>
            <table className="erp-table">
              <thead>
                <tr>
                  <th>Incident #</th>
                  <th>Product</th>
                  <th style={{ textAlign: 'right' }}>System Expected</th>
                  <th style={{ textAlign: 'right' }}>Physically Found</th>
                  <th style={{ textAlign: 'right' }}>Variance</th>
                  <th>Reason / Root Cause</th>
                  <th>Logged By</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {storeMissEntries.map((miss) => (
                  <tr key={miss.id}>
                    <td>
                      <strong style={{ color: 'var(--color-primary-dark)' }}>{miss.id}</strong>
                    </td>
                    <td>{miss.product}</td>
                    <td style={{ textAlign: 'right' }}>{miss.expectedKg} kg</td>
                    <td style={{ textAlign: 'right' }}>{miss.foundKg} kg</td>
                    <td
                      style={{
                        textAlign: 'right',
                        color: 'var(--color-error)',
                        fontWeight: 700,
                      }}
                    >
                      {miss.varianceKg} kg
                    </td>
                    <td style={{ maxWidth: 240, fontSize: '0.71875rem' }}>{miss.reason}</td>
                    <td>{miss.loggedBy}</td>
                    <td>
                      <StatusBadge status="Under Review" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* =========================================================================
          MODAL 1.1: RECORD INWARD RECEIPT
          Fields: Product Name, Supplier Name, Quantity KGS, PO. NO./LOCAL,
                  Packaging Type, Vehicle No., Invoice No., E-Way Bill No.
          ========================================================================= */}
      <Modal
        isOpen={modalType === 'inward'}
        onClose={() => setModalType(null)}
        title="1.1 Record Raw Material Inward Receipt (GRN)"
        description="Weighbridge-verified inward that adds physical stock balance to live inventory."
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalType(null)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              icon={<ArrowDownLeft size={14} />}
              onClick={() => {
                const prod = products.find((p) => p.id === inwardForm.productId) || products[0];
                addInwardEntry({
                  ...inwardForm,
                  product: prod.productName,
                  productId: prod.id,
                  quantityKg: Number(inwardForm.quantityKg),
                });
                setModalType(null);
              }}
            >
              Post Inward & Add to Live Stock
            </Button>
          </>
        }
      >
        <div className="erp-form-grid">
          {/* Field: Product Name */}
          <Select
            label="Product Name (from Master)"
            required
            value={inwardForm.productId}
            onChange={(e) => setInwardForm({ ...inwardForm, productId: e.target.value })}
            options={products.map((p) => ({
              value: p.id,
              label: `${p.productName} [${p.grade}]`,
            }))}
          />

          {/* Field: Supplier Name */}
          <Select
            label="Supplier Name"
            required
            value={inwardForm.supplier}
            onChange={(e) => setInwardForm({ ...inwardForm, supplier: e.target.value })}
            options={suppliers.map((s) => ({
              value: s.companyName,
              label: `${s.companyName} (${s.productSupplied || 'Vendor'})`,
            }))}
          />

          {/* Field: Quantity KGS */}
          <Input
            label="Quantity KGS"
            type="number"
            required
            placeholder="e.g. 48000"
            value={inwardForm.quantityKg}
            onChange={(e) => setInwardForm({ ...inwardForm, quantityKg: e.target.value })}
          />

          {/* Field: PO. NO./LOCAL (Refer 1.5) */}
          <Select
            label="PO. NO. / LOCAL (Refer 1.5)"
            required
            value={inwardForm.poNo}
            onChange={(e) => {
              const val = e.target.value;
              const po = purchaseOrders.find((p) => p.id === val);
              const misc = localMiscEntries.find((m) => m.id === val);
              if (po) {
                const matchedProduct = products.find(
                  (p) =>
                    p.id === po.productId ||
                    p.productName.toLowerCase().includes(po.material?.toLowerCase() || '')
                );
                setInwardForm({
                  ...inwardForm,
                  poNo: val,
                  supplier: po.supplierName || inwardForm.supplier,
                  productId: matchedProduct?.id || inwardForm.productId,
                  quantityKg: po.quantityKg || (po.qty ? po.qty * 1000 : inwardForm.quantityKg),
                });
              } else if (misc) {
                setInwardForm({
                  ...inwardForm,
                  poNo: val,
                  supplier: `Local Procurement (${misc.askedBy})`,
                });
              } else {
                setInwardForm({ ...inwardForm, poNo: val });
              }
            }}
            options={combinedPoOptions}
            placeholder="Select PO or Local PO (SOL/MIS)..."
          />

          {/* Field: Packaging Type */}
          <Select
            label="Packaging Type"
            value={inwardForm.packagingType}
            onChange={(e) => setInwardForm({ ...inwardForm, packagingType: e.target.value })}
            options={[
              { value: 'Bulk Road Tanker', label: 'Bulk Road Tanker (Liquids)' },
              { value: '250 kg Steel Drum', label: '250 kg Steel Drum' },
              { value: '50 kg Polypropylene Bags', label: '50 kg Polypropylene Bags' },
              { value: '25 kg HDPE Bags with Liner', label: '25 kg HDPE Bags with Liner' },
              { value: '20ft ISO Tank Container', label: '20ft ISO Tank Container' },
              { value: '1000L IBC Tote Container', label: '1000L IBC Tote Container' },
            ]}
          />

          {/* Field: Vehicle No. */}
          <Input
            label="Vehicle No. (Road Tanker)"
            required
            placeholder="e.g. GJ-12-BW-9021"
            value={inwardForm.vehicleNo}
            onChange={(e) => setInwardForm({ ...inwardForm, vehicleNo: e.target.value })}
          />

          {/* Field: Invoice No. */}
          <Input
            label="Invoice No. (Vendor Bill)"
            required
            placeholder="e.g. AWL-EXP-88910"
            value={inwardForm.invoiceNo}
            onChange={(e) => setInwardForm({ ...inwardForm, invoiceNo: e.target.value })}
          />

          {/* Field: E-Way Bill No. */}
          <Input
            label="E-Way Bill No."
            required
            placeholder="e.g. 2419 2849 1029"
            value={inwardForm.ewayBillNo}
            onChange={(e) => setInwardForm({ ...inwardForm, ewayBillNo: e.target.value })}
          />

          {/* Storage Silo destination */}
          <div className="erp-col-span-2">
            <Select
              label="Designated Silo / Warehouse Store"
              value={inwardForm.storeId}
              onChange={(e) => setInwardForm({ ...inwardForm, storeId: e.target.value })}
              options={stores.map((st) => ({
                value: st.id,
                label: `${st.name} — ${st.location}${st.capacityKg ? ` (${safeNum(st.capacityKg)} kg Capacity)` : ''}`,
              }))}
            />
          </div>
        </div>
      </Modal>

      {/* =========================================================================
          MODAL 1.2: RECORD OUTWARD DISPATCH
          Fields: Product Name, Quantity, SO. NO., Packaging Type,
                  Invoice No., Vehicle No., E-Way Bill, POL and POD
          ========================================================================= */}
      <Modal
        isOpen={modalType === 'outward'}
        onClose={() => setModalType(null)}
        title="1.2 Record Outward Consignment Dispatch"
        description="Gate pass release that deducts live stock balance upon tanker exit."
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalType(null)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              icon={<ArrowUpRight size={14} />}
              onClick={() => {
                const prod = products.find((p) => p.id === outwardForm.productId) || products[0];
                addOutwardEntry({
                  ...outwardForm,
                  product: prod.productName,
                  productId: prod.id,
                  quantityKg: Number(outwardForm.quantityKg),
                });
                setModalType(null);
              }}
            >
              Deduct Stock & Release Gate Outward
            </Button>
          </>
        }
      >
        <div className="erp-form-grid">
          {/* Field: Product Name */}
          <Select
            label="Product Name (from Master)"
            required
            value={outwardForm.productId}
            onChange={(e) => setOutwardForm({ ...outwardForm, productId: e.target.value })}
            options={products.map((p) => ({
              value: p.id,
              label: `${p.productName} [${p.grade}]`,
            }))}
          />

          {/* Field: Quantity */}
          <Input
            label="Quantity (in KGs)"
            type="number"
            required
            placeholder="e.g. 24000"
            value={outwardForm.quantityKg}
            onChange={(e) => setOutwardForm({ ...outwardForm, quantityKg: e.target.value })}
          />

          {/* Field: SO. NO. */}
          <Select
            label="SO. NO. (Sales Order Ref)"
            required
            value={outwardForm.soNo}
            onChange={(e) => {
              const val = e.target.value;
              const so = salesOrders.find((s) => s.id === val);
              if (so) {
                const prod = products.find(
                  (p) =>
                    p.id === so.productId ||
                    p.productName === (so.product || so.items?.[0]?.productName)
                );
                setOutwardForm({
                  ...outwardForm,
                  soNo: val,
                  productId: prod?.id || outwardForm.productId,
                  quantityKg: so.totalQuantityKg || (so.qty ? so.qty * 1000 : outwardForm.quantityKg),
                });
              } else {
                setOutwardForm({ ...outwardForm, soNo: val });
              }
            }}
            options={combinedSoOptions}
            placeholder="Select Sales Order..."
          />

          {/* Field: Packaging Type */}
          <Select
            label="Packaging Type"
            value={outwardForm.packagingType}
            onChange={(e) => setOutwardForm({ ...outwardForm, packagingType: e.target.value })}
            options={[
              { value: 'Bulk Insulated Tanker', label: 'Bulk Insulated Tanker' },
              { value: 'Bulk Road Tanker', label: 'Bulk Road Tanker' },
              { value: '250 kg Steel Drum', label: '250 kg Steel Drum' },
              { value: '25 kg Bags on Pallets', label: '25 kg Bags on Pallets' },
              { value: '20ft ISO Tank Container', label: '20ft ISO Tank Container' },
            ]}
          />

          {/* Field: Invoice No. */}
          <Input
            label="Invoice No."
            required
            placeholder="e.g. SOL/EXP/0911"
            value={outwardForm.invoiceNo}
            onChange={(e) => setOutwardForm({ ...outwardForm, invoiceNo: e.target.value })}
          />

          {/* Field: Vehicle No. */}
          <Input
            label="Vehicle No. (Road Tanker)"
            required
            placeholder="e.g. GJ-16-AX-8921"
            value={outwardForm.vehicleNo}
            onChange={(e) => setOutwardForm({ ...outwardForm, vehicleNo: e.target.value })}
          />

          {/* Field: E-Way Bill */}
          <Input
            label="E-Way Bill"
            required
            placeholder="e.g. 2489 0192 8410"
            value={outwardForm.ewayBill}
            onChange={(e) => setOutwardForm({ ...outwardForm, ewayBill: e.target.value })}
          />

          {/* Field: POL and POD */}
          <Input
            label="Port of Loading (POL)"
            required
            value={outwardForm.pol}
            onChange={(e) => setOutwardForm({ ...outwardForm, pol: e.target.value })}
          />

          <div className="erp-col-span-2">
            <Input
              label="Port of Delivery (POD)"
              required
              placeholder="e.g. Pidilite Industries Plant, Vapi Industrial Zone"
              value={outwardForm.pod}
              onChange={(e) => setOutwardForm({ ...outwardForm, pod: e.target.value })}
            />
          </div>
        </div>
      </Modal>

      {/* =========================================================================
          MODAL 1.3: PRODUCTION (Daily Output)
          Fields: Drop Down Menu - User Selection of product in KGs,
                  Number of product produced in KGs
          ========================================================================= */}
      <Modal
        isOpen={modalType === 'production'}
        onClose={() => setModalType(null)}
        title="1.3 Record Daily Production Output"
        description="Select product and number produced in KGs to directly add synthesized yield into live inventory."
        size="md"
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalType(null)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              icon={<Factory size={14} />}
              onClick={() => {
                const prod = products.find((p) => p.id === prodForm.productId) || products[0];
                addProductionOutput({
                  productId: prod.id,
                  productName: prod.productName,
                  quantityKg: Number(prodForm.quantityKg),
                  reactor: prodForm.reactor,
                  batchNo: prodForm.batchNo,
                });
                setModalType(null);
              }}
            >
              Post Output to Finished Stock
            </Button>
          </>
        }
      >
        <div className="erp-form-grid">
          {/* Drop Down Menu - User Selection of product in KGs */}
          <div className="erp-col-span-2">
            <Select
              label="Drop Down Menu - Select Chemical Product"
              required
              value={prodForm.productId}
              onChange={(e) => setProdForm({ ...prodForm, productId: e.target.value })}
              options={products.map((p) => ({
                value: p.id,
                label: `${p.productName} [${p.grade}] — Code: ${p.productCode}`,
              }))}
            />
          </div>

          {/* Number of product produced in KGs */}
          <Input
            label="Number of Product Produced in KGs"
            type="number"
            required
            placeholder="e.g. 40000"
            value={prodForm.quantityKg}
            onChange={(e) => setProdForm({ ...prodForm, quantityKg: e.target.value })}
          />

          <Select
            label="Reactor Synthesis Unit"
            value={prodForm.reactor}
            onChange={(e) => setProdForm({ ...prodForm, reactor: e.target.value })}
            options={[
              { value: 'Reactor R-101 (Fractionation)', label: 'Reactor R-101 (Fractionation)' },
              { value: 'Reactor R-102 (Esterification)', label: 'Reactor R-102 (Esterification)' },
              { value: 'Reactor R-103 (Autoclave)', label: 'Reactor R-103 (Autoclave)' },
              { value: 'Reactor R-104 (Vacuum Gly)', label: 'Reactor R-104 (Vacuum Gly)' },
            ]}
          />

          <div className="erp-col-span-2">
            <Input
              label="Synthesized Batch Ref #"
              value={prodForm.batchNo}
              onChange={(e) => setProdForm({ ...prodForm, batchNo: e.target.value })}
            />
          </div>
        </div>
      </Modal>

      {/* =========================================================================
          MODAL 1.4: DEDUCT STOCK USED ON PARTICULAR DAY
          Fields: Drop down select product, Deduct stock used on that day in KGs
          ========================================================================= */}
      <Modal
        isOpen={modalType === 'deduct'}
        onClose={() => setModalType(null)}
        title="1.4 Deduct Stock Used on Particular Day"
        description="Records feedstock charged into plant reactors or daily production consumption."
        size="md"
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalType(null)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              icon={<MinusCircle size={14} />}
              onClick={() => {
                const prod = products.find((p) => p.id === deductForm.productId) || products[0];
                deductDailyStockUsage({
                  productId: prod.id,
                  productName: prod.productName,
                  quantityKg: Number(deductForm.quantityKg),
                  reason: deductForm.reason,
                  reactor: deductForm.reactor,
                });
                setModalType(null);
              }}
            >
              Deduct Stock from Silo
            </Button>
          </>
        }
      >
        <div className="erp-form-grid">
          <div className="erp-col-span-2">
            <Select
              label="Select Product to Deduct"
              required
              value={deductForm.productId}
              onChange={(e) => setDeductForm({ ...deductForm, productId: e.target.value })}
              options={products.map((p) => ({
                value: p.id,
                label: `${p.productName} — Available in Silo`,
              }))}
            />
          </div>

          <Input
            label="Quantity Used on Particular Day (KGs)"
            type="number"
            required
            placeholder="e.g. 10000"
            value={deductForm.quantityKg}
            onChange={(e) => setDeductForm({ ...deductForm, quantityKg: e.target.value })}
          />

          <Select
            label="Reactor / Destination"
            value={deductForm.reactor}
            onChange={(e) => setDeductForm({ ...deductForm, reactor: e.target.value })}
            options={[
              { value: 'Reactor R-101 (Fractionation)', label: 'Reactor R-101 (Fractionation)' },
              { value: 'Reactor R-102 (Esterification)', label: 'Reactor R-102 (Esterification)' },
              { value: 'Reactor R-103 (Autoclave)', label: 'Reactor R-103 (Autoclave)' },
              { value: 'Quality Control Laboratory', label: 'Quality Control Laboratory Sample' },
            ]}
          />

          <div className="erp-col-span-2">
            <Input
              label="Consumption Purpose / Charge Log"
              value={deductForm.reason}
              onChange={(e) => setDeductForm({ ...deductForm, reason: e.target.value })}
            />
          </div>
        </div>
      </Modal>

      {/* =========================================================================
          MODAL 1.5: LOCAL MISC. (SOL/MIS/XX)
          Convention: SOL/MIS/XX
          Fields: Name of Product, Value, Created By, Asked By
          ========================================================================= */}
      <Modal
        isOpen={modalType === 'misc'}
        onClose={() => setModalType(null)}
        title="1.5 Generate Local PO (Convention: SOL/MIS/XX)"
        description="Generates local purchase order in convention SOL/MIS/XX with product, value, created by, and asked by."
        size="md"
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalType(null)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              icon={<Plus size={14} />}
              onClick={() => {
                if (!miscForm.productName || !miscForm.value) return;
                addLocalMiscEntry({
                  productName: miscForm.productName,
                  value: Number(miscForm.value),
                  askedBy: miscForm.askedBy || 'Store In-charge',
                  purpose: miscForm.purpose || 'Local plant requisition',
                });
                setModalType(null);
                setMiscForm({ productName: '', value: '', askedBy: '', purpose: '' });
              }}
            >
              Generate SOL/MIS/XX Local PO
            </Button>
          </>
        }
      >
        <div className="erp-form-grid">
          {/* Field: Name of Product */}
          <div className="erp-col-span-2">
            <Input
              label="Name of Product"
              required
              placeholder="e.g. Food Grade Antifoam Agent AF-10"
              value={miscForm.productName}
              onChange={(e) => setMiscForm({ ...miscForm, productName: e.target.value })}
            />
          </div>

          {/* Field: Value */}
          <Input
            label="Value (INR)"
            type="number"
            required
            placeholder="e.g. 48000"
            value={miscForm.value}
            onChange={(e) => setMiscForm({ ...miscForm, value: e.target.value })}
          />

          {/* Field: Asked By */}
          <Input
            label="Asked By (Requisitioner)"
            required
            placeholder="e.g. Dr. Swaminathan (QC Lab)"
            value={miscForm.askedBy}
            onChange={(e) => setMiscForm({ ...miscForm, askedBy: e.target.value })}
          />

          {/* Field: Created By */}
          <div className="erp-col-span-2">
            <Input
              label="Created By"
              disabled
              value={currentUser?.name ? `${currentUser.name} (${currentUser.role})` : 'Rajesh Sharma (HOD)'}
            />
          </div>

          {/* Field: Requisition Purpose */}
          <div className="erp-col-span-2">
            <Input
              label="Operational Purpose / Requisition Note"
              placeholder="e.g. Trial run in Reactor R-102 to prevent bubble carry-over"
              value={miscForm.purpose}
              onChange={(e) => setMiscForm({ ...miscForm, purpose: e.target.value })}
            />
          </div>
        </div>
      </Modal>

      {/* =========================================================================
          MODAL: STORE MISS Discrepancy Incident
          ========================================================================= */}
      <Modal
        isOpen={modalType === 'miss'}
        onClose={() => setModalType(null)}
        title="Log Store Miss Discrepancy"
        description="Physical stock missing during warehouse audit or plant picking."
        size="md"
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalType(null)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              icon={<AlertTriangle size={14} />}
              onClick={() => {
                addStoreMissEntry({
                  ...missForm,
                  varianceKg: Number(missForm.foundKg || 0) - Number(missForm.expectedKg || 0),
                });
                setModalType(null);
                setMissForm({ product: '', expectedKg: '', foundKg: '', reason: '' });
              }}
            >
              Submit for Investigation
            </Button>
          </>
        }
      >
        <div className="erp-form-grid">
          <div className="erp-col-span-2">
            <Input
              label="Material Name"
              required
              placeholder="e.g. Activated Bleaching Earth (Grade B-1)"
              value={missForm.product}
              onChange={(e) => setMissForm({ ...missForm, product: e.target.value })}
            />
          </div>

          <Input
            label="System Expected (kg)"
            type="number"
            required
            value={missForm.expectedKg}
            onChange={(e) => setMissForm({ ...missForm, expectedKg: e.target.value })}
          />

          <Input
            label="Physically Found (kg)"
            type="number"
            required
            value={missForm.foundKg}
            onChange={(e) => setMissForm({ ...missForm, foundKg: e.target.value })}
          />

          <div className="erp-col-span-2">
            <Input
              label="Reason / Root Cause"
              required
              placeholder="e.g. Bag puncture, unrecorded charge into Reactor R-102..."
              value={missForm.reason}
              onChange={(e) => setMissForm({ ...missForm, reason: e.target.value })}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default InventoryPage;
