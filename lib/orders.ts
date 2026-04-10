import type { ManageOrderItem, ManageOrderStatus } from '@/types';

const STATUS_MAP: Record<string, ManageOrderStatus> = {
  ACTIVE: 'Active',
  PENDING: 'Active',
  PROCESSING: 'Active',
  IN_PROGRESS: 'Active',
  COMPLETED: 'Completed',
  DELIVERED: 'Completed',
  SUCCESSFUL: 'Completed',
  CANCELLED: 'Canceled',
  CANCELED: 'Canceled',
  REJECTED: 'Canceled',
  FAILED: 'Canceled',
};

const toDisplayDate = (value: unknown) => {
  if (!value) return 'N/A';
  const parsed = new Date(String(value));
  if (Number.isNaN(parsed.getTime())) return String(value);
  return parsed.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

const toList = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value
      .map((item) => {
        if (typeof item === 'string') return item;
        return item?.name || item?.title || item?.label || item?.itemName || item?.itemType || '';
      })
      .filter(Boolean);
  }
  if (typeof value === 'string') {
    return value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
};

const toImageList = (value: unknown): string[] => {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      if (typeof item === 'string') return item;
      return item?.url || item?.imageUrl || item?.path || item?.imagePath || '';
    })
    .filter(Boolean);
};

export const normalizeManageOrderStatus = (value: unknown): ManageOrderStatus => {
  const normalized = String(value || 'ACTIVE').trim().replace(/[\s-]+/g, '_').toUpperCase();
  return STATUS_MAP[normalized] || 'Active';
};

export const normalizeManageOrder = (input: any, index = 0): ManageOrderItem => {
  const item = input?.responseBody || input?.data || input || {};
  const orderNumber = item.orderNumber || item.code || item.trackingNumber || item.reference || item.orderCode;
  const title = item.title || item.name || item.orderTitle || item.type || item.orderType || 'Order';
  const designerName =
    item.designerName ||
    item.shopName ||
    item.vendorName ||
    item.storeName ||
    item.businessName ||
    `${item.designer?.firstName || ''} ${item.designer?.lastName || ''}`.trim() ||
    item.designer?.username ||
    item.profile?.username ||
    'Unknown';
  const printItems = [
    ...toList(item.itemsToPrint),
    ...toList(item.printItems),
    ...toList(item.items),
    ...toList(item.specifications?.itemsToPrint),
  ];

  return {
    id: String(item.id || orderNumber || index + 1),
    code: String(orderNumber || item.id || `ORDER-${index + 1}`).toUpperCase(),
    title,
    shopName: designerName,
    amount: Number(item.amount || item.totalAmount || item.price || item.total || 0),
    status: normalizeManageOrderStatus(item.status),
    description: item.description || item.note || item.summary || 'No order description available.',
    designer: designerName,
    updatedAt: toDisplayDate(item.updatedAt || item.lastModifiedDate || item.modifiedAt),
    createdAt: toDisplayDate(item.createdAt || item.createdDate),
    dueOn: toDisplayDate(item.dueOn || item.deliveryDate || item.dueDate),
    purpose:
      item.purpose ||
      item.designPurpose ||
      item.specifications?.purpose ||
      item.specifications?.designPurpose ||
      'Not specified',
    itemsToPrint: printItems.length ? Array.from(new Set(printItems)) : ['Not specified'],
    uploadedDesigns: toImageList(item.uploadedDesigns || item.designs || item.attachments || item.files || item.images),
  };
};

export const normalizeManageOrderListResponse = (input: any): ManageOrderItem[] => {
  const body = input?.responseBody || input?.data || input || {};
  const list = Array.isArray(body)
    ? body
    : Array.isArray(body.content)
      ? body.content
      : Array.isArray(body.orders)
        ? body.orders
        : Array.isArray(body.items)
          ? body.items
          : [];

  return list.map((item: unknown, index: number) => normalizeManageOrder(item, index));
};
