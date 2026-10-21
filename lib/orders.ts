import type {
  InfluencerMerchDesignSummary,
  InfluencerMerchOrderDetails,
  InfluencerMerchOrderItem,
  InstantOrderStatus, ManageOrderItem, ManageOrderStatus
} from '@/types';

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
  const orderNumber = item.ref || item.orderNumber || item.code || item.trackingNumber || item.reference || item.orderCode;
  const title = item.title || item.name || item.orderTitle || item.orderRequest?.customDesignRequest?.theme || item.orderRequest?.printRequest?.mockName || item.orderType || item.type || 'Order';
  const request = item.orderRequest || item;
  const provider = request.providerProfile || item.printer || item.designer || {};
  const printRequest = request.printRequest || {};
  const customRequest = request.customDesignRequest || {};
  const orderStatus = item.orderStatus || item.status || item.order?.status;
  const customer = request.customerProfile || item.customer || {};
  const providerName = provider.name || provider.userName || provider.username || item.printerName || item.designerName;
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
    ...(printRequest.mockName ? [printRequest.mockName] : []),
    ...toList(printRequest.mockTypes),
  ];

  return {
    id: String(item.id || orderNumber || index + 1),
    code: String(orderNumber || item.id || `ORDER-${index + 1}`).toUpperCase(),
    title,
    shopName: providerName || designerName,
    providerName,
    providerRole: provider.profileType || (item.printer ? 'PRINTER' : undefined),
    customerName: customer.name || customer.userName || item.customerName,
    amount: Number(item.totalAmount ?? item.orderAmount ?? item.amountPaid ?? item.amount ?? item.price ?? item.total ?? item.grandTotal ?? 0),
    status: normalizeManageOrderStatus(orderStatus),
    description: item.description || request.description || customRequest.purpose || item.note || item.summary || 'No order description available.',
    designer: designerName,
    updatedAt: toDisplayDate(item.updatedAt || item.lastModifiedDate || item.modifiedAt || item.deliveryDate),
    createdAt: toDisplayDate(item.createdAt || item.createdDate || item.dateCreated || item.orderDate || request.createdAt || request.dateCreated),
    dueOn: toDisplayDate(item.deliveryDate || item.expectedDeliveryDate || request.dateOfDelivery || printRequest.dateOfDelivery || item.dueOn || item.dueDate),
    purpose:
      item.purpose ||
      customRequest.purpose ||
      item.designPurpose ||
      item.specifications?.purpose ||
      item.specifications?.designPurpose ||
      'Not specified',
    itemsToPrint: printItems.length ? Array.from(new Set(printItems)) : ['Not specified'],
    uploadedDesigns: toImageList(item.uploadedDesigns || item.designs || item.attachments || item.files || item.images || [printRequest.designCoverImage, printRequest.mockItemUrl, printRequest.designFrontImageUrl, customRequest.image].filter(Boolean)),
  };
};

export const normalizeManageOrderListResponse = (input: any): ManageOrderItem[] => {
  // APIs may wrap a pageable list several levels deep (responseBody/data/content).
  // Walk known envelope keys instead of silently rendering an empty list.
  const queue: any[] = [input];
  const seen = new Set<any>();
  while (queue.length) {
    const body = queue.shift();
    if (!body || typeof body !== 'object' || seen.has(body)) continue;
    seen.add(body);
    if (Array.isArray(body)) {
      if (body.length === 0) return [];
      if (body.some((item) => item && typeof item === 'object')) {
        return body.map((item: unknown, index: number) => normalizeManageOrder(item, index));
      }
    }
    for (const key of ['content', 'orders', 'items', 'results', 'records', 'responseBody', 'data', 'orderList']) {
      if (body[key] !== undefined && body[key] !== null) queue.push(body[key]);
    }
  }
  return [];
};

// ─── Influencer Merch (printer flow) ───────────────────────────────────────
const INSTANT_STATUS_MAP: Record<string, InstantOrderStatus> = {
  ACTIVE: 'ACTIVE',
  PENDING: 'ACTIVE',
  PROCESSING: 'ACTIVE',
  IN_PROGRESS: 'ACTIVE',
  COMPLETED: 'COMPLETED',
  DELIVERED: 'COMPLETED',
  SUCCESSFUL: 'COMPLETED',
  CANCELLED: 'CANCELLED',
  CANCELED: 'CANCELLED',
  REJECTED: 'CANCELLED',
  FAILED: 'CANCELLED',
};

