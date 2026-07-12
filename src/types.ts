export type Language = 'en' | 'fr' | 'ar';
export type Theme = 'light' | 'dark';

export interface Customer {
  id: string;
  name: string;
  photo: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  gps: string;
  outstandingBalance: number;
  totalPaid: number;
  notes: string;
  createdAt: string;
}

export type ProjectType =
  | 'kitchen'
  | 'bedroom'
  | 'wardrobe'
  | 'door'
  | 'window'
  | 'cabinet'
  | 'tv_unit'
  | 'office'
  | 'table'
  | 'custom';

export type ProjectStatus =
  | 'quotation'
  | 'confirmed'
  | 'cutting'
  | 'assembly'
  | 'painting'
  | 'ready'
  | 'delivery'
  | 'installation'
  | 'completed';

export interface Measurement3D {
  w: number; // width
  h: number; // height
  d: number; // depth
}

export interface ProjectMeasurements {
  width: number; // stored in chosen unit
  height: number;
  depth: number;
  unit: 'mm' | 'cm' | 'm';
  area: number; // calculated in m2
  volume: number; // calculated in m3
}

export interface Project {
  id: string;
  name: string;
  type: ProjectType;
  customerId: string;
  status: ProjectStatus;
  measurements: ProjectMeasurements;
  budget: number;
  expenses: number;
  profit: number;
  workers: string[]; // employee ids
  notes: string;
  photos: string[];
  photosBefore?: string[];
  photosAfter?: string[];
  videos: string[];
  voiceNotes: string[]; // base64 or paths
  deliveryDate: string;
  installationDate: string;
  warrantyYears: number;
  documents: { name: string; url: string }[];
  createdAt: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: 'wood' | 'mdf' | 'plywood' | 'paint' | 'glass' | 'aluminium' | 'hardware' | 'tool';
  stock: number;
  minQuantity: number;
  unit: string; // e.g. "sheets", "liters", "pcs", "kg"
  supplierId: string;
  lastPrice: number;
}

export interface Employee {
  id: string;
  name: string;
  role: string;
  phone: string;
  salary: number;
  workingHours: number;
  attendance: { [date: string]: 'present' | 'absent' | 'late' };
  tasks: string[];
  performance: number; // scale 1-5
}

export interface Supplier {
  id: string;
  name: string;
  contact: string;
  phone: string;
  email: string;
  materials: string[];
}

export interface Payment {
  id: string;
  projectId: string;
  customerId: string;
  amount: number;
  date: string;
  method: 'cash' | 'transfer' | 'installments' | 'partial';
  notes?: string;
}

export interface InvoiceItem {
  description: string;
  quantity: number;
  price: number;
  total: number;
}

export interface Invoice {
  id: string;
  number: string;
  type: 'invoice' | 'quotation' | 'receipt';
  projectId: string;
  customerId: string;
  date: string;
  dueDate: string;
  items: InvoiceItem[];
  subtotal: number;
  tax: number; // percentage, e.g. 15 for 15%
  total: number;
  status: 'paid' | 'unpaid' | 'draft';
  signature?: string; // Base64 signature
  createdAt: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  type: 'production' | 'meeting' | 'measurement' | 'painting' | 'delivery' | 'installation';
  date: string;
  time?: string;
  projectId?: string;
  description?: string;
}

export interface AIScanResult {
  estimatedDimensions: {
    width: number;
    height: number;
    depth: number;
    unit: 'm';
  };
  floorPlan2D: string; // ASCII or visual plan explanation
  woodQuantity: number; // in m3 or sheets
  mdfQuantity: number; // sheets
  plywoodQuantity: number; // sheets
  paintQuantity: number; // liters
  screws: number; // pcs
  hinges: number; // pcs
  handles: number; // pcs
  laborHours: number;
  productionDays: number;
  installationDays: number;
  totalCost: number;
  suggestedPrice: number;
  shoppingList: { item: string; qty: number; unit: string; estimatedPrice: number }[];
  warnings: string[];
  placementSuggestions: string[];
  summary: string;
}
