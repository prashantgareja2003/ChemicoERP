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
import { Plus, ArrowDownLeft, ArrowUpRight, Factory, AlertOctagon, HelpCircle, Boxes, Layers, AlertTriangle } from 'lucide-react';

export function InventoryPage() {
  const {
    products,
    stores,
    stock,
    suppliers,
    inwardEntries,
    outwardEntries,
    localMiscEntries,
    storeMissEntries,
    addInwardEntry,
    addOutwardEntry,
    addProductionOutput,
    addLocalMiscEntry,
    addStoreMissEntry,
  } = useErp();

  const [activeTab, setActiveTab] = useState('stock'); // 'stock' | 'inward' | 'outward' | 'misc' | 'miss'

  // Modal states
  const [modalType, setModalType] = useState(null); // 'inward' | 'outward' | 'production' | 'misc' | 'miss'

  // Form states
  const [inwardForm, setInwardForm] = useState({
    productId: '',
    supplier: '',
    quantityKg: '',
    poNo: 'SOL/PO/4411',
    packagingType: 'Bulk Road Tanker',
    vehicleNo: 'GJ-12-BW-9021',
    invoiceNo: 'INV-8891',
    ewayBillNo: '241928491029',
    storeId: 'STORE-1',
  });

  const [outwardForm, setOutwardForm] = useState({
    productId: '',
    quantityKg: '',
    soNo: 'SOL/SO/2891',
    packagingType: 'Bulk Tanker',
    invoiceNo: 'SOL/EXP/0911',
    vehicleNo: 'GJ-16-AX-8921',
    ewayBill: '248901928410',
    pol: 'Dahej Industrial Zone',
    pod: 'Customer Delivery Plant',
  });

  const [prodForm, setProdForm] = useState({
    productId: '',
    quantityKg: 20000,
  });

  const [miscForm, setMiscForm] = useState({
    productName: '',
    value: '',
    askedBy: '',
    purpose: '',
  });

  const [missForm, setMissForm] = useState({
    product: '',
    expectedKg: '',
    foundKg: '',
    reason: '',
  });

  // Stock table data joining product info
  const stockRows = stock.map((s) => {
    const prod = products.find((p) => p.id === s.productId);
    const store = stores.find((st) => st.id === s.storeId);
    return {
      id: s.productId,
      productName: prod?.productName || 'Unknown Material',
      code: prod?.productCode || s.productId,
      type: prod?.type || 'Liquid',
      storeName: store?.name || 'Central Silo',
      stockKg: s.stockKg,
      stockMT: (s.stockKg / 1000).toFixed(1),
      minStockMT: (s.minStockKg / 1000).toFixed(1),
      status: s.stockKg < s.minStockKg ? 'Low Stock' : 'Optimal',
    };
  });

  const stockColumns = [
    {
      key: 'code',
      title: 'Item Code',
      render: (val) => <strong style={{ color: 'var(--color-primary-dark)' }}>{val}</strong>,
    },
    { key: 'productName', title: 'Chemical Description' },
    { key: 'type', title: 'State (Liquid/Powder)' },
    { key: 'storeName', title: 'Designated Silo / Store' },
    {
      key: 'stockMT',
      title: 'Live Stock (MT)',
      align: 'right',
      render: (val) => <strong style={{ fontSize: '0.8125rem' }}>{val} MT</strong>,
    },
    {
      key: 'minStockMT',
      title: 'Safety Minimum (MT)',
      align: 'right',
      render: (val) => `${val} MT`,
    },
    {
      key: 'status',
      title: 'Inventory Health',
      render: (val) => <StatusBadge status={val} />,
    },
  ];

  return (
    <div>
      <PageHeader
        title="Live Inventory & Bulk Feedstock Silos"
        description="Single live stock count fed by 5 operational entry screens: Inward, Outward, Production, Local Misc, and Store Miss."
        actions={
          <div style={{ display: 'flex', gap: 6 }}>
            <Button
              size="sm"
              variant="secondary"
              icon={<ArrowDownLeft size={13} />}
              onClick={() => setModalType('inward')}
            >
              Inward
            </Button>
            <Button
              size="sm"
              variant="secondary"
              icon={<ArrowUpRight size={13} />}
              onClick={() => setModalType('outward')}
            >
              Outward
            </Button>
            <Button
              size="sm"
              variant="primary"
              icon={<Factory size={13} />}
              onClick={() => setModalType('production')}
            >
              Production
            </Button>
          </div>
        }
      />

      {/* 5 Screen Switcher Tabs */}
      <div className="erp-tabs-row">
        <Button
          size="sm"
          variant={activeTab === 'stock' ? 'primary' : 'secondary'}
          icon={<Boxes size={13} />}
          onClick={() => setActiveTab('stock')}
        >
          Live Inventory By Product & Store
        </Button>
        <Button
          size="sm"
          variant={activeTab === 'inward' ? 'primary' : 'secondary'}
          icon={<ArrowDownLeft size={13} />}
          onClick={() => setActiveTab('inward')}
        >
          Inward Gate Receipts ({inwardEntries.length})
        </Button>
        <Button
          size="sm"
          variant={activeTab === 'outward' ? 'primary' : 'secondary'}
          icon={<ArrowUpRight size={13} />}
          onClick={() => setActiveTab('outward')}
        >
          Outward Dispatches ({outwardEntries.length})
        </Button>
        <Button
          size="sm"
          variant={activeTab === 'misc' ? 'primary' : 'secondary'}
          icon={<Layers size={13} />}
          onClick={() => setActiveTab('misc')}
        >
          Local Misc (SOL/MIS) ({localMiscEntries.length})
        </Button>
        <Button
          size="sm"
          variant={activeTab === 'miss' ? 'primary' : 'secondary'}
          icon={<AlertTriangle size={13} />}
          onClick={() => setActiveTab('miss')}
        >
          Store Miss Incidents ({storeMissEntries.length})
        </Button>
      </div>

      {/* Screen 1: Live Stock */}
      {activeTab === 'stock' && (
        <Card title="Real-time Inventory Reserves" subtitle="Automatically updated on Inward, Outward, and Production runs" noPadding>
          <DataTable columns={stockColumns} data={stockRows} keyField="code" />
        </Card>
      )}

      {/* Screen 2: Inward */}
      {activeTab === 'inward' && (
        <Card
          title="Raw Material Inward Records"
          subtitle="Adds to live inventory count"
          actions={
            <Button size="sm" variant="primary" onClick={() => setModalType('inward')}>
              New Inward Receipt
            </Button>
          }
          noPadding
        >
          <table className="erp-table">
            <thead>
              <tr>
                <th>Receipt #</th>
                <th>Product</th>
                <th>Supplier</th>
                <th style={{ textAlign: 'right' }}>Quantity (kg)</th>
                <th>PO Number</th>
                <th>Vehicle #</th>
                <th>Invoice #</th>
                <th>E-Way Bill</th>
              </tr>
            </thead>
            <tbody>
              {inwardEntries.map((inw) => (
                <tr key={inw.id}>
                  <td><strong>{inw.id}</strong></td>
                  <td>{inw.product}</td>
                  <td>{inw.supplier}</td>
                  <td style={{ textAlign: 'right' }}><strong>{(inw.quantityKg).toLocaleString()} kg</strong></td>
                  <td>{inw.poNo}</td>
                  <td>{inw.vehicleNo}</td>
                  <td>{inw.invoiceNo}</td>
                  <td>{inw.ewayBillNo}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {/* Screen 3: Outward */}
      {activeTab === 'outward' && (
        <Card
          title="Consignment Outward Dispatches"
          subtitle="Deducts from live inventory count"
          actions={
            <Button size="sm" variant="primary" onClick={() => setModalType('outward')}>
              New Outward Dispatch
            </Button>
          }
          noPadding
        >
          <table className="erp-table">
            <thead>
              <tr>
                <th>Dispatch #</th>
                <th>Product</th>
                <th style={{ textAlign: 'right' }}>Quantity (kg)</th>
                <th>Sales Order Ref</th>
                <th>Vehicle #</th>
                <th>POL → POD</th>
                <th>E-Way Bill</th>
              </tr>
            </thead>
            <tbody>
              {outwardEntries.map((outw) => (
                <tr key={outw.id}>
                  <td><strong>{outw.id}</strong></td>
                  <td>{outw.product}</td>
                  <td style={{ textAlign: 'right' }}><strong>{(outw.quantityKg).toLocaleString()} kg</strong></td>
                  <td>{outw.soNo}</td>
                  <td>{outw.vehicleNo}</td>
                  <td>{outw.pol} → {outw.pod}</td>
                  <td>{outw.ewayBill}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {/* Screen 4: Local Misc */}
      {activeTab === 'misc' && (
        <Card
          title="Local Miscellaneous Procurement (SOL/MIS Series)"
          subtitle="Off-catalog minor materials and consumables"
          actions={
            <Button size="sm" variant="primary" onClick={() => setModalType('misc')}>
              + New Local Misc (SOL/MIS)
            </Button>
          }
          noPadding
        >
          <table className="erp-table">
            <thead>
              <tr>
                <th>Series Ref #</th>
                <th>Product Description</th>
                <th style={{ textAlign: 'right' }}>Value (INR)</th>
                <th>Created By</th>
                <th>Asked By</th>
                <th>Purpose / Note</th>
              </tr>
            </thead>
            <tbody>
              {localMiscEntries.map((m) => (
                <tr key={m.id}>
                  <td><strong>{m.id}</strong></td>
                  <td>{m.productName}</td>
                  <td style={{ textAlign: 'right' }}><strong>₹{(m.value).toLocaleString()}</strong></td>
                  <td>{m.createdBy}</td>
                  <td>{m.askedBy}</td>
                  <td>{m.purpose}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {/* Screen 5: Store Miss */}
      {activeTab === 'miss' && (
        <Card
          title="Store Miss Discrepancy Log"
          subtitle="Stock expected during audit or production pick but not physically found"
          actions={
            <Button size="sm" variant="danger" onClick={() => setModalType('miss')}>
              Log Store Miss Incident
            </Button>
          }
          noPadding
        >
          <table className="erp-table">
            <thead>
              <tr>
                <th>Incident #</th>
                <th>Product</th>
                <th style={{ textAlign: 'right' }}>Expected</th>
                <th style={{ textAlign: 'right' }}>Found</th>
                <th style={{ textAlign: 'right' }}>Variance</th>
                <th>Reason / Findings</th>
                <th>Logged By</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {storeMissEntries.map((miss) => (
                <tr key={miss.id}>
                  <td><strong>{miss.id}</strong></td>
                  <td>{miss.product}</td>
                  <td style={{ textAlign: 'right' }}>{miss.expectedKg} kg</td>
                  <td style={{ textAlign: 'right' }}>{miss.foundKg} kg</td>
                  <td style={{ textAlign: 'right', color: 'var(--color-error)', fontWeight: 700 }}>
                    {miss.varianceKg} kg
                  </td>
                  <td>{miss.reason}</td>
                  <td>{miss.loggedBy}</td>
                  <td><StatusBadge status="Under Review" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {/* Modal: New Inward Entry */}
      <Modal
        isOpen={modalType === 'inward'}
        onClose={() => setModalType(null)}
        title="Record Inward Raw Material Receipt"
        description="Increases physical stock balance upon weighbridge clearance."
        size="md"
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalType(null)}>Cancel</Button>
            <Button
              variant="primary"
              onClick={() => {
                const prod = products.find((p) => p.id === inwardForm.productId) || products[0];
                addInwardEntry({
                  ...inwardForm,
                  product: prod.productName,
                  productId: prod.id,
                });
                setModalType(null);
              }}
            >
              Post to Inventory
            </Button>
          </>
        }
      >
        <div className="erp-form-grid">
          <Select
            label="Product (from Master)"
            value={inwardForm.productId}
            onChange={(e) => setInwardForm({ ...inwardForm, productId: e.target.value })}
            options={products.map((p) => ({ value: p.id, label: p.productName }))}
          />
          <Select
            label="Supplier (from Master)"
            value={inwardForm.supplier}
            onChange={(e) => setInwardForm({ ...inwardForm, supplier: e.target.value })}
            options={suppliers.map((s) => ({ value: s.companyName, label: s.companyName }))}
          />
          <Input
            label="Quantity Inward (kg)"
            type="number"
            value={inwardForm.quantityKg}
            onChange={(e) => setInwardForm({ ...inwardForm, quantityKg: e.target.value })}
          />
          <Input
            label="PO Number (or Local)"
            value={inwardForm.poNo}
            onChange={(e) => setInwardForm({ ...inwardForm, poNo: e.target.value })}
          />
          <Input
            label="Vehicle Tanker Number"
            value={inwardForm.vehicleNo}
            onChange={(e) => setInwardForm({ ...inwardForm, vehicleNo: e.target.value })}
          />
          <Input
            label="E-Way Bill Number"
            value={inwardForm.ewayBillNo}
            onChange={(e) => setInwardForm({ ...inwardForm, ewayBillNo: e.target.value })}
          />
        </div>
      </Modal>

      {/* Modal: New Outward Entry */}
      <Modal
        isOpen={modalType === 'outward'}
        onClose={() => setModalType(null)}
        title="Record Outward Dispatch"
        description="Deducts stock balance upon gate pass release."
        size="md"
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalType(null)}>Cancel</Button>
            <Button
              variant="primary"
              onClick={() => {
                const prod = products.find((p) => p.id === outwardForm.productId) || products[0];
                addOutwardEntry({
                  ...outwardForm,
                  product: prod.productName,
                  productId: prod.id,
                });
                setModalType(null);
              }}
            >
              Deduct & Release Gate Pass
            </Button>
          </>
        }
      >
        <div className="erp-form-grid">
          <Select
            label="Product"
            value={outwardForm.productId}
            onChange={(e) => setOutwardForm({ ...outwardForm, productId: e.target.value })}
            options={products.map((p) => ({ value: p.id, label: p.productName }))}
          />
          <Input
            label="Quantity Outward (kg)"
            type="number"
            value={outwardForm.quantityKg}
            onChange={(e) => setOutwardForm({ ...outwardForm, quantityKg: e.target.value })}
          />
          <Input
            label="Sales Order Ref"
            value={outwardForm.soNo}
            onChange={(e) => setOutwardForm({ ...outwardForm, soNo: e.target.value })}
          />
          <Input
            label="Tanker Vehicle Number"
            value={outwardForm.vehicleNo}
            onChange={(e) => setOutwardForm({ ...outwardForm, vehicleNo: e.target.value })}
          />
          <Input
            label="Port of Loading (POL)"
            value={outwardForm.pol}
            onChange={(e) => setOutwardForm({ ...outwardForm, pol: e.target.value })}
          />
          <Input
            label="Port of Discharge (POD)"
            value={outwardForm.pod}
            onChange={(e) => setOutwardForm({ ...outwardForm, pod: e.target.value })}
          />
        </div>
      </Modal>

      {/* Modal: Daily Production Entry */}
      <Modal
        isOpen={modalType === 'production'}
        onClose={() => setModalType(null)}
        title="Record Daily Production Output"
        description="Adds synthesized chemical output into finished inventory."
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalType(null)}>Cancel</Button>
            <Button
              variant="primary"
              onClick={() => {
                const prod = products.find((p) => p.id === prodForm.productId) || products[0];
                addProductionOutput({
                  productId: prod.id,
                  productName: prod.productName,
                  quantityKg: prodForm.quantityKg,
                });
                setModalType(null);
              }}
            >
              Post Output to Stock
            </Button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Select
            label="Synthesized Chemical Product"
            value={prodForm.productId}
            onChange={(e) => setProdForm({ ...prodForm, productId: e.target.value })}
            options={products.map((p) => ({ value: p.id, label: p.productName }))}
          />
          <Input
            label="Quantity Produced (kg)"
            type="number"
            value={prodForm.quantityKg}
            onChange={(e) => setProdForm({ ...prodForm, quantityKg: e.target.value })}
          />
        </div>
      </Modal>

      {/* Modal: Local Misc (SOL/MIS) */}
      <Modal
        isOpen={modalType === 'misc'}
        onClose={() => setModalType(null)}
        title="Create Local Misc Entry (SOL/MIS/XXXX)"
        description="Minor off-catalog chemical additives and workshop consumables."
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalType(null)}>Cancel</Button>
            <Button
              variant="primary"
              onClick={() => {
                addLocalMiscEntry(miscForm);
                setModalType(null);
              }}
            >
              Generate SOL/MIS Entry
            </Button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <Input
            label="Product / Item Description"
            required
            value={miscForm.productName}
            onChange={(e) => setMiscForm({ ...miscForm, productName: e.target.value })}
          />
          <Input
            label="Value (INR)"
            type="number"
            required
            value={miscForm.value}
            onChange={(e) => setMiscForm({ ...miscForm, value: e.target.value })}
          />
          <Input
            label="Asked By (Requisitioner)"
            required
            value={miscForm.askedBy}
            onChange={(e) => setMiscForm({ ...miscForm, askedBy: e.target.value })}
          />
          <Input
            label="Operational Purpose"
            value={miscForm.purpose}
            onChange={(e) => setMiscForm({ ...miscForm, purpose: e.target.value })}
          />
        </div>
      </Modal>

      {/* Modal: Store Miss */}
      <Modal
        isOpen={modalType === 'miss'}
        onClose={() => setModalType(null)}
        title="Log Store Miss Incident"
        description="Stock expected on system but physically absent during picking/audit."
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalType(null)}>Cancel</Button>
            <Button
              variant="danger"
              onClick={() => {
                addStoreMissEntry({
                  ...missForm,
                  varianceKg: Number(missForm.foundKg || 0) - Number(missForm.expectedKg || 0),
                });
                setModalType(null);
              }}
            >
              Submit for Investigation
            </Button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <Input
            label="Material Name"
            required
            value={missForm.product}
            onChange={(e) => setMissForm({ ...missForm, product: e.target.value })}
          />
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
          <Input
            label="Reason / Root Cause"
            required
            placeholder="e.g. Bag puncture, unrecorded charge into Reactor R-102..."
            value={missForm.reason}
            onChange={(e) => setMissForm({ ...missForm, reason: e.target.value })}
          />
        </div>
      </Modal>
    </div>
  );
}

export default InventoryPage;
