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
import { Plus, Trash2, Users, Database, Building2, Package, Pencil } from 'lucide-react';

export function MastersPage() {
  const {
    customers,
    suppliers,
    products,
    users,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    addSupplier,
    updateSupplier,
    deleteSupplier,
    addProduct,
    updateProduct,
    deleteProduct,
    addUser,
    updateUser,
    deleteUser,
  } = useErp();

  const [activeTab, setActiveTab] = useState('customers'); // 'customers' | 'suppliers' | 'products' | 'users'
  const [modalType, setModalType] = useState(null); // 'customer' | 'supplier' | 'product' | 'user'
  const [editingItem, setEditingItem] = useState(null);

  // Forms
  const [customerForm, setCustomerForm] = useState({
    companyName: '',
    customerName: '',
    email: '',
    contact: '',
    billingAddress: '',
    deliveryAddress: '',
    gstin: '',
    vatRegNo: '',
    agreedPaymentTerms: '30 Days Net',
  });

  const [supplierForm, setSupplierForm] = useState({
    companyName: '',
    productSupplied: '',
    contact: '',
    email: '',
    gstin: '',
    tan: '',
    address: '',
    constitution: 'Private Limited Company',
    paymentTerms: '30 Days Net',
  });

  const [productForm, setProductForm] = useState({
    productName: '',
    type: 'Liquid',
    grade: 'Pharma / Food Grade',
    packSize: '250 kg Drum / Bulk Tanker',
    uom: 'MT',
    rate: 95000,
  });

  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    role: 'Sales',
    dept: 'Commercial Operations',
  });

  const handleOpenAddModal = (type) => {
    setEditingItem(null);
    if (type === 'customer') {
      setCustomerForm({
        companyName: '',
        customerName: '',
        email: '',
        contact: '',
        billingAddress: '',
        deliveryAddress: '',
        gstin: '',
        vatRegNo: '',
        agreedPaymentTerms: '30 Days Net',
      });
    } else if (type === 'supplier') {
      setSupplierForm({
        companyName: '',
        productSupplied: '',
        contact: '',
        email: '',
        gstin: '',
        tan: '',
        address: '',
        constitution: 'Private Limited Company',
        paymentTerms: '30 Days Net',
      });
    } else if (type === 'product') {
      setProductForm({
        productName: '',
        type: 'Liquid',
        grade: 'Pharma / Food Grade',
        packSize: '250 kg Drum / Bulk Tanker',
        uom: 'MT',
        rate: 95000,
      });
    } else if (type === 'user') {
      setUserForm({
        name: '',
        email: '',
        role: 'Sales',
        dept: 'Commercial Operations',
      });
    }
    setModalType(type);
  };

  const handleEditCustomer = (c) => {
    setEditingItem(c);
    setCustomerForm({
      companyName: c.companyName || '',
      customerName: c.customerName || '',
      email: c.email || '',
      contact: c.contact || '',
      billingAddress: c.billingAddress || '',
      deliveryAddress: c.deliveryAddress || '',
      gstin: c.gstin || '',
      vatRegNo: c.vatRegNo || '',
      agreedPaymentTerms: c.agreedPaymentTerms || '30 Days Net',
    });
    setModalType('customer');
  };

  const handleEditSupplier = (s) => {
    setEditingItem(s);
    setSupplierForm({
      companyName: s.companyName || '',
      productSupplied: s.productSupplied || '',
      contact: s.contact || '',
      email: s.email || '',
      gstin: s.gstin || '',
      tan: s.tan || '',
      address: s.address || '',
      constitution: s.constitution || 'Private Limited Company',
      paymentTerms: s.paymentTerms || '30 Days Net',
    });
    setModalType('supplier');
  };

  const handleEditProduct = (p) => {
    setEditingItem(p);
    setProductForm({
      productName: p.productName || '',
      type: p.type || 'Liquid',
      grade: p.grade || 'Pharma / Food Grade',
      packSize: p.packSize || '250 kg Drum / Bulk Tanker',
      uom: p.uom || 'MT',
      rate: p.rate || 95000,
    });
    setModalType('product');
  };

  const handleEditUser = (u) => {
    setEditingItem(u);
    setUserForm({
      name: u.name || '',
      email: u.email || '',
      role: u.role || 'Sales',
      dept: u.dept || 'Commercial Operations',
    });
    setModalType('user');
  };

  return (
    <div>
      <PageHeader
        title="Enterprise Masters Registry & User Access Control"
        description="Administer master records (Customer, Supplier, Product BOM) and user role authorizations. Dynamic items immediately populate all operational form dropdowns."
        actions={
          <Button
            variant="primary"
            icon={<Plus size={15} />}
            onClick={() => handleOpenAddModal(activeTab === 'customers' ? 'customer' : activeTab === 'suppliers' ? 'supplier' : activeTab === 'products' ? 'product' : 'user')}
          >
            Add New {activeTab === 'customers' ? 'Customer' : activeTab === 'suppliers' ? 'Supplier' : activeTab === 'products' ? 'Product' : 'User'}
          </Button>
        }
      />

      {/* Tabs */}
      <div className="erp-tabs-row">
        <Button
          size="sm"
          variant={activeTab === 'customers' ? 'primary' : 'secondary'}
          onClick={() => setActiveTab('customers')}
          icon={<Building2 size={13} />}
        >
          Customer Master ({customers.length})
        </Button>
        <Button
          size="sm"
          variant={activeTab === 'suppliers' ? 'primary' : 'secondary'}
          onClick={() => setActiveTab('suppliers')}
          icon={<Database size={13} />}
        >
          Supplier Master ({suppliers.length})
        </Button>
        <Button
          size="sm"
          variant={activeTab === 'products' ? 'primary' : 'secondary'}
          onClick={() => setActiveTab('products')}
          icon={<Package size={13} />}
        >
          Product Master & Rates ({products.length})
        </Button>
        <Button
          size="sm"
          variant={activeTab === 'users' ? 'primary' : 'secondary'}
          onClick={() => setActiveTab('users')}
          icon={<Users size={13} />}
        >
          Users & Roles ({users.length})
        </Button>
      </div>

      {/* Tab 1: Customers */}
      {activeTab === 'customers' && (
        <Card title="Customer Accounts Master Directory" noPadding>
          <table className="erp-table">
            <thead>
              <tr>
                <th>Account ID</th>
                <th>Company Name</th>
                <th>Contact Person</th>
                <th>GSTIN</th>
                <th>Delivery Location</th>
                <th>Payment Terms</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c.id}>
                  <td><strong>{c.id}</strong></td>
                  <td><strong>{c.companyName}</strong><div style={{ fontSize: '0.6875rem', color: 'var(--color-text-secondary)' }}>{c.email}</div></td>
                  <td>{c.customerName}<div style={{ fontSize: '0.6875rem', color: 'var(--color-text-secondary)' }}>{c.contact}</div></td>
                  <td>{c.gstin}</td>
                  <td>{c.deliveryAddress?.substring(0, 40)}...</td>
                  <td><span style={{ fontWeight: 600 }}>{c.agreedPaymentTerms}</span></td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                      <Button
                        size="sm"
                        variant="secondary"
                        icon={<Pencil size={12} />}
                        onClick={() => handleEditCustomer(c)}
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        style={{ color: 'var(--color-error)' }}
                        icon={<Trash2 size={13} />}
                        onClick={() => deleteCustomer(c.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {/* Tab 2: Suppliers */}
      {activeTab === 'suppliers' && (
        <Card title="Raw Material Supplier Master" noPadding>
          <table className="erp-table">
            <thead>
              <tr>
                <th>Supplier ID</th>
                <th>Company Name</th>
                <th>Product Supplied</th>
                <th>GSTIN / TAN</th>
                <th>Constitution</th>
                <th>Payment Terms</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {suppliers.map((s) => (
                <tr key={s.id}>
                  <td><strong>{s.id}</strong></td>
                  <td><strong>{s.companyName}</strong><div style={{ fontSize: '0.6875rem', color: 'var(--color-text-secondary)' }}>{s.email}</div></td>
                  <td><strong style={{ color: 'var(--color-primary-dark)' }}>{s.productSupplied}</strong></td>
                  <td>{s.gstin}<div style={{ fontSize: '0.6875rem', color: 'var(--color-text-secondary)' }}>TAN: {s.tan}</div></td>
                  <td>{s.constitution}</td>
                  <td>{s.paymentTerms}</td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                      <Button
                        size="sm"
                        variant="secondary"
                        icon={<Pencil size={12} />}
                        onClick={() => handleEditSupplier(s)}
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        style={{ color: 'var(--color-error)' }}
                        icon={<Trash2 size={13} />}
                        onClick={() => deleteSupplier(s.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {/* Tab 3: Products */}
      {activeTab === 'products' && (
        <Card title="Chemical Item Specifications & Standard Price List" noPadding>
          <table className="erp-table">
            <thead>
              <tr>
                <th>Product Code</th>
                <th>Product Description</th>
                <th>Physical State</th>
                <th>Standard Grade</th>
                <th>Packaging Size</th>
                <th style={{ textAlign: 'right' }}>Rate / MT (INR)</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id}>
                  <td><strong>{p.productCode}</strong></td>
                  <td><strong>{p.productName}</strong></td>
                  <td>
                    <span
                      style={{
                        padding: '2px 7px',
                        borderRadius: 'var(--radius-pill)',
                        fontSize: '0.6875rem',
                        fontWeight: 600,
                        background: p.type === 'Liquid' ? 'var(--color-info-bg)' : 'var(--color-warning-bg)',
                        color: p.type === 'Liquid' ? 'var(--color-info)' : 'var(--color-warning)',
                      }}
                    >
                      {p.type}
                    </span>
                  </td>
                  <td>{p.grade}</td>
                  <td>{p.packSize}</td>
                  <td style={{ textAlign: 'right', fontWeight: 700 }}>₹{Number(p.rate).toLocaleString()}</td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                      <Button
                        size="sm"
                        variant="secondary"
                        icon={<Pencil size={12} />}
                        onClick={() => handleEditProduct(p)}
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        style={{ color: 'var(--color-error)' }}
                        icon={<Trash2 size={13} />}
                        onClick={() => deleteProduct(p.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {/* Tab 4: Users */}
      {activeTab === 'users' && (
        <Card title="Enterprise User Credentials & Job Role Access" noPadding>
          <table className="erp-table">
            <thead>
              <tr>
                <th>User ID</th>
                <th>Full Name</th>
                <th>Corporate Email</th>
                <th>Department</th>
                <th>Assigned System Role</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td><strong>{u.id}</strong></td>
                  <td><strong>{u.name}</strong></td>
                  <td>{u.email}</td>
                  <td>{u.dept}</td>
                  <td>
                    <span
                      style={{
                        padding: '2px 8px',
                        borderRadius: 'var(--radius-pill)',
                        fontSize: '0.6875rem',
                        fontWeight: 700,
                        background: 'var(--color-primary-light)',
                        color: 'var(--color-primary-dark)',
                        border: '1px solid var(--color-primary-soft-border)',
                      }}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                      <Button
                        size="sm"
                        variant="secondary"
                        icon={<Pencil size={12} />}
                        onClick={() => handleEditUser(u)}
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        style={{ color: 'var(--color-error)' }}
                        icon={<Trash2 size={13} />}
                        onClick={() => deleteUser(u.id)}
                      >
                        Deactivate
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {/* Modal: Customer (Add / Edit) */}
      <Modal
        isOpen={modalType === 'customer'}
        onClose={() => { setModalType(null); setEditingItem(null); }}
        title={editingItem ? `Edit Customer: ${editingItem.companyName}` : 'Add Customer Master Record'}
        description={editingItem ? 'Update company details, delivery location, GSTIN, and payment terms.' : 'New customer will immediately appear in quotation and sales order dropdowns.'}
        size="md"
        footer={
          <>
            <Button variant="secondary" onClick={() => { setModalType(null); setEditingItem(null); }}>Cancel</Button>
            <Button
              variant="primary"
              onClick={() => {
                if (editingItem) {
                  updateCustomer(editingItem.id, customerForm);
                } else {
                  addCustomer(customerForm);
                }
                setModalType(null);
                setEditingItem(null);
              }}
            >
              {editingItem ? 'Save Changes' : 'Save Customer'}
            </Button>
          </>
        }
      >
        <div className="erp-form-grid">
          <Input
            label="Company Name"
            required
            value={customerForm.companyName}
            onChange={(e) => setCustomerForm({ ...customerForm, companyName: e.target.value })}
          />
          <Input
            label="Customer Contact Person"
            required
            value={customerForm.customerName}
            onChange={(e) => setCustomerForm({ ...customerForm, customerName: e.target.value })}
          />
          <Input
            label="Email"
            required
            value={customerForm.email}
            onChange={(e) => setCustomerForm({ ...customerForm, email: e.target.value })}
          />
          <Input
            label="Contact Number"
            value={customerForm.contact}
            onChange={(e) => setCustomerForm({ ...customerForm, contact: e.target.value })}
          />
          <Input
            label="GSTIN Number"
            required
            value={customerForm.gstin}
            onChange={(e) => setCustomerForm({ ...customerForm, gstin: e.target.value })}
          />
          <Input
            label="VAT Reg No"
            value={customerForm.vatRegNo}
            onChange={(e) => setCustomerForm({ ...customerForm, vatRegNo: e.target.value })}
          />
          <Input
            label="Agreed Payment Terms"
            value={customerForm.agreedPaymentTerms}
            onChange={(e) => setCustomerForm({ ...customerForm, agreedPaymentTerms: e.target.value })}
          />
          <Input
            label="Delivery Address"
            value={customerForm.deliveryAddress}
            onChange={(e) => setCustomerForm({ ...customerForm, deliveryAddress: e.target.value })}
          />
        </div>
      </Modal>

      {/* Modal: Supplier (Add / Edit) */}
      <Modal
        isOpen={modalType === 'supplier'}
        onClose={() => { setModalType(null); setEditingItem(null); }}
        title={editingItem ? `Edit Supplier: ${editingItem.companyName}` : 'Add Supplier Master Record'}
        description={editingItem ? 'Update supplier contact details, products supplied, and GSTIN.' : 'New supplier will populate purchase order indents.'}
        size="md"
        footer={
          <>
            <Button variant="secondary" onClick={() => { setModalType(null); setEditingItem(null); }}>Cancel</Button>
            <Button
              variant="primary"
              onClick={() => {
                if (editingItem) {
                  updateSupplier(editingItem.id, supplierForm);
                } else {
                  addSupplier(supplierForm);
                }
                setModalType(null);
                setEditingItem(null);
              }}
            >
              {editingItem ? 'Save Changes' : 'Save Supplier'}
            </Button>
          </>
        }
      >
        <div className="erp-form-grid">
          <Input
            label="Supplier Company Name"
            required
            value={supplierForm.companyName}
            onChange={(e) => setSupplierForm({ ...supplierForm, companyName: e.target.value })}
          />
          <Input
            label="Products Supplied (Name of Product)"
            required
            value={supplierForm.productSupplied}
            onChange={(e) => setSupplierForm({ ...supplierForm, productSupplied: e.target.value })}
          />
          <Input
            label="GSTIN Number"
            required
            value={supplierForm.gstin}
            onChange={(e) => setSupplierForm({ ...supplierForm, gstin: e.target.value })}
          />
          <Input
            label="TAN Number"
            value={supplierForm.tan}
            onChange={(e) => setSupplierForm({ ...supplierForm, tan: e.target.value })}
          />
          <Input
            label="Contact Phone"
            value={supplierForm.contact}
            onChange={(e) => setSupplierForm({ ...supplierForm, contact: e.target.value })}
          />
          <Input
            label="Constitution"
            value={supplierForm.constitution}
            onChange={(e) => setSupplierForm({ ...supplierForm, constitution: e.target.value })}
          />
        </div>
      </Modal>

      {/* Modal: Product (Add / Edit) */}
      <Modal
        isOpen={modalType === 'product'}
        onClose={() => { setModalType(null); setEditingItem(null); }}
        title={editingItem ? `Edit Product: ${editingItem.productName}` : 'Add Chemical Product Master'}
        description={editingItem ? 'Update product physical state, packaging, grade, and rate.' : 'Creates product code, physical state, packaging, and rate.'}
        size="md"
        footer={
          <>
            <Button variant="secondary" onClick={() => { setModalType(null); setEditingItem(null); }}>Cancel</Button>
            <Button
              variant="primary"
              onClick={() => {
                if (editingItem) {
                  updateProduct(editingItem.id, productForm);
                } else {
                  addProduct(productForm);
                }
                setModalType(null);
                setEditingItem(null);
              }}
            >
              {editingItem ? 'Save Changes' : 'Save Chemical Product'}
            </Button>
          </>
        }
      >
        <div className="erp-form-grid">
          <Input
            label="Product Name"
            required
            value={productForm.productName}
            onChange={(e) => setProductForm({ ...productForm, productName: e.target.value })}
          />
          <Select
            label="Type (Physical State)"
            value={productForm.type}
            onChange={(e) => setProductForm({ ...productForm, type: e.target.value })}
            options={[
              { value: 'Liquid', label: 'Liquid' },
              { value: 'Powder', label: 'Powder' },
            ]}
          />
          <Input
            label="Chemical Grade"
            value={productForm.grade}
            onChange={(e) => setProductForm({ ...productForm, grade: e.target.value })}
          />
          <Input
            label="Standard Pack Size"
            value={productForm.packSize}
            onChange={(e) => setProductForm({ ...productForm, packSize: e.target.value })}
          />
          <Input
            label="Standard Rate / MT (INR)"
            type="number"
            required
            value={productForm.rate}
            onChange={(e) => setProductForm({ ...productForm, rate: e.target.value })}
          />
        </div>
      </Modal>

      {/* Modal: User (Add / Edit) */}
      <Modal
        isOpen={modalType === 'user'}
        onClose={() => { setModalType(null); setEditingItem(null); }}
        title={editingItem ? `Edit User: ${editingItem.name}` : 'Create New System User'}
        description={editingItem ? 'Update full name, email, department, or assigned role.' : 'Assign role permissions: Admin, Prod, Logistics, Sales, Finance, HOD, QC/QA, Management.'}
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => { setModalType(null); setEditingItem(null); }}>Cancel</Button>
            <Button
              variant="primary"
              onClick={() => {
                if (editingItem) {
                  updateUser(editingItem.id, userForm);
                } else {
                  addUser(userForm);
                }
                setModalType(null);
                setEditingItem(null);
              }}
            >
              {editingItem ? 'Save Changes' : 'Create User'}
            </Button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <Input
            label="User Full Name"
            required
            value={userForm.name}
            onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
          />
          <Input
            label="Email Address"
            required
            value={userForm.email}
            onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
          />
          <Select
            label="System Role"
            value={userForm.role}
            onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
            options={[
              { value: 'Admin', label: 'Admin (Full System Control)' },
              { value: 'HOD', label: 'HOD (Approver for Quotes, SO, PO & QC)' },
              { value: 'Sales', label: 'Sales (Quotes & Sales Orders)' },
              { value: 'Prod', label: 'Prod (Production & Plant Yield)' },
              { value: 'QC/QA', label: 'QC/QA (Laboratory Monograph & OCAP)' },
              { value: 'Logistics', label: 'Logistics (Road Tanker Fleet & Gate Pass)' },
              { value: 'Finance', label: 'Finance (Invoicing & Settlement)' },
              { value: 'Management', label: 'Management (Executive Oversight)' },
            ]}
          />
          <Input
            label="Department"
            value={userForm.dept}
            onChange={(e) => setUserForm({ ...userForm, dept: e.target.value })}
          />
        </div>
      </Modal>
    </div>
  );
}

export default MastersPage;
