export type UserRole = 'Admin' | 'Operativo' | 'Viewer';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  companyId: string;
  status: 'Activo' | 'Inactivo';
  permissions: {
    users: boolean;
    companies: boolean;
    inventory: boolean;
    reports: boolean;
    chat: boolean;
  };
}

export interface Company {
  id: string;
  name: string;
  country: string;
  currency: string;
  timezone: string;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  stock: number;
  price: number;
  companyId: string;
  status: 'Disponible' | 'Bajo Stock' | 'Agotado';
}

export interface Report {
  id: string;
  name: string;
  type: 'Ventas' | 'Inventario' | 'Usuarios';
  description: string;
  companyId: string;
}

export interface ActivityLog {
  id: string;
  type: 'user_created' | 'company_changed' | 'report_generated' | 'product_updated' | 'login' | 'logout';
  description: string;
  companyId: string;
  userId: string;
  timestamp: Date;
}

export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  companyId: string;
  timestamp: Date;
}

export interface AppState {
  currentUser: User | null;
  currentCompany: Company | null;
  users: User[];
  companies: Company[];
  products: Product[];
  reports: Report[];
  activityLog: ActivityLog[];
  chatMessages: ChatMessage[];
  
  // Actions
  login: (email: string, password: string) => boolean;
  logout: () => void;
  setCurrentCompany: (companyId: string) => void;
  
  // Users
  addUser: (user: Omit<User, 'id'>) => void;
  updateUser: (id: string, user: Partial<User>) => void;
  deleteUser: (id: string) => void;
  
  // Companies
  addCompany: (company: Omit<Company, 'id'>) => void;
  updateCompany: (id: string, company: Partial<Company>) => void;
  deleteCompany: (id: string) => void;
  
  // Products
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  
  // Activity Log
  addActivityLog: (log: Omit<ActivityLog, 'id' | 'timestamp'>) => void;
  
  // Chat
  addChatMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  clearChatMessages: (companyId: string) => void;

  // Email Service
  sendSMS: (to: string, message: string) => Promise<{ success: boolean; message: string; messageId?: string; error?: string }>;
}