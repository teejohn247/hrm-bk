/**
 * Orders (OM) Module - feature permissions
 */

export const ordersModuleFeatures = [
  {
    featureId: 1,
    featureKey: 'customersManagement',
    featureName: 'Customers Management',
    featurePermissions: [
      { key: 'canViewCustomers', name: 'View Customers', permissionType: 'view' },
      { key: 'canCreateCustomer', name: 'Create Customer', permissionType: 'create' },
      { key: 'canUpdateCustomer', name: 'Update Customer', permissionType: 'update' },
      { key: 'canDeleteCustomer', name: 'Delete Customer', permissionType: 'delete' },
    ],
  },
  {
    featureId: 2,
    featureKey: 'purchaseOrderManagement',
    featureName: 'Purchase Order Management',
    featurePermissions: [
      { key: 'canViewPurchaseOrders', name: 'View Purchase Orders', permissionType: 'view' },
      { key: 'canCreatePurchaseOrder', name: 'Create Purchase Order', permissionType: 'create' },
      { key: 'canUpdatePurchaseOrder', name: 'Update Purchase Order', permissionType: 'update' },
      { key: 'canDeletePurchaseOrder', name: 'Delete Purchase Order', permissionType: 'delete' },
      { key: 'canViewProducts', name: 'View Products', permissionType: 'view' },
      { key: 'canCreateProducts', name: 'Create Products', permissionType: 'create' },
    ],
  },
  {
    featureId: 3,
    featureKey: 'salesOrderManagement',
    featureName: 'Sales Order Management',
    featurePermissions: [
      { key: 'canViewSalesOrders', name: 'View Sales Orders', permissionType: 'view' },
      { key: 'canCreateSalesOrder', name: 'Create Sales Order', permissionType: 'create' },
      { key: 'canUpdateSalesOrder', name: 'Update Sales Order', permissionType: 'update' },
      { key: 'canDeleteSalesOrder', name: 'Delete Sales Order', permissionType: 'delete' },
    ],
  },
  {
    featureId: 4,
    featureKey: 'inventoryManagement',
    featureName: 'Inventory Management',
    featurePermissions: [
      { key: 'canViewInventory', name: 'View Inventory', permissionType: 'view' },
      { key: 'canUpdateInventory', name: 'Update Inventory', permissionType: 'update' },
      { key: 'canAdjustStock', name: 'Adjust Stock', permissionType: 'update' },
    ],
  },
  {
    featureId: 5,
    featureKey: 'reports',
    featureName: 'Reports',
    featurePermissions: [
      { key: 'canViewOrderReports', name: 'View Order Reports', permissionType: 'view' },
      { key: 'canExportReports', name: 'Export Reports', permissionType: 'view' },
    ],
  },
];