export const normalizeInstantOrderStatus = (value: unknown): InstantOrderStatus => {
  const normalized = String(value || 'ACTIVE').trim().replace(/[\s-]+/g, '_').toUpperCase();
  return INSTANT_STATUS_MAP[normalized] || 'ACTIVE';
};

const toContentList = (input: any): any[] => {
  const body = input?.responseBody || input?.data || input || {};
  return Array.isArray(body)
    ? body
    : Array.isArray(body.content)
      ? body.content
      : Array.isArray(body.designs)
        ? body.designs
        : Array.isArray(body.orders)
          ? body.orders
          : [];
};

export const normalizeInfluencerMerchDesign = (item: any): InfluencerMerchDesignSummary => ({
  designId: Number(item?.designId ?? item?.id),
  designName: item?.designName || item?.name || 'Untitled design',
  designPreviewUrl: item?.designPreviewUrl || item?.imageUrl || item?.frontImageUrl,
  influencerName: item?.influencerName || item?.designerName || item?.shopName || 'Unknown',
  totalOrders: Number(item?.totalOrders ?? item?.orderCount ?? 0),
  amount: Number(item?.amount ?? 0),
  dueDate: toDisplayDate(item?.dueDate),
  status: normalizeInstantOrderStatus(item?.status),
});

export const normalizeInfluencerMerchDesignListResponse = (
  input: any
): InfluencerMerchDesignSummary[] => toContentList(input).map(normalizeInfluencerMerchDesign);

export const normalizeInfluencerMerchOrder = (item: any): InfluencerMerchOrderItem => ({
  id: Number(item?.id),
  username: item?.username || item?.customerName || item?.user?.username || 'Unknown',
  avatarUrl: item?.avatarUrl || item?.user?.profileImageUrl || item?.customerAvatar,
  itemOrdered: item?.itemOrdered || item?.designName || 'Item',
  quantity: Number(item?.quantity ?? 1),
  amount: Number(item?.amount ?? 0),
  dateInitiated: toDisplayDate(item?.dateInitiated),
  dueDate: toDisplayDate(item?.dueDate),
  status: normalizeInstantOrderStatus(item?.status),
});

export const normalizeInfluencerMerchOrderListResponse = (
  input: any
): InfluencerMerchOrderItem[] => toContentList(input).map(normalizeInfluencerMerchOrder);

export const normalizeInfluencerMerchOrderDetails = (
  input: any
): InfluencerMerchOrderDetails | null => {
  const item = input?.responseBody || input?.data || input;
  if (!item) return null;
  return {
    id: Number(item?.id),
    orderRef: String(item?.orderRef || item?.code || item?.id || ''),
    description: item?.description || '',
    influencerName: item?.influencerName || item?.designerName || 'Unknown',
    orderDate: toDisplayDate(item?.orderDate),
    deliveryDate: item?.deliveryDate || '',
    designAmount: Number(item?.designAmount ?? 0),
    deliveryAmount: Number(item?.deliveryAmount ?? 0),
    deliveryAddress: item?.deliveryAddress || 'N/A',
    totalAmount: Number(item?.totalAmount ?? 0),
    status: normalizeInstantOrderStatus(item?.status),
    design: {
      name: item?.design?.name || item?.designName || 'Design',
      imageUrl: item?.design?.imageUrl || item?.design?.frontImageUrl,
      pngUrl: item?.design?.pngUrl,
      svgUrl: item?.design?.svgUrl,
    },
    mockup: {
      imageUrl: item?.mockup?.imageUrl || item?.mockup?.image?.url,
      name: item?.mockup?.name || 'Mockup',
      amount: Number(item?.mockup?.amount ?? 0),
      colour: item?.mockup?.colour || '',
      size: item?.mockup?.size || '',
      quantity: Number(item?.mockup?.quantity ?? 1),
    },
  };
};
