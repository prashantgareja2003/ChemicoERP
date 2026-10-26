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
import {
  Plus,
  Printer,
  CheckCircle2,
  ArrowDownLeft,
  Pencil,
  ArrowRight,
  ShieldCheck,
  Receipt,
  CreditCard,
  Building2,
  FileCheck2,
  Eye,
  Layers,
} from 'lucide-react';

export function PurchasePage() {
  const {
    purchaseOrders,
    suppliers,
    createPurchaseOrder,
    updatePurchaseOrder,
    recordPayment,
    recordPoBillReceipt,
    closeOrder,
    addInwardEntry,
  } = useErp();

  const [search, setSearch] = useState('');
  const [activeStageTab, setActiveStageTab] = useState('all');

  // Modals
  const [isPoModalOpen, setIsPoModalOpen] = useState(false);
  const [selectedPoForView, setSelectedPoForView] = useState(null);
  const [inwardModalPo, setInwardModalPo] = useState(null);
  const [approvalModalState, setApprovalModalState] = useState({ isOpen: false, record: null });

  // Bill Receipt Modal State (Stage 4)
  const [billReceiptPo, setBillReceiptPo] = useState(null);
  const [billReceiptForm, setBillReceiptForm] = useState({
    invoiceNo: '',
    invoiceDate: new Date().toISOString().slice(0, 10),
    amount: '',
    grnRef: '',
  });

  // Payment Settlement Modal State (Stage 3 & 95% rule)
  const [paymentModalPo, setPaymentModalPo] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentRef, setPaymentRef] = useState('');

  // PO Form & Unified Modal State (Add & Edit)
  const [editingPoId, setEditingPoId] = useState(null);
  const [poForm, setPoForm] = useState({
    supplierId: '',
    material: '',
    spec: 'Membrane Cell Grade 48% NaOH',
    hsn: '28151200',
    qty: 120,
    uom: 'MT',
    unitPrice: 29000,
    taxPercent: 18,
    deliverySchedule: 'Within 7 Days',
    creditPeriod: '30 Days Net',
    deliveryPoint: 'Chemzora Bulk Tank Farm, Dahej SEZ',
    refSoNumber: 'SOL/SO/2891',
  });

  const handleOpenAddPo = () => {
    setEditingPoId(null);
    const defaultSup = suppliers[0] || {};
    setPoForm({
      supplierId: defaultSup.id || '',
      material: defaultSup.productSupplied || 'Caustic Soda Lye 48%',
      spec: 'Membrane Cell Grade 48% NaOH',
      hsn: '28151200',
      qty: 120,
      uom: 'MT',
      unitPrice: 29000,
      taxPercent: 18,
      deliverySchedule: 'Within 7 Days',
      creditPeriod: '30 Days Net',
      deliveryPoint: 'Chemzora Bulk Tank Farm, Dahej SEZ',
      refSoNumber: 'SOL/SO/2891',
    });
    setIsPoModalOpen(true);
  };

  const handleOpenEditPo = (row) => {
    setEditingPoId(row.id);
    const matchedSup = suppliers.find((s) => s.id === row.supplierId || s.companyName === row.supplierName) || suppliers[0];
    setPoForm({
      supplierId: row.supplierId || matchedSup?.id || '',
      material: row.material || matchedSup?.productSupplied || '',
      spec: row.spec || 'Membrane Cell Grade 48% NaOH',
      hsn: row.hsn || '28151200',
      qty: row.qty || 120,
      uom: row.uom || 'MT',
      unitPrice: row.unitPrice || 29000,
      taxPercent: row.taxPercent || 18,
      deliverySchedule: row.deliverySchedule || 'Within 7 Days',
      creditPeriod: row.creditPeriod || '30 Days Net',
      deliveryPoint: row.deliveryPoint || 'Chemzora Bulk Tank Farm, Dahej SEZ',
      refSoNumber: row.refSoNumber || '',
    });
    setIsPoModalOpen(true);
  };

  const handleSubmitPo = (e) => {
    if (e) e.preventDefault();
    const supp = suppliers.find((s) => s.id === poForm.supplierId) || suppliers[0];

    if (editingPoId) {
      updatePurchaseOrder(editingPoId, {
        ...poForm,
        qty: Number(poForm.qty),
        unitPrice: Number(poForm.unitPrice),
        supplierId: supp?.id,
        supplierName: supp?.companyName,
        gstin: supp?.gstin,
        address: supp?.address,
      });
    } else {
      createPurchaseOrder({
        ...poForm,
        qty: Number(poForm.qty),
        unitPrice: Number(poForm.unitPrice),
        supplierId: supp?.id,
        supplierName: supp?.companyName,
        gstin: supp?.gstin,
        address: supp?.address,
      });
    }

    setIsPoModalOpen(false);
    setEditingPoId(null);
  };

  // Inward receipt modal form
  const [inwardQty, setInwardQty] = useState('');
  const [inwardVehicle, setInwardVehicle] = useState('GJ-12-BW-9021');

  // Compute stage helper for every PO
  const getPoEffectiveStage = (po) => {
    if (po.stage) return po.stage;
    if (po.status === 'completed') return 'completed';
    const val = po.totalWithTax || po.totalValue || 1;
    const paidPct = ((po.paidAmount || 0) / val) * 100;
    if (po.billReceipt || paidPct >= 95) return 'bill_receipt';
    if ((po.receivedQty || 0) > 0 || paidPct > 0) return 'payment_terms';
    if (po.hodApproved || po.status === 'approved') return 'procurement_trade';
    return 'purchase_order';
  };

  const STAGES_FLOW = [
    {
      key: 'purchase_order',
      number: '1',
      title: 'Purchase Orders',
      subtitle: 'Indent Raised & HOD Approval',
      icon: Building2,
    },
    {
      key: 'procurement_trade',
      number: '2',
      title: 'Procurement Trade',
      subtitle: 'Contract Active & Inward Gate',
      icon: ShieldCheck,
    },
    {
      key: 'payment_terms',
      number: '3',
      title: 'Payment Terms',
      subtitle: 'GRN Booked & Credit Terms',
      icon: CreditCard,
    },
    {
      key: 'bill_receipt',
      number: '4',
      title: 'Bill Receipt',
      subtitle: 'Tax Invoice Logged & Matched',
      icon: Receipt,
    },
    {
      key: 'completed',
      number: '5',
      title: 'PO Completed',
      subtitle: '≥95% Settled & Closed',
      icon: CheckCircle2,
    },
  ];

  const filtered = purchaseOrders.filter((po) => {
    const effStage = getPoEffectiveStage(po);
    const matchesSearch =
      po.id.toLowerCase().includes(search.toLowerCase()) ||
      po.supplierName.toLowerCase().includes(search.toLowerCase()) ||
      po.material.toLowerCase().includes(search.toLowerCase());
    const matchesStage = activeStageTab === 'all' || effStage === activeStageTab;
    return matchesSearch && matchesStage;
  });


  const handleBookInward = () => {
    if (!inwardModalPo) return;
    const qtyKg = Number(inwardQty) * 1000;

    addInwardEntry({
      product: inwardModalPo.material,
      productId: 'PROD-005',
      supplier: inwardModalPo.supplierName,
      quantityKg: qtyKg,
      poNo: inwardModalPo.id,
      packagingType: 'Bulk Tanker',
      vehicleNo: inwardVehicle,
      invoiceNo: `SUPP-INV-${Date.now().toString().slice(-4)}`,
      ewayBillNo: `24${Date.now().toString().slice(-10)}`,
      storeId: 'STORE-1',
    });

    setInwardModalPo(null);
    setInwardQty('');
  };

  const handleOpenBillReceiptModal = (po) => {
    setBillReceiptPo(po);
    const invoiceVal = po.totalWithTax || po.totalValue;
    setBillReceiptForm({
      invoiceNo: `INV-${po.supplierName.substring(0, 3).toUpperCase()}-${Date.now().toString().slice(-4)}`,
      invoiceDate: new Date().toISOString().slice(0, 10),
      amount: String(invoiceVal),
      grnRef: `GRN-INW-${po.id.slice(-4)}`,
    });
  };

  const handleSubmitBillReceipt = (e) => {
    e.preventDefault();
    if (!billReceiptPo) return;
    recordPoBillReceipt(billReceiptPo.id, {
      invoiceNo: billReceiptForm.invoiceNo,
      invoiceDate: billReceiptForm.invoiceDate,
      amount: Number(billReceiptForm.amount),
      grnRef: billReceiptForm.grnRef,
    });
    setBillReceiptPo(null);
  };

  const handleOpenPaymentModal = (po) => {
    setPaymentModalPo(po);
    const totalVal = po.totalWithTax || po.totalValue;
    const balance = Math.max(0, totalVal - (po.paidAmount || 0));
    setPaymentAmount(String(balance));
    setPaymentRef(`CMS-NEFT-${Date.now().toString().slice(-5)}`);
  };

  const handleSubmitPayment = (e) => {
    e.preventDefault();
    if (!paymentModalPo) return;
    recordPayment('purchase_order', paymentModalPo.id, Number(paymentAmount), paymentRef);
    setPaymentModalPo(null);
  };

  const columns = [
    {
      key: 'id',
      title: 'PO Number',
      render: (val) => <strong style={{ color: 'var(--color-primary-dark)' }}>{val}</strong>,
    },
    {
      key: 'stage',
      title: 'Flow Stage',
      render: (_, row) => {
        const stage = getPoEffectiveStage(row);
        const stageMeta = {
          purchase_order: { label: '1. PO Awaiting HOD', color: 'badge--warning' },
          procurement_trade: { label: '2. Procurement Trade', color: 'badge--info' },
          payment_terms: { label: '3. Payment Terms', color: 'badge--primary' },
          bill_receipt: { label: '4. Bill Receipt Matched', color: 'badge--purple' },
          completed: { label: '5. PO Completed', color: 'badge--success' },
        }[stage] || { label: stage, color: 'badge--neutral' };

        return <span className={`badge ${stageMeta.color}`}>{stageMeta.label}</span>;
      },
    },
    { key: 'supplierName', title: 'Supplier Account' },
    { key: 'material', title: 'Raw Material' },
    {
      key: 'qty',
      title: 'Ordered Qty',
      align: 'right',
      render: (_, row) => `${row.qty} ${row.uom}`,
    },
    {
      key: 'receivedQty',
      title: 'Goods Inward (MT)',
      align: 'right',
      render: (val, row) => {
        const variance = (val || 0) - row.qty;
        return (
          <div>
            <strong>{val || 0} MT</strong>
            {variance !== 0 && (
              <span
                style={{
                  display: 'block',
                  fontSize: '0.625rem',
                  color: variance < 0 ? 'var(--color-warning)' : 'var(--color-error)',
                }}
              >
                {variance < 0 ? `Short: ${Math.abs(variance)}MT` : `Excess: +${variance}MT`}
              </span>
            )}
          </div>
        );
      },
    },
    {
      key: 'totalWithTax',
      title: 'Total PO Value',
      align: 'right',
      render: (val) => `₹${Number(val).toLocaleString()}`,
    },
    {
      key: 'paidAmount',
      title: 'Payment (≥95%)',
      align: 'right',
      render: (val, row) => {
        const total = row.totalWithTax || row.totalValue || 1;
        const pct = Math.round(((val || 0) / total) * 100);
        return (
          <div>
            <strong>₹{(val || 0).toLocaleString()}</strong>
            <span
              style={{
                display: 'block',
                fontSize: '0.625rem',
                color: pct >= 95 ? 'var(--color-success)' : 'var(--color-text-secondary)',
                fontWeight: 600,
              }}
            >
              {pct}% Paid
            </span>
          </div>
        );
      },
    },
    {
      key: 'actions',
      title: 'Actions',
      align: 'right',
      render: (_, row) => {
        const effStage = getPoEffectiveStage(row);
        const val = row.totalWithTax || row.totalValue || 1;
        const pct = Math.round(((row.paidAmount || 0) / val) * 100);
        const canClose = pct >= 95;

        return (
          <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
            <Button
              size="sm"
              variant="secondary"
              icon={<Eye size={13} />}
              onClick={() => setSelectedPoForView(row)}
            >
              View
            </Button>
            <Button
              size="sm"
              variant="secondary"
              icon={<Pencil size={12} />}
              onClick={() => handleOpenEditPo(row)}
            >
              Edit
            </Button>

            {/* Stage 1: PO Awaiting HOD Approval */}
            {effStage === 'purchase_order' && (
              <Button
                size="sm"
                variant="primary"
                icon={<ShieldCheck size={13} />}
                onClick={() => setApprovalModalState({ isOpen: true, record: row })}
              >
                HOD Sign
              </Button>
            )}

            {/* Stage 2: Procurement Raw Material Trade -> Book Inward GRN */}
            {effStage === 'procurement_trade' && (
              <Button
                size="sm"
                variant="primary"
                icon={<ArrowDownLeft size={13} />}
                onClick={() => {
                  setInwardModalPo(row);
                  setInwardQty(String(row.qty - (row.receivedQty || 0)));
                }}
              >
                Book Inward
              </Button>
            )}

            {/* Stage 3: Payment Terms -> Log Bill Receipt or Installment */}
            {effStage === 'payment_terms' && (
              <>
                <Button
                  size="sm"
                  variant="primary"
                  icon={<Receipt size={13} />}
                  onClick={() => handleOpenBillReceiptModal(row)}
                >
                  Bill Receipt
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  icon={<CreditCard size={13} />}
                  onClick={() => handleOpenPaymentModal(row)}
                >
                  Pay Term
                </Button>
              </>
            )}

            {/* Stage 4: Bill Receipt -> Pay & Close */}
            {effStage === 'bill_receipt' && (
              <>
                {pct < 95 && (
                  <Button
                    size="sm"
                    variant="secondary"
                    icon={<CreditCard size={13} />}
                    onClick={() => handleOpenPaymentModal(row)}
                  >
                    Pay Bill
                  </Button>
                )}
                {canClose && row.status !== 'completed' && (
                  <Button
                    size="sm"
                    variant="primary"
                    icon={<CheckCircle2 size={13} />}
                    onClick={() => closeOrder('purchase_order', row.id)}
                  >
                    Close PO ({pct}%)
                  </Button>
                )}
              </>
            )}

            {/* Stage 5: Completed */}
            {effStage === 'completed' && (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  fontSize: '0.6875rem',
                  color: 'var(--color-success)',
                  fontWeight: 600,
                  padding: '4px 6px',
                }}
              >
                <CheckCircle2 size={13} /> Settled
              </span>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div>
      <PageHeader
        title="Purchase & Raw Material Procurement"
        description="Indent PO issuance, HOD approval, gate inward GRN receipts, and supplier bill settlements."
        actions={
          <Button
            variant="primary"
            icon={<Plus size={15} />}
            onClick={handleOpenAddPo}
          >
            New Purchase Order (SOL/PO)
          </Button>
        }
      />

      {/* Segmented Pill Tabs matching standard ERP styling */}
      <div className="erp-tabs-row" style={{ marginBottom: 'var(--space-3)' }}>
        <Button
          size="sm"
          variant={activeStageTab === 'all' ? 'primary' : 'secondary'}
          icon={<Layers size={13} />}
          onClick={() => setActiveStageTab('all')}
        >
          All Orders ({purchaseOrders.length})
        </Button>
        {STAGES_FLOW.map((st) => {
          const count = purchaseOrders.filter((po) => getPoEffectiveStage(po) === st.key).length;
          const IconComponent = st.icon;
          return (
            <Button
              key={st.key}
              size="sm"
              variant={activeStageTab === st.key ? 'primary' : 'secondary'}
              icon={<IconComponent size={13} />}
              onClick={() => setActiveStageTab(st.key)}
            >
              {st.title} ({count})
            </Button>
          );
        })}
      </div>

      <FilterBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search PO #, supplier or chemical raw material..."
        onReset={() => {
          setSearch('');
          setActiveStageTab('all');
        }}
        totalCount={filtered.length}
      />

      <Card noPadding>
        <DataTable columns={columns} data={filtered} keyField="id" />
      </Card>

      {/* PO Document PDF Modal */}
      {selectedPoForView && (
        <Modal
          isOpen={Boolean(selectedPoForView)}
          onClose={() => setSelectedPoForView(null)}
          title={`Purchase Order: ${selectedPoForView.id}`}
          description="Formal purchase order document authorized for supplier transmission."
          size="lg"
          footer={
            <>
              <Button variant="secondary" onClick={() => setSelectedPoForView(null)}>Close</Button>
              <Button variant="primary" icon={<Printer size={15} />} onClick={() => window.print()}>
                Print / Save PDF
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
                    Dahej SEZ Unit #1, Gujarat • GSTIN: 24AAACS8912P1ZA
                  </div>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <h3 style={{ margin: 0 }}>{selectedPoForView.id}</h3>
                <div style={{ fontSize: '0.6875rem' }}>Dated: {selectedPoForView.date}</div>
              </div>
            </div>

            <div style={{ fontSize: 'var(--font-size-xs)', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8, marginBottom: 12 }}>
              <div><strong>SUPPLIER:</strong> {selectedPoForView.supplierName}<br />GSTIN: {selectedPoForView.gstin}</div>
              <div><strong>SHIP-TO ADDRESS:</strong> {selectedPoForView.deliveryPoint}<br />Ref SO: {selectedPoForView.refSoNumber || 'Plant Replenishment'}</div>
            </div>

            <table className="erp-table">
              <thead>
                <tr>
                  <th>Description</th>
                  <th>HSN</th>
                  <th style={{ textAlign: 'right' }}>Quantity</th>
                  <th style={{ textAlign: 'right' }}>Unit Rate</th>
                  <th style={{ textAlign: 'right' }}>Tax Total</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{selectedPoForView.material} ({selectedPoForView.spec})</td>
                  <td>{selectedPoForView.hsn}</td>
                  <td style={{ textAlign: 'right' }}>{selectedPoForView.qty} {selectedPoForView.uom}</td>
                  <td style={{ textAlign: 'right' }}>₹{selectedPoForView.unitPrice.toLocaleString()}</td>
                  <td style={{ textAlign: 'right', fontWeight: 700 }}>₹{selectedPoForView.totalWithTax.toLocaleString()}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Modal>
      )}

      {/* Book Inward Receipt Modal */}
      {inwardModalPo && (
        <Modal
          isOpen={Boolean(inwardModalPo)}
          onClose={() => setInwardModalPo(null)}
          title={`Inward Receipt: ${inwardModalPo.id}`}
          description={`Receive raw material goods into live plant stock.`}
          size="sm"
          footer={
            <>
              <Button variant="secondary" onClick={() => setInwardModalPo(null)}>Cancel</Button>
              <Button variant="primary" onClick={handleBookInward}>
                Confirm Goods Inward
              </Button>
            </>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div><strong>Material:</strong> {inwardModalPo.material}</div>
            <Input
              label="Received Quantity (MT)"
              type="number"
              value={inwardQty}
              onChange={(e) => setInwardQty(e.target.value)}
            />
            <Input
              label="Road Tanker Vehicle Number"
              value={inwardVehicle}
              onChange={(e) => setInwardVehicle(e.target.value)}
            />
          </div>
        </Modal>
      )}

      {/* Unified Purchase Order Modal (Add & Edit) */}
      <Modal
        isOpen={isPoModalOpen}
        onClose={() => {
          setIsPoModalOpen(false);
          setEditingPoId(null);
        }}
        title={editingPoId ? `Edit Purchase Order: ${editingPoId}` : 'Raise Raw Material Purchase Order (SOL/PO)'}
        description={
          editingPoId
            ? 'Update purchase order indent volume, rate per MT, raw material specs, delivery schedule, and credit terms.'
            : 'Generates incremental SOL/PO series and routes for mandatory HOD review.'
        }
        size="md"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => {
                setIsPoModalOpen(false);
                setEditingPoId(null);
              }}
            >
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSubmitPo}>
              {editingPoId ? 'Save Changes' : 'Submit PO for HOD Sign-off'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmitPo} className="erp-form-grid">
          <div className="erp-col-span-2">
            <Select
              label="Select Supplier (from Master)"
              required
              value={poForm.supplierId}
              onChange={(e) => {
                const s = suppliers.find((sup) => sup.id === e.target.value);
                setPoForm({
                  ...poForm,
                  supplierId: e.target.value,
                  material: s?.productSupplied || poForm.material,
                });
              }}
              options={suppliers.map((s) => ({ value: s.id, label: `${s.companyName} (${s.productSupplied})` }))}
            />
          </div>

          <Input
            label="Raw Material Description"
            required
            value={poForm.material}
            onChange={(e) => setPoForm({ ...poForm, material: e.target.value })}
          />
          <Input
            label="Specification / Grade"
            value={poForm.spec}
            onChange={(e) => setPoForm({ ...poForm, spec: e.target.value })}
          />
          <Input
            label="HSN Code"
            value={poForm.hsn}
            onChange={(e) => setPoForm({ ...poForm, hsn: e.target.value })}
          />
          <Input
            label="Indent Volume (MT)"
            type="number"
            required
            value={poForm.qty}
            onChange={(e) => setPoForm({ ...poForm, qty: e.target.value })}
          />
          <Input
            label="Unit Rate / MT (INR)"
            type="number"
            required
            value={poForm.unitPrice}
            onChange={(e) => setPoForm({ ...poForm, unitPrice: e.target.value })}
          />
          <Input
            label="GST Tax Rate (%)"
            type="number"
            value={poForm.taxPercent}
            onChange={(e) => setPoForm({ ...poForm, taxPercent: e.target.value })}
          />
          <Input
            label="Delivery Schedule"
            value={poForm.deliverySchedule}
            onChange={(e) => setPoForm({ ...poForm, deliverySchedule: e.target.value })}
          />
          <Input
            label="Credit Period"
            value={poForm.creditPeriod}
            onChange={(e) => setPoForm({ ...poForm, creditPeriod: e.target.value })}
          />
          <Input
            label="Delivery Point / Silo"
            value={poForm.deliveryPoint}
            onChange={(e) => setPoForm({ ...poForm, deliveryPoint: e.target.value })}
          />
          <Input
            label="Linked Reference Sales Order (SOL/SO)"
            value={poForm.refSoNumber}
            onChange={(e) => setPoForm({ ...poForm, refSoNumber: e.target.value })}
          />
        </form>
      </Modal>

      {/* Universal Approval Modal */}
      <ApprovalModal
        isOpen={approvalModalState.isOpen}
        onClose={() => setApprovalModalState({ isOpen: false, record: null })}
        targetType="purchase_order"
        record={approvalModalState.record}
      />

      {/* Record Supplier Bill Receipt Modal (Stage 4) */}
      <Modal
        isOpen={Boolean(billReceiptPo)}
        onClose={() => setBillReceiptPo(null)}
        title={billReceiptPo ? `Record Supplier Bill Receipt: ${billReceiptPo.id}` : 'Record Bill Receipt'}
        description="Verify supplier tax invoice against Gate Inward GRN receipt before final commercial clearance."
        size="md"
        footer={
          <>
            <Button variant="secondary" onClick={() => setBillReceiptPo(null)}>Cancel</Button>
            <Button variant="primary" icon={<Receipt size={14} />} onClick={handleSubmitBillReceipt}>
              Log Bill Receipt
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmitBillReceipt} className="erp-form-grid">
          <Input
            label="Supplier Account"
            disabled
            value={billReceiptPo?.supplierName || ''}
          />
          <Input
            label="Raw Material & Volume"
            disabled
            value={`${billReceiptPo?.material || ''} (${billReceiptPo?.receivedQty || billReceiptPo?.qty || 0} MT)`}
          />
          <Input
            label="Supplier Tax Invoice No"
            required
            placeholder="e.g. INV-GACL-8921"
            value={billReceiptForm.invoiceNo}
            onChange={(e) => setBillReceiptForm({ ...billReceiptForm, invoiceNo: e.target.value })}
          />
          <Input
            label="Invoice Date"
            type="date"
            required
            value={billReceiptForm.invoiceDate}
            onChange={(e) => setBillReceiptForm({ ...billReceiptForm, invoiceDate: e.target.value })}
          />
          <Input
            label="Verified Inward GRN Ref"
            required
            placeholder="e.g. GRN-INW-801"
            value={billReceiptForm.grnRef}
            onChange={(e) => setBillReceiptForm({ ...billReceiptForm, grnRef: e.target.value })}
          />
          <Input
            label="Invoice Value with GST (INR)"
            type="number"
            required
            value={billReceiptForm.amount}
            onChange={(e) => setBillReceiptForm({ ...billReceiptForm, amount: e.target.value })}
          />
        </form>
      </Modal>

      {/* Record Payment Term Settlement Modal */}
      <Modal
        isOpen={Boolean(paymentModalPo)}
        onClose={() => setPaymentModalPo(null)}
        title={paymentModalPo ? `Record Payment Term Settlement: ${paymentModalPo.id}` : 'Record Payment'}
        description="Post bank payment advice against PO credit terms. (Orders close at ≥95% paid rule)."
        size="md"
        footer={
          <>
            <Button variant="secondary" onClick={() => setPaymentModalPo(null)}>Cancel</Button>
            <Button variant="primary" icon={<CreditCard size={14} />} onClick={handleSubmitPayment}>
              Post Payment
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmitPayment} className="erp-form-grid">
          <Input
            label="Supplier Beneficiary"
            disabled
            value={paymentModalPo?.supplierName || ''}
          />
          <Input
            label="Agreed Credit Terms"
            disabled
            value={paymentModalPo?.creditPeriod || '30 Days Net from GRN'}
          />
          <Input
            label="Total PO Amount"
            disabled
            value={`₹${(paymentModalPo?.totalWithTax || paymentModalPo?.totalValue || 0).toLocaleString()}`}
          />
          <Input
            label="Currently Paid"
            disabled
            value={`₹${(paymentModalPo?.paidAmount || 0).toLocaleString()} (${Math.round((((paymentModalPo?.paidAmount || 0) / (paymentModalPo?.totalWithTax || 1)) * 100))}% )`}
          />
          <Input
            label="Settlement Amount (INR)"
            type="number"
            required
            value={paymentAmount}
            onChange={(e) => setPaymentAmount(e.target.value)}
          />
          <Input
            label="Bank UTR / CMS Ref"
            required
            value={paymentRef}
            onChange={(e) => setPaymentRef(e.target.value)}
          />
        </form>
      </Modal>
    </div>
  );
}

export default PurchasePage;
