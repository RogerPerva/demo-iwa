import { User, Company, Product, Report, ActivityLog, ChatMessage } from '@/types';

export const mockCompanies: Company[] = [
  { id: 'c1', name: 'Empresa A', country: 'México', currency: 'MXN', timezone: 'America/Mexico_City' },
  { id: 'c2', name: 'Empresa B', country: 'España', currency: 'EUR', timezone: 'Europe/Madrid' },
  { id: 'c3', name: 'Empresa C', country: 'Argentina', currency: 'ARS', timezone: 'America/Argentina/Buenos_Aires' },
];

export const mockUsers: User[] = [
  {
    id: 'u1',
    name: 'Carlos Admin',
    email: 'admin@empresa.com',
    role: 'Admin',
    companyId: 'c1',
    status: 'Activo',
    permissions: { users: true, companies: true, inventory: true, reports: true, chat: true }
  },
  {
    id: 'u2',
    name: 'María Operativa',
    email: 'maria@empresa.com',
    role: 'Operativo',
    companyId: 'c1',
    status: 'Activo',
    permissions: { users: false, companies: false, inventory: true, reports: true, chat: true }
  },
  {
    id: 'u3',
    name: 'Juan Viewer',
    email: 'juan@empresa.com',
    role: 'Viewer',
    companyId: 'c2',
    status: 'Activo',
    permissions: { users: false, companies: false, inventory: false, reports: true, chat: false }
  },
  {
    id: 'u4',
    name: 'Ana López',
    email: 'ana@empresa.com',
    role: 'Operativo',
    companyId: 'c2',
    status: 'Activo',
    permissions: { users: false, companies: false, inventory: true, reports: true, chat: true }
  },
  {
    id: 'u5',
    name: 'Pedro García',
    email: 'pedro@empresa.com',
    role: 'Admin',
    companyId: 'c3',
    status: 'Inactivo',
    permissions: { users: true, companies: true, inventory: true, reports: true, chat: true }
  }
];

export const mockProducts: Product[] = [
  { id: 'p1', name: 'Laptop Dell XPS', sku: 'LT-001', category: 'Electrónica', stock: 15, price: 25000, companyId: 'c1', status: 'Disponible' },
  { id: 'p2', name: 'Mouse Logitech', sku: 'MS-002', category: 'Accesorios', stock: 3, price: 350, companyId: 'c1', status: 'Bajo Stock' },
  { id: 'p3', name: 'Teclado Mecánico', sku: 'KB-003', category: 'Accesorios', stock: 0, price: 1200, companyId: 'c1', status: 'Agotado' },
  { id: 'p4', name: 'Monitor 27"', sku: 'MN-004', category: 'Electrónica', stock: 8, price: 8500, companyId: 'c1', status: 'Disponible' },
  { id: 'p5', name: 'Impresora HP', sku: 'PR-005', category: 'Oficina', stock: 12, price: 4500, companyId: 'c2', status: 'Disponible' },
  { id: 'p6', name: 'Silla Ergonómica', sku: 'CH-006', category: 'Mobiliario', stock: 5, price: 3200, companyId: 'c2', status: 'Bajo Stock' },
  { id: 'p7', name: 'Escritorio Ejecutivo', sku: 'DS-007', category: 'Mobiliario', stock: 20, price: 6800, companyId: 'c2', status: 'Disponible' },
  { id: 'p8', name: 'Router Cisco', sku: 'RT-008', category: 'Redes', stock: 7, price: 2100, companyId: 'c3', status: 'Disponible' },
  { id: 'p9', name: 'Switch 24 puertos', sku: 'SW-009', category: 'Redes', stock: 2, price: 4200, companyId: 'c3', status: 'Bajo Stock' },
  { id: 'p10', name: 'Cable HDMI', sku: 'CB-010', category: 'Cables', stock: 45, price: 180, companyId: 'c3', status: 'Disponible' }
];

export const mockReports: Report[] = [
  { id: 'r1', name: 'Ventas Mensual', type: 'Ventas', description: 'Reporte de ventas del mes actual', companyId: 'c1' },
  { id: 'r2', name: 'Movimientos Inventario', type: 'Inventario', description: 'Detalle de entradas y salidas de productos', companyId: 'c1' },
  { id: 'r3', name: 'Usuarios Creados', type: 'Usuarios', description: 'Reporte de usuarios registrados en el sistema', companyId: 'c1' },
  { id: 'r4', name: 'Stock Bajo', type: 'Inventario', description: 'Productos con stock menor a 5 unidades', companyId: 'c2' },
  { id: 'r5', name: 'Ventas Anual', type: 'Ventas', description: 'Consolidado de ventas anuales', companyId: 'c3' }
];

export const mockActivityLog: ActivityLog[] = [
  { id: 'a1', type: 'login', description: 'Carlos Admin inició sesión', companyId: 'c1', userId: 'u1', timestamp: new Date(Date.now() - 1000 * 60 * 5) },
  { id: 'a2', type: 'report_generated', description: 'Se generó reporte "Ventas Mensual"', companyId: 'c1', userId: 'u1', timestamp: new Date(Date.now() - 1000 * 60 * 10) },
  { id: 'a3', type: 'user_created', description: 'Se creó usuario "Ana López"', companyId: 'c2', userId: 'u1', timestamp: new Date(Date.now() - 1000 * 60 * 15) },
  { id: 'a4', type: 'product_updated', description: 'Se actualizó stock de "Mouse Logitech"', companyId: 'c1', userId: 'u2', timestamp: new Date(Date.now() - 1000 * 60 * 20) },
  { id: 'a5', type: 'company_changed', description: 'Se cambió a empresa "Empresa B"', companyId: 'c2', userId: 'u3', timestamp: new Date(Date.now() - 1000 * 60 * 25) }
];

export const mockChatMessages: ChatMessage[] = [
  { id: 'm1', text: 'Hola, ¿en qué puedo ayudarte?', sender: 'bot', companyId: 'c1', timestamp: new Date(Date.now() - 1000 * 60 * 30) },
  { id: 'm2', text: 'Necesito ayuda con el inventario', sender: 'user', companyId: 'c1', timestamp: new Date(Date.now() - 1000 * 60 * 29) },
  { id: 'm3', text: 'Claro, ¿qué necesitas saber sobre el inventario?', sender: 'bot', companyId: 'c1', timestamp: new Date(Date.now() - 1000 * 60 * 28) },
];
