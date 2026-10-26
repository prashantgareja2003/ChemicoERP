/**
 * Chemzora Oilchem ERP - Service Client
 * Clean abstraction layer for ERP data operations.
 */
import {
  DASHBOARD_METRICS,
  RECENT_SALES_ORDERS,
  PRODUCTION_UNITS,
  PENDING_APPROVALS_LIST,
  RAW_MATERIAL_INVENTORY,
  RECENT_LOGS,
} from './mockData';

// Simulated delay helper for realistic asynchronous UI behavior
const delay = (ms = 180) => new Promise((resolve) => setTimeout(resolve, ms));

export const erpService = {
  // Dashboard Summary
  async getDashboardSummary() {
    await delay(120);
    return {
      metrics: DASHBOARD_METRICS,
      recentOrders: RECENT_SALES_ORDERS,
      productionUnits: PRODUCTION_UNITS,
      pendingApprovals: PENDING_APPROVALS_LIST,
      inventoryAlerts: RAW_MATERIAL_INVENTORY.filter((item) => item.status === 'Low Stock'),
      recentLogs: RECENT_LOGS,
    };
  },

  // Sales Orders
  async getSalesOrders() {
    await delay(150);
    return [...RECENT_SALES_ORDERS];
  },

  // Production Units & Silos
  async getProductionUnits() {
    await delay(150);
    return [...PRODUCTION_UNITS];
  },

  // Approvals
  async getPendingApprovals() {
    await delay(120);
    return [...PENDING_APPROVALS_LIST];
  },

  // Inventory
  async getInventory() {
    await delay(150);
    return [...RAW_MATERIAL_INVENTORY];
  },

  // Actions
  async approveItem(id) {
    await delay(200);
    return { success: true, id, message: `Record ${id} successfully approved.` };
  },

  async rejectItem(id, reason) {
    await delay(200);
    return { success: true, id, reason, message: `Record ${id} rejected.` };
  },
};

export default erpService;
