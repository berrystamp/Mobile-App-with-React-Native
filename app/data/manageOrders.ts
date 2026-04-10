export type ManageOrderStatus = 'Active' | 'Completed' | 'Canceled';

export type ManageOrderItem = {
  id: string;
  code: string;
  title: string;
  shopName: string;
  amount: number;
  status: ManageOrderStatus;
  description: string;
  designer: string;
  updatedAt: string;
  createdAt: string;
  dueOn: string;
  purpose: string;
  itemsToPrint: string[];
};

export const manageOrders: ManageOrderItem[] = [
  {
    id: 'wq54249th',
    code: 'WQ54249TH',
    title: 'Design customization',
    shopName: 'Shemxy Arts',
    amount: 26600,
    status: 'Completed',
    description: "Printing order for international women's day celebration.",
    designer: 'Shemxy Arts',
    updatedAt: '13-12-22',
    createdAt: '13-12-2022',
    dueOn: '07/01/2022',
    purpose: "International women's day celebration",
    itemsToPrint: ['Invitation card', 'Tshirt', 'Water bottle', 'Tote bag', 'Jotter'],
  },
  {
    id: 'pk10234ab',
    code: 'PK10234AB',
    title: 'Product purchase',
    shopName: 'Mohh_Jumah',
    amount: 26600,
    status: 'Canceled',
    description: 'Large format product purchase awaiting store confirmation.',
    designer: 'Mohh_Jumah',
    updatedAt: '14-12-22',
    createdAt: '12-12-2022',
    dueOn: '10/01/2023',
    purpose: 'Product launch campaign',
    itemsToPrint: ['Banner', 'Sticker', 'Packaging box'],
  },
  {
    id: 'bm39021cd',
    code: 'BM39021CD',
    title: 'Product purchase',
    shopName: 'Beam of Rays',
    amount: 26600,
    status: 'Active',
    description: 'Retail product order currently in production.',
    designer: 'Beam of Rays',
    updatedAt: '14-12-22',
    createdAt: '11-12-2022',
    dueOn: '11/01/2023',
    purpose: 'Store opening event',
    itemsToPrint: ['Roll-up banner', 'Acrylic signage'],
  },
  {
    id: 'fd98344ef',
    code: 'FD98344EF',
    title: 'Design customisation',
    shopName: 'Feidy Prints',
    amount: 26600,
    status: 'Completed',
    description: 'Design customisation delivered for brand campaign.',
    designer: 'Feidy Prints',
    updatedAt: '15-12-22',
    createdAt: '10-12-2022',
    dueOn: '08/01/2023',
    purpose: 'Brand awareness event',
    itemsToPrint: ['Flyer', 'Shirt', 'Cap'],
  },
  {
    id: 'al20451gh',
    code: 'AL20451GH',
    title: 'Product purchase',
    shopName: 'Art by Lolu',
    amount: 26600,
    status: 'Canceled',
    description: 'Purchase canceled after stock confirmation failed.',
    designer: 'Art by Lolu',
    updatedAt: '15-12-22',
    createdAt: '09-12-2022',
    dueOn: '13/01/2023',
    purpose: 'Internal brand restock',
    itemsToPrint: ['Notebook', 'Mug'],
  },
  {
    id: 'sa89321ij',
    code: 'SA89321IJ',
    title: 'Design customisation',
    shopName: 'Shemxy Arts',
    amount: 26600,
    status: 'Active',
    description: 'Design customisation approved and queued for printing.',
    designer: 'Shemxy Arts',
    updatedAt: '16-12-22',
    createdAt: '08-12-2022',
    dueOn: '14/01/2023',
    purpose: 'Conference merch package',
    itemsToPrint: ['Lanyard', 'Badge', 'Notebook'],
  },
  {
    id: 'ov44321kl',
    code: 'OV44321KL',
    title: 'Design customisation',
    shopName: 'Shemxy Arts',
    amount: 26600,
    status: 'Completed',
    description: 'Completed branded materials for awareness campaign.',
    designer: 'Shemxy Arts',
    updatedAt: '16-12-22',
    createdAt: '07-12-2022',
    dueOn: '15/01/2023',
    purpose: 'Awareness outreach',
    itemsToPrint: ['Poster', 'Leaflet'],
  },
];
