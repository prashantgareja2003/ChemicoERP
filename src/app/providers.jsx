import { useState, useCallback } from 'react';
import { ErpContext } from '../hooks/useErp';
import {
  INITIAL_USERS,
  INITIAL_CUSTOMERS,
  INITIAL_SUPPLIERS,
  INITIAL_PRODUCTS,
  INITIAL_STORES,
  INITIAL_STOCK,
  INITIAL_QUOTATIONS,
  INITIAL_SALES_ORDERS,
  INITIAL_PURCHASE_ORDERS,
  INITIAL_INWARD_ENTRIES,
  INITIAL_OUTWARD_ENTRIES,
  INITIAL_LOCAL_MISC,
  INITIAL_STORE_MISS,
  INITIAL_QC_RECORDS,
  INITIAL_LOGISTICS_TASKS,
  INITIAL_INVOICES,
} from '../services/erpStore';

export function ErpProvider({ children }) {
  // Authentication & Active User / Role State
  // On run project, user starts unauthenticated so login page opens first
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    try {
      const stored = localStorage.getItem('sdf_auth');
      return stored ? Boolean(JSON.parse(stored).isAuthenticated) : false;
    } catch {
      return false;
    }
  });

  const [users, setUsers] = useState(INITIAL_USERS);
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const stored = localStorage.getItem('sdf_auth');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.user) return parsed.user;
      }
    } catch {
      // fallback
    }
    return INITIAL_USERS[0]; // Default Rajesh Sharma (HOD)
  });

  const [activePlant, setActivePlant] = useState('Dahej Oleo Plant #1');

  const login = useCallback((userData) => {
    const userObj = {
      id: userData.id || `USR-${Date.now().toString().slice(-4)}`,
      name: userData.name || 'Enterprise User',
      email: userData.email || `${(userData.name || 'user').toLowerCase().replace(/\s+/g, '.')}@sdfoilchems.com`,
      role: userData.role || 'Admin',
      dept: userData.dept || (userData.role === 'Admin' ? 'System Administration' : `${userData.role} Department`),
      active: true,
    };
    setCurrentUser(userObj);
    setIsAuthenticated(true);
    try {
      localStorage.setItem('sdf_auth', JSON.stringify({ isAuthenticated: true, user: userObj }));
    } catch {
      // ignore
    }
    return userObj;
  }, []);

  const logout = useCallback(() => {
    setIsAuthenticated(false);
    try {
      localStorage.removeItem('sdf_auth');
    } catch {
      // ignore
    }
  }, []);

  // Master Data
  const [customers, setCustomers] = useState(INITIAL_CUSTOMERS);
  const [suppliers, setSuppliers] = useState(INITIAL_SUPPLIERS);
  const [products, setProducts] = useState(INITIAL_PRODUCTS);
  const [stores] = useState(INITIAL_STORES);

  // Live Inventory State
  const [stock, setStock] = useState(INITIAL_STOCK);
  const [inwardEntries, setInwardEntries] = useState(INITIAL_INWARD_ENTRIES);
  const [outwardEntries, setOutwardEntries] = useState(INITIAL_OUTWARD_ENTRIES);
  const [localMiscEntries, setLocalMiscEntries] = useState(INITIAL_LOCAL_MISC);
  const [storeMissEntries, setStoreMissEntries] = useState(INITIAL_STORE_MISS);

  // Operational State
  const [quotations, setQuotations] = useState(INITIAL_QUOTATIONS);
  const [salesOrders, setSalesOrders] = useState(INITIAL_SALES_ORDERS);
  const [purchaseOrders, setPurchaseOrders] = useState(INITIAL_PURCHASE_ORDERS);
  const [qcRecords, setQcRecords] = useState(INITIAL_QC_RECORDS);
  const [logisticsTasks, setLogisticsTasks] = useState(INITIAL_LOGISTICS_TASKS);
  const [invoices, setInvoices] = useState(INITIAL_INVOICES);

  // Notification Queue
  const [notification, setNotification] = useState(null);

  const dismissNotification = useCallback(() => {
    setNotification(null);
  }, []);

  const notify = useCallback((message, type = 'success') => {
    setNotification({ id: Date.now(), message, type });
    setTimeout(() => {
      setNotification((prev) => (prev?.message === message ? null : prev));
    }, 4000);
  }, []);

  // Auto-Numbering Generators
  const getNextNumber = useCallback((type) => {
    const pad = (num, size = 4) => String(num).padStart(size, '0');
    switch (type) {
      case 'quotation': {
        const next = quotations.length + 1042;
        return `SOL/Q/${next}`;
      }
      case 'sales_order': {
        const next = salesOrders.length + 2891;
        return `SOL/SO/${next}`;
      }
      case 'purchase_order': {
        const next = purchaseOrders.length + 4412;
        return `SOL/PO/${next}`;
      }
      case 'invoice': {
        const next = invoices.length + 911;
        return `SOL/EXP/${pad(next, 4)}`;
      }
      case 'local_misc': {
        const next = localMiscEntries.length + 314;
        return `SOL/MIS/${pad(next, 4)}`;
      }
      default:
        return `SOL/GEN/${Date.now().toString().slice(-4)}`;
    }
  }, [quotations.length, salesOrders.length, purchaseOrders.length, invoices.length, localMiscEntries.length]);

  // Master Management
  const addCustomer = useCallback((customerData) => {
    const newCust = { id: `CUST-${Date.now().toString().slice(-3)}`, ...customerData };
    setCustomers((prev) => [newCust, ...prev]);
    notify(`Customer ${customerData.companyName} registered in master registry.`);
    return newCust;
  }, [notify]);

  const deleteCustomer = useCallback((id) => {
    setCustomers((prev) => prev.filter((c) => c.id !== id));
    notify('Customer record removed from master.');
  }, [notify]);

  const addSupplier = useCallback((supplierData) => {
    const newSupp = { id: `SUPP-${Date.now().toString().slice(-3)}`, ...supplierData };
    setSuppliers((prev) => [newSupp, ...prev]);
    notify(`Supplier ${supplierData.companyName} added to master.`);
    return newSupp;
  }, [notify]);

  const deleteSupplier = useCallback((id) => {
    setSuppliers((prev) => prev.filter((s) => s.id !== id));
    notify('Supplier record removed.');
  }, [notify]);

  const addProduct = useCallback((productData) => {
    const newProd = {
      id: `PROD-${Date.now().toString().slice(-3)}`,
      productCode: `SOL-${productData.productName.substring(0, 3).toUpperCase()}-${Date.now().toString().slice(-2)}`,
      ...productData,
    };
    setProducts((prev) => [newProd, ...prev]);
    // Initialize stock entry
    setStock((prev) => [
      ...prev,
      { productId: newProd.id, storeId: 'STORE-1', stockKg: 0, minStockKg: 20000 },
    ]);
    notify(`Product ${productData.productName} added to master inventory catalog.`);
    return newProd;
  }, [notify]);

  const deleteProduct = useCallback((id) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    notify('Product removed from catalog.');
  }, [notify]);

  const addUser = useCallback((userData) => {
    const newUser = { id: `USR-${Date.now().toString().slice(-3)}`, active: true, ...userData };
    setUsers((prev) => [...prev, newUser]);
    notify(`User ${userData.name} created with role ${userData.role}.`);
    return newUser;
  }, [notify]);

  const deleteUser = useCallback((id) => {
    setUsers((prev) => prev.filter((u) => u.id !== id));
    notify('User account deactivated.');
  }, [notify]);

  const updateCustomer = useCallback((id, updatedData) => {
    setCustomers((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updatedData } : c))
    );
    notify(`Customer ${updatedData.companyName || id} updated successfully.`);
  }, [notify]);

  const updateSupplier = useCallback((id, updatedData) => {
    setSuppliers((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updatedData } : s))
    );
    notify(`Supplier ${updatedData.companyName || id} updated successfully.`);
  }, [notify]);

  const updateProduct = useCallback((id, updatedData) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updatedData } : p))
    );
    notify(`Product ${updatedData.productName || id} updated successfully.`);
  }, [notify]);

  const updateUser = useCallback((id, updatedData) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, ...updatedData } : u))
    );
    notify(`User ${updatedData.name || id} details updated.`);
  }, [notify]);

  // Inventory Operations
  const addInwardEntry = useCallback((entry) => {
    const newEntry = { id: `INW-${Date.now().toString().slice(-3)}`, date: new Date().toLocaleString(), ...entry };
    setInwardEntries((prev) => [newEntry, ...prev]);
    // Increase stock
    setStock((prev) =>
      prev.map((s) =>
        s.productId === entry.productId ? { ...s, stockKg: s.stockKg + Number(entry.quantityKg || 0) } : s
      )
    );
    // Link with PO if poNo supplied
    if (entry.poNo) {
      setPurchaseOrders((prev) =>
        prev.map((po) => {
          if (po.id === entry.poNo) {
            const addedMt = Number(entry.quantityKg || 0) / 1000;
            const updatedReceived = (po.receivedQty || 0) + addedMt;
            return {
              ...po,
              receivedQty: updatedReceived,
              stage: 'payment_terms',
              history: [
                ...(po.history || []),
                {
                  date: new Date().toLocaleString(),
                  user: `${currentUser.name} (Stores / Logistics)`,
                  action: `Inward GRN logged (+${addedMt} MT received). Trade progressed to Payment Terms.`,
                },
              ],
            };
          }
          return po;
        })
      );
    }
    notify(`Inward receipt booked for ${entry.product} (+${entry.quantityKg} kg). Live stock updated.`);
  }, [currentUser.name, notify]);

  const addOutwardEntry = useCallback((entry) => {
    const newEntry = { id: `OUT-${Date.now().toString().slice(-3)}`, date: new Date().toLocaleString(), ...entry };
    setOutwardEntries((prev) => [newEntry, ...prev]);
    // Deduct stock
    setStock((prev) =>
      prev.map((s) =>
        s.productId === entry.productId ? { ...s, stockKg: Math.max(0, s.stockKg - Number(entry.quantityKg || 0)) } : s
      )
    );
    notify(`Outward dispatch logged for ${entry.product} (-${entry.quantityKg} kg). Live stock deducted.`);
  }, [notify]);

  const addProductionOutput = useCallback((prodData) => {
    const qtyKg = Number(prodData.quantityKg || 0);
    // Add stock
    setStock((prev) =>
      prev.map((s) =>
        s.productId === prodData.productId ? { ...s, stockKg: s.stockKg + qtyKg } : s
      )
    );
    notify(`Production run logged: +${qtyKg} kg ${prodData.productName}. Added to finished stock.`);
  }, [notify]);

  const addLocalMiscEntry = useCallback((data) => {
    const id = getNextNumber('local_misc');
    const newEntry = { id, date: new Date().toLocaleDateString(), createdBy: currentUser.name, ...data };
    setLocalMiscEntries((prev) => [newEntry, ...prev]);
    notify(`Local Misc Entry ${id} registered.`);
  }, [getNextNumber, currentUser.name, notify]);

  const addStoreMissEntry = useCallback((data) => {
    const newEntry = {
      id: `MISS-${Date.now().toString().slice(-3)}`,
      date: new Date().toLocaleDateString(),
      loggedBy: currentUser.name,
      status: 'Under Investigation',
      ...data,
    };
    setStoreMissEntries((prev) => [newEntry, ...prev]);
    notify(`Store-miss incident ${newEntry.id} logged for investigation.`);
  }, [currentUser.name, notify]);

  // Quotation Management
  const createQuotation = useCallback((quoteData) => {
    const id = getNextNumber('quotation');
    const newQuote = {
      id,
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      fromPlace: 'SDF Oilchems Limited, Dahej Plant #1',
      status: 'awaiting approval',
      convertedSoId: null,
      history: [
        {
          date: new Date().toLocaleString(),
          user: `${currentUser.name} (${currentUser.role})`,
          action: 'Draft Quotation submitted for HOD review',
        },
      ],
      ...quoteData,
    };
    setQuotations((prev) => [newQuote, ...prev]);
    notify(`Quotation ${id} generated and routed to HOD for review.`);
    return newQuote;
  }, [getNextNumber, currentUser.name, currentUser.role, notify]);

  // Convert Approved Quotation to Sales Order
  const convertQuotationToSalesOrder = useCallback((quoteId) => {
    const quote = quotations.find((q) => q.id === quoteId);
    if (!quote) return;
    if (quote.status !== 'approved') {
      notify('Quotation must be approved by HOD before converting to Sales Order.', 'error');
      return;
    }

    const soId = getNextNumber('sales_order');
    const totalVal = quote.items.reduce((sum, item) => sum + (Number(item.unitPrice) * Number(item.qty || 1)), 0);

    const newSo = {
      id: soId,
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      quoteRef: quote.id,
      poRef: `PO-REF-${Date.now().toString().slice(-4)}`,
      fromPlace: 'Dahej Plant #1, Gujarat',
      customerId: quote.customerId,
      customerName: quote.customerName,
      consignee: quote.customerName,
      buyer: quote.customerName,
      orderTerms: 'Ex-Work',
      countryOfOrigin: 'India',
      portOfLoading: 'Dahej / Nhava Sheva (JNPT)',
      portOfDelivery: 'Client Destination',
      items: quote.items.map((it) => ({
        ...it,
        hsn: '29054500',
        spec: 'Standard Monograph Guaranteed',
        total: Number(it.unitPrice) * Number(it.qty || 1),
      })),
      totalValue: totalVal,
      banking: {
        accountName: 'SDF Oilchems Limited',
        accountNumber: '028905001928',
        ifsc: 'HDFC0000289',
        bankName: 'HDFC Bank, Commercial Branch, Dahej',
        intermediaryBank: 'Standard Chartered Bank Mumbai',
        beneficiaryBank: 'HDFC Bank India',
      },
      paymentTerms: quote.paymentTerms || '30 Days Net',
      deliverySchedule: quote.deliverySchedule || 'Immediate Execution',
      preparedBy: `${currentUser.name} (${currentUser.role})`,
      authorizedSign: 'Rajesh Sharma (Plant Head / HOD)',
      status: 'open',
      deliveries: [
        { id: 'D1', qty: quote.items[0]?.qty || 20, status: 'open', vehicleNo: 'TBD', dispatchDate: 'Within 5 Days', invoiced: false, invoiceId: null, paidAmount: 0 },
      ],
      receivedPayment: 0,
      history: [
        {
          date: new Date().toLocaleString(),
          user: `${currentUser.name} (${currentUser.role})`,
          action: `Generated directly from Approved Quotation ${quote.id}`,
        },
      ],
    };

    setSalesOrders((prev) => [newSo, ...prev]);

    // Update quote status to converted
    setQuotations((prev) =>
      prev.map((q) =>
        q.id === quoteId
          ? {
              ...q,
              status: 'converted',
              convertedSoId: soId,
              history: [
                ...q.history,
                { date: new Date().toLocaleString(), user: currentUser.name, action: `Converted to Sales Order ${soId}` },
              ],
            }
          : q
      )
    );

    // Create Logistics Inward Work Order automatically
    const newLogisticsTask = {
      id: `LOG-TSK-${Date.now().toString().slice(-3)}`,
      soNumber: soId,
      deliveryId: 'D1',
      consignee: quote.customerName,
      productName: quote.items[0]?.productName || 'Refined Chemical Grade',
      weightMT: quote.items[0]?.qty || 20,
      hsn: '29054500',
      packaging: quote.items[0]?.packaging || 'Bulk Road Tanker',
      containerType: quote.containerType || 'Insulated Tanker',
      stuffingDate: 'Pending Schedule',
      pol: 'Dahej Industrial Port Zone',
      pod: 'Customer Plant Gate',
      outwardTask: {
        outwardDate: 'Pending Booking',
        line: 'SafeChem Bulk Carriers',
        rateFreight: '₹18,000/run',
        vesselName: 'TBD',
        gateOpen: '07:00 AM',
        cutOff: '11:00 AM',
        loadingDate: 'Pending',
        bol: 'Pending',
        sob: 'Pending',
      },
      stage: 'booking',
      vehicleNo: 'TBD',
      driverContact: 'TBD',
      podUploaded: false,
      history: [
        { date: new Date().toLocaleString(), user: 'System (Auto Trigger)', action: `Inward Work Order generated for ${soId}` },
      ],
    };
    setLogisticsTasks((prev) => [newLogisticsTask, ...prev]);

    notify(`Quotation ${quoteId} converted into Sales Order ${soId}! Logistics work order assigned.`);
    return soId;
  }, [quotations, getNextNumber, currentUser.name, currentUser.role, notify]);

  // Create Direct Sales Order
  const createSalesOrder = useCallback((soData) => {
    const id = getNextNumber('sales_order');
    const totalQty = Number(soData.items?.[0]?.qty || soData.quantity || 40);
    const defaultDeliveries = soData.deliveries || (soData.isMultiDelivery ? [
      { id: 'D1', qty: Math.ceil(totalQty / 2), status: 'open', vehicleNo: 'TBD', dispatchDate: 'Phase 1 (Within 5 Days)', invoiced: false, invoiceId: null, paidAmount: 0 },
      { id: 'D2', qty: Math.floor(totalQty / 2), status: 'open', vehicleNo: 'TBD', dispatchDate: 'Phase 2 (Within 12 Days)', invoiced: false, invoiceId: null, paidAmount: 0 },
    ] : [
      { id: 'D1', qty: totalQty, status: 'open', vehicleNo: 'TBD', dispatchDate: 'Immediate', invoiced: false, invoiceId: null, paidAmount: 0 },
    ]);

    const newSo = {
      id,
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      status: 'open',
      deliveries: defaultDeliveries,
      receivedPayment: 0,
      banking: {
        accountName: 'SDF Oilchems Limited',
        accountNumber: '002105001892',
        ifsc: 'HDFC0000021',
        bankName: 'HDFC Bank, Dahej SEZ Branch',
        intermediaryBank: 'Standard Chartered Bank Mumbai (SCBLINBB)',
        beneficiaryBank: 'HDFC Bank Limited, India',
      },
      history: [
        {
          date: new Date().toLocaleString(),
          user: `${currentUser.name} (${currentUser.role})`,
          action: 'Direct Sales Order Booked',
        },
      ],
      ...soData,
    };
    setSalesOrders((prev) => [newSo, ...prev]);

    // Create Logistics Inward Work Order automatically
    const newLogisticsTask = {
      id: `LOG-TSK-${Date.now().toString().slice(-3)}`,
      soNumber: id,
      deliveryId: 'D1',
      consignee: soData.consignee || soData.customerName || 'Consignee',
      productName: soData.items?.[0]?.productName || 'Refined Chemical Grade',
      weightMT: defaultDeliveries[0]?.qty || totalQty,
      hsn: soData.items?.[0]?.hsn || '29054500',
      packaging: soData.items?.[0]?.packaging || soData.packaging || 'Bulk Road Tanker',
      containerType: soData.containerType || '20ft ISO Tank / FCL',
      stuffingDate: 'Pending Schedule',
      pol: soData.portOfLoading || 'Dahej Port / JNPT',
      pod: soData.portOfDelivery || 'Customer Destination',
      outwardTask: {
        outwardDate: 'Pending Booking',
        line: 'SafeChem Bulk Carriers',
        rateFreight: '₹18,000/run',
        vesselName: 'TBD',
        gateOpen: '07:00 AM',
        cutOff: '11:00 AM',
        loadingDate: 'Pending',
        bol: 'Pending',
        sob: 'Pending',
      },
      stage: 'booking',
      vehicleNo: 'TBD',
      driverContact: 'TBD',
      podUploaded: false,
      history: [
        { date: new Date().toLocaleString(), user: 'System (Auto Trigger)', action: `Inward Work Order generated for ${id}` },
      ],
    };
    setLogisticsTasks((prev) => [newLogisticsTask, ...prev]);

    notify(`Sales Order ${id} created and Logistics Inward Work Order auto-triggered.`);
    return newSo;
  }, [getNextNumber, currentUser.name, currentUser.role, notify]);

  // Create Purchase Order
  const createPurchaseOrder = useCallback((poData) => {
    const id = getNextNumber('purchase_order');
    const taxRate = poData.taxPercent || 18;
    const val = Number(poData.qty || 1) * Number(poData.unitPrice || 0);
    const withTax = val + (val * taxRate) / 100;

    const newPo = {
      id,
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      buyerName: 'SDF Oilchems Limited, Dahej Plant #1',
      totalValue: val,
      totalWithTax: withTax,
      status: 'awaiting approval',
      stage: 'purchase_order',
      hodApproved: false,
      billReceipt: null,
      receivedQty: 0,
      paidAmount: 0,
      history: [
        {
          date: new Date().toLocaleString(),
          user: `${currentUser.name} (${currentUser.role})`,
          action: 'PO Raised and submitted for HOD approval (Stage 1: Purchase Order)',
        },
      ],
      ...poData,
    };
    setPurchaseOrders((prev) => [newPo, ...prev]);
    notify(`Purchase Order ${id} submitted for approval.`);
    return newPo;
  }, [getNextNumber, currentUser.name, currentUser.role, notify]);

  // Update Quotation
  const updateQuotation = useCallback((id, updatedFields) => {
    setQuotations((prev) =>
      prev.map((q) => {
        if (q.id === id) {
          const items = updatedFields.items || q.items;
          const itemsTotal = items ? items.reduce((sum, it) => sum + (Number(it.total) || (Number(it.qty || 0) * Number(it.unitPrice || 0))), 0) : null;
          const itemsQty = items ? items.reduce((sum, it) => sum + Number(it.qty || 0), 0) : null;
          const qty = Number(updatedFields.qty ?? itemsQty ?? q.qty ?? 1);
          const unitPrice = Number(updatedFields.unitPrice ?? (items && items[0]?.unitPrice) ?? q.unitPrice ?? 0);
          const totalValue = Number(updatedFields.totalValue ?? itemsTotal ?? (qty * unitPrice));
          return {
            ...q,
            ...updatedFields,
            items: items || q.items,
            product: updatedFields.product || (items && items[0]?.productName) || q.product,
            qty,
            unitPrice,
            totalValue,
            history: [
              ...(q.history || []),
              {
                date: new Date().toLocaleString(),
                user: `${currentUser.name} (${currentUser.role})`,
                action: 'Quotation modified and updated',
              },
            ],
          };
        }
        return q;
      })
    );
    notify(`Quotation ${id} updated successfully.`);
  }, [currentUser.name, currentUser.role, notify]);

  // Update Sales Order
  const updateSalesOrder = useCallback((id, updatedFields) => {
    setSalesOrders((prev) =>
      prev.map((so) => {
        if (so.id === id) {
          const items = updatedFields.items || so.items;
          const itemsTotal = items ? items.reduce((sum, it) => sum + (Number(it.total) || (Number(it.qty || it.quantity || 0) * Number(it.unitPrice || it.rate || 0))), 0) : null;
          const itemsQty = items ? items.reduce((sum, it) => sum + Number(it.qty || it.quantity || 0), 0) : null;
          const qty = Number(updatedFields.quantity ?? updatedFields.qty ?? itemsQty ?? so.quantity ?? so.qty ?? 1);
          const rate = Number(updatedFields.rate ?? updatedFields.unitPrice ?? (items && items[0] ? (items[0].unitPrice || items[0].rate) : null) ?? so.rate ?? so.unitPrice ?? 0);
          const basic = Number(updatedFields.totalValue ?? itemsTotal ?? (qty * rate));
          const tax = basic * 0.18;
          const totalWithTax = basic + tax;
          return {
            ...so,
            ...updatedFields,
            items: items || so.items,
            product: updatedFields.product || (items && items[0]?.productName) || so.product,
            quantity: qty,
            rate,
            totalValue: basic,
            basicValue: basic,
            taxAmount: tax,
            totalWithTax,
            history: [
              ...(so.history || []),
              {
                date: new Date().toLocaleString(),
                user: `${currentUser.name} (${currentUser.role})`,
                action: 'Sales order details updated',
              },
            ],
          };
        }
        return so;
      })
    );
    notify(`Sales Order ${id} updated successfully.`);
  }, [currentUser.name, currentUser.role, notify]);

  // Update Purchase Order
  const updatePurchaseOrder = useCallback((id, updatedFields) => {
    setPurchaseOrders((prev) =>
      prev.map((po) => {
        if (po.id === id) {
          const qty = Number(updatedFields.qty ?? po.qty ?? 1);
          const unitPrice = Number(updatedFields.unitPrice ?? po.unitPrice ?? 0);
          const taxRate = Number(updatedFields.taxPercent ?? po.taxPercent ?? 18);
          const val = qty * unitPrice;
          const withTax = val + (val * taxRate) / 100;
          return {
            ...po,
            ...updatedFields,
            qty,
            unitPrice,
            totalValue: val,
            totalWithTax: withTax,
            history: [
              ...(po.history || []),
              {
                date: new Date().toLocaleString(),
                user: `${currentUser.name} (${currentUser.role})`,
                action: 'Purchase Order modified',
              },
            ],
          };
        }
        return po;
      })
    );
    notify(`Purchase Order ${id} updated successfully.`);
  }, [currentUser.name, currentUser.role, notify]);

  // Universal Approval Component Handler
  // Supports Quotation, Sales Order, Purchase Order, and Failed QC Check
  // Actions: 'approve', 'reject' (reason required), 'send_back'
  const handleUniversalApproval = useCallback((targetType, targetId, action, reason = '') => {
    const timestamp = new Date().toLocaleString();
    const userSignature = `${currentUser.name} (${currentUser.role})`;

    const actionText =
      action === 'approve'
        ? 'Approved'
        : action === 'reject'
        ? `Rejected: ${reason}`
        : `Sent Back for Revision: ${reason}`;

    if (targetType === 'quotation') {
      setQuotations((prev) =>
        prev.map((q) => {
          if (q.id === targetId) {
            return {
              ...q,
              status: action === 'approve' ? 'approved' : action === 'reject' ? 'lost' : 'draft',
              history: [...q.history, { date: timestamp, user: userSignature, action: actionText }],
            };
          }
          return q;
        })
      );
    } else if (targetType === 'sales_order') {
      setSalesOrders((prev) =>
        prev.map((so) => {
          if (so.id === targetId) {
            return {
              ...so,
              status: action === 'approve' ? 'in production' : action === 'reject' ? 'cancelled' : 'open',
              history: [...so.history, { date: timestamp, user: userSignature, action: actionText }],
            };
          }
          return so;
        })
      );
    } else if (targetType === 'purchase_order') {
      setPurchaseOrders((prev) =>
        prev.map((po) => {
          if (po.id === targetId) {
            const isApproved = action === 'approve';
            return {
              ...po,
              status: isApproved ? 'approved' : action === 'reject' ? 'cancelled' : 'draft',
              hodApproved: isApproved ? true : po.hodApproved,
              stage: isApproved ? 'procurement_trade' : po.stage,
              history: [
                ...po.history,
                {
                  date: timestamp,
                  user: userSignature,
                  action: isApproved
                    ? 'HOD Approval granted. Advanced to Stage 2: Procurement Raw Material Trade.'
                    : actionText,
                },
              ],
            };
          }
          return po;
        })
      );
    } else if (targetType === 'qc_failed') {
      setQcRecords((prev) =>
        prev.map((qc) => {
          if (qc.id === targetId) {
            return {
              ...qc,
              status: action === 'approve' ? 'passed' : 'failed',
              failedDetails: qc.failedDetails
                ? {
                    ...qc.failedDetails,
                    decisionStatus: action === 'approve' ? 'HOD Concession Release' : 'HOD Confirmed Re-work',
                  }
                : null,
              history: [...qc.history, { date: timestamp, user: userSignature, action: actionText }],
            };
          }
          return qc;
        })
      );
    }

    notify(`${targetType.toUpperCase()} ${targetId}: ${actionText}`);
  }, [currentUser.name, currentUser.role, notify]);

  // Record QC Test
  const recordQcTest = useCallback((qcData) => {
    const isPassed = qcData.parameters.every((p) => p.passed);
    const newRecord = {
      id: `QC-REL-${Date.now().toString().slice(-4)}`,
      date: new Date().toLocaleString(),
      checkedBy: `${currentUser.name} (${currentUser.role})`,
      status: isPassed ? 'passed' : 'failed',
      failedDetails: !isPassed
        ? {
            decisionStatus: 'Awaiting HOD Decision',
            ocap: {
              cause: qcData.failedCause || 'Out of specification result in laboratory test.',
              action: qcData.failedAction || 'Escalated to plant HOD for disposition.',
              owner: 'Plant Production Team',
              closure: 'Pending re-processing.',
            },
          }
        : null,
      history: [
        {
          date: new Date().toLocaleString(),
          user: currentUser.name,
          action: isPassed ? 'Sample tested and released for dispatch' : 'Sample failed specifications. Escalated to HOD.',
        },
      ],
      ...qcData,
    };

    setQcRecords((prev) => [newRecord, ...prev]);
    notify(
      isPassed
        ? `QC Test ${newRecord.id} PASSED! Stock released for outward logistics.`
        : `QC Test ${newRecord.id} FAILED! Escalated to HOD with OCAP requirements.`,
      isPassed ? 'success' : 'error'
    );
    return newRecord;
  }, [currentUser.name, currentUser.role, notify]);

  // Logistics Task Updates
  const updateLogisticsTask = useCallback((taskId, stage, updates = {}) => {
    setLogisticsTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          return {
            ...t,
            stage,
            ...updates,
            history: [
              ...t.history,
              {
                date: new Date().toLocaleString(),
                user: `${currentUser.name} (${currentUser.role})`,
                action: `Logistics stage updated to ${stage.toUpperCase()}`,
              },
            ],
          };
        }
        return t;
      })
    );
    notify(`Logistics task ${taskId} stage updated to ${stage}.`);
  }, [currentUser.name, currentUser.role, notify]);

  // Invoice Generation
  const generateInvoice = useCallback((soId, deliveryId = 'D1', docUploads = {}) => {
    const so = salesOrders.find((s) => s.id === soId);
    if (!so) return;

    const invoiceId = getNextNumber('invoice');
    const delivery = so.deliveries.find((d) => d.id === deliveryId) || so.deliveries[0];
    const subTotal = (so.totalValue * (delivery?.qty || so.items[0]?.qty || 20)) / (so.items[0]?.qty || 20);
    const gstAmount = (subTotal * 18) / 100;

    const newInvoice = {
      id: invoiceId,
      soNumber: so.id,
      deliveryId,
      customerName: so.customerName,
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      dueDate: new Date(Date.now() + 30 * 86400000).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      currency: 'INR',
      subTotal,
      gstPercent: 18,
      gstAmount,
      totalWithTax: subTotal + gstAmount,
      docs: {
        bol: docUploads.bol || `BOL-${invoiceId.slice(-4)}.pdf`,
        ci: docUploads.ci || `CI-${invoiceId.slice(-4)}.pdf`,
        pl: docUploads.pl || `PL-${invoiceId.slice(-4)}.pdf`,
        coo: docUploads.coo || `COO-${invoiceId.slice(-4)}.pdf`,
        coa: docUploads.coa || `COA-${invoiceId.slice(-4)}.pdf`,
        insurance: docUploads.insurance || `INS-${invoiceId.slice(-4)}.pdf`,
      },
      paymentReceived: 0,
      status: 'pending',
    };

    setInvoices((prev) => [newInvoice, ...prev]);

    // Update SO delivery invoice status
    setSalesOrders((prev) =>
      prev.map((s) => {
        if (s.id === soId) {
          const updatedDeliveries = s.deliveries.map((d) =>
            d.id === deliveryId ? { ...d, invoiced: true, invoiceId } : d
          );
          return {
            ...s,
            status: 'invoiced',
            deliveries: updatedDeliveries,
            history: [
              ...s.history,
              { date: new Date().toLocaleString(), user: currentUser.name, action: `Invoice ${invoiceId} generated for delivery ${deliveryId}` },
            ],
          };
        }
        return s;
      })
    );

    notify(`Tax Invoice ${invoiceId} generated for Sales Order ${soId} (${deliveryId}).`);
    return invoiceId;
  }, [salesOrders, getNextNumber, currentUser.name, notify]);

  // Payment Recording & 95% Completion Rule
  const recordPayment = useCallback((type, orderId, amount, receiptRef) => {
    const numAmount = Number(amount || 0);

    if (type === 'sales_order') {
      setSalesOrders((prev) =>
        prev.map((so) => {
          if (so.id === orderId) {
            const newReceived = (so.receivedPayment || 0) + numAmount;
            const pct = (newReceived / so.totalValue) * 100;
            return {
              ...so,
              receivedPayment: newReceived,
              status: pct >= 95 ? (so.status === 'completed' ? 'completed' : 'paid') : so.status,
              history: [
                ...so.history,
                {
                  date: new Date().toLocaleString(),
                  user: `${currentUser.name} (Finance)`,
                  action: `Payment of ₹${numAmount.toLocaleString()} booked (Ref: ${receiptRef || 'Bank Transfer'}). Total ${pct.toFixed(1)}% received.`,
                },
              ],
            };
          }
          return so;
        })
      );
    } else if (type === 'purchase_order') {
      setPurchaseOrders((prev) =>
        prev.map((po) => {
          if (po.id === orderId) {
            const newPaid = (po.paidAmount || 0) + numAmount;
            const pct = (newPaid / (po.totalWithTax || po.totalValue)) * 100;
            return {
              ...po,
              paidAmount: newPaid,
              status: pct >= 95 ? (po.status === 'completed' ? 'completed' : 'settled') : po.status,
              history: [
                ...po.history,
                {
                  date: new Date().toLocaleString(),
                  user: `${currentUser.name} (Finance)`,
                  action: `Supplier bill payment of ₹${numAmount.toLocaleString()} recorded. Total ${pct.toFixed(1)}% paid.`,
                },
              ],
            };
          }
          return po;
        })
      );
    }

    notify(`Payment receipt of ₹${numAmount.toLocaleString()} booked against ${orderId}.`);
  }, [currentUser.name, notify]);

  // Supplier Bill Receipt Recording (PO Flow Stage 4: Bill Receipt)
  const recordPoBillReceipt = useCallback((poId, billData) => {
    const timestamp = new Date().toLocaleString();
    const invoiceNumber = billData.invoiceNo || `SUPP-INV-${Date.now().toString().slice(-4)}`;
    setPurchaseOrders((prev) =>
      prev.map((po) => {
        if (po.id === poId) {
          return {
            ...po,
            stage: 'bill_receipt',
            billReceipt: {
              invoiceNo: invoiceNumber,
              invoiceDate: billData.invoiceDate || new Date().toISOString().slice(0, 10),
              amount: Number(billData.amount || po.totalWithTax || po.totalValue),
              grnRef: billData.grnRef || 'GRN-INW-MATCHED',
              verifiedBy: `${currentUser.name} (Finance / Commercial)`,
              status: 'verified',
            },
            history: [
              ...(po.history || []),
              {
                date: timestamp,
                user: `${currentUser.name} (${currentUser.role})`,
                action: `Supplier Tax Invoice ${invoiceNumber} logged & 3-way matched. Stage advanced to Bill Receipt.`,
              },
            ],
          };
        }
        return po;
      })
    );
    notify(`Supplier Bill Receipt ${invoiceNumber} logged against Purchase Order ${poId}.`);
  }, [currentUser.name, currentUser.role, notify]);

  // Close Order (Applies 95% threshold rule strictly)
  const closeOrder = useCallback((type, orderId) => {
    if (type === 'sales_order') {
      const so = salesOrders.find((s) => s.id === orderId);
      if (!so) return false;
      const pct = ((so.receivedPayment || 0) / so.totalValue) * 100;
      if (pct < 95) {
        notify(`Cannot close SO: Received payment is ${pct.toFixed(1)}% (95% required).`, 'error');
        return false;
      }
      setSalesOrders((prev) =>
        prev.map((s) =>
          s.id === orderId
            ? {
                ...s,
                status: 'completed',
                history: [
                  ...s.history,
                  { date: new Date().toLocaleString(), user: currentUser.name, action: 'Order officially Closed and Completed (≥95% paid)' },
                ],
              }
            : s
        )
      );
      notify(`Sales Order ${orderId} successfully closed and archived.`);
      return true;
    } else if (type === 'purchase_order') {
      const po = purchaseOrders.find((p) => p.id === orderId);
      if (!po) return false;
      const pct = ((po.paidAmount || 0) / (po.totalWithTax || po.totalValue)) * 100;
      if (pct < 95) {
        notify(`Cannot close PO: Paid payment is ${pct.toFixed(1)}% (95% required).`, 'error');
        return false;
      }
      setPurchaseOrders((prev) =>
        prev.map((p) =>
          p.id === orderId
            ? {
                ...p,
                status: 'completed',
                stage: 'completed',
                history: [
                  ...p.history,
                  { date: new Date().toLocaleString(), user: currentUser.name, action: 'PO officially Closed and Settled (Stage 5: PO Completed - ≥95% paid)' },
                ],
              }
            : p
        )
      );
      notify(`Purchase Order ${orderId} successfully completed.`);
      return true;
    }
    return false;
  }, [salesOrders, purchaseOrders, currentUser.name, notify]);

  return (
    <ErpContext.Provider
      value={{
        // Authentication & Role State
        isAuthenticated,
        login,
        logout,
        users,
        currentUser,
        setCurrentUser,
        activePlant,
        setActivePlant,

        // Masters
        customers,
        suppliers,
        products,
        stores,
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

        // Live Inventory
        stock,
        inwardEntries,
        outwardEntries,
        localMiscEntries,
        storeMissEntries,
        addInwardEntry,
        addOutwardEntry,
        addProductionOutput,
        addLocalMiscEntry,
        addStoreMissEntry,

        // Operational Records
        quotations,
        salesOrders,
        purchaseOrders,
        qcRecords,
        logisticsTasks,
        invoices,

        // Operational Actions
        createQuotation,
        updateQuotation,
        convertQuotationToSalesOrder,
        createSalesOrder,
        updateSalesOrder,
        createPurchaseOrder,
        updatePurchaseOrder,
        handleUniversalApproval,
        recordQcTest,
        updateLogisticsTask,
        generateInvoice,
        recordPayment,
        recordPoBillReceipt,
        closeOrder,

        // Notifications & Helpers
        notification,
        dismissNotification,
        notify,
        getNextNumber,
      }}
    >
      {children}
    </ErpContext.Provider>
  );
}

export default ErpProvider;
