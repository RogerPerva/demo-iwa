import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AppState } from '@/types';
import { mockUsers, mockCompanies, mockProducts, mockReports, mockActivityLog, mockChatMessages } from '@/lib/mockData';

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      currentUser: null,
      currentCompany: null,
      users: mockUsers,
      companies: mockCompanies,
      products: mockProducts,
      reports: mockReports,
      activityLog: mockActivityLog,
      chatMessages: mockChatMessages,

      login: (email: string, password: string) => {
        const user = get().users.find(u => u.email === email && u.status === 'Activo');
        if (user) {
          const company = get().companies.find(c => c.id === user.companyId);
          set({ currentUser: user, currentCompany: company });
          get().addActivityLog({
            type: 'login',
            description: `${user.name} inició sesión`,
            companyId: user.companyId,
            userId: user.id
          });
          return true;
        }
        return false;
      },

      logout: () => {
        const { currentUser } = get();
        if (currentUser) {
          get().addActivityLog({
            type: 'logout',
            description: `${currentUser.name} cerró sesión`,
            companyId: currentUser.companyId,
            userId: currentUser.id
          });
        }
        set({ currentUser: null });
      },

      setCurrentCompany: (companyId: string) => {
        const company = get().companies.find(c => c.id === companyId);
        const { currentUser } = get();
        if (company && currentUser) {
          set({ currentCompany: company });
          get().addActivityLog({
            type: 'company_changed',
            description: `Se cambió a empresa "${company.name}"`,
            companyId: companyId,
            userId: currentUser.id
          });
        }
      },

      addUser: (user) => {
        const newUser = { ...user, id: `u${Date.now()}` };
        set(state => ({ users: [...state.users, newUser] }));
        const { currentUser, currentCompany } = get();
        if (currentUser && currentCompany) {
          get().addActivityLog({
            type: 'user_created',
            description: `Se creó usuario "${newUser.name}"`,
            companyId: currentCompany.id,
            userId: currentUser.id
          });
        }
      },

      updateUser: (id, userData) => {
        set(state => ({
          users: state.users.map(u => u.id === id ? { ...u, ...userData } : u)
        }));
      },

      deleteUser: (id) => {
        set(state => ({ users: state.users.filter(u => u.id !== id) }));
      },

      addCompany: (company) => {
        const newCompany = { ...company, id: `c${Date.now()}` };
        set(state => ({ companies: [...state.companies, newCompany] }));
      },

      updateCompany: (id, companyData) => {
        set(state => ({
          companies: state.companies.map(c => c.id === id ? { ...c, ...companyData } : c)
        }));
      },

      deleteCompany: (id) => {
        set(state => ({ companies: state.companies.filter(c => c.id !== id) }));
      },

      addProduct: (product) => {
        const newProduct = { ...product, id: `p${Date.now()}` };
        set(state => ({ products: [...state.products, newProduct] }));
        const { currentUser, currentCompany } = get();
        if (currentUser && currentCompany) {
          get().addActivityLog({
            type: 'product_updated',
            description: `Se creó producto "${newProduct.name}"`,
            companyId: currentCompany.id,
            userId: currentUser.id
          });
        }
      },

      updateProduct: (id, productData) => {
        set(state => ({
          products: state.products.map(p => p.id === id ? { ...p, ...productData } : p)
        }));
        const { currentUser, currentCompany } = get();
        const product = get().products.find(p => p.id === id);
        if (currentUser && currentCompany && product) {
          get().addActivityLog({
            type: 'product_updated',
            description: `Se actualizó producto "${product.name}"`,
            companyId: currentCompany.id,
            userId: currentUser.id
          });
        }
      },

      deleteProduct: (id) => {
        set(state => ({ products: state.products.filter(p => p.id !== id) }));
      },

      addActivityLog: (log) => {
        const newLog = {
          ...log,
          id: `a${Date.now()}`,
          timestamp: new Date()
        };
        set(state => ({
          activityLog: [newLog, ...state.activityLog].slice(0, 50) // Keep last 50 logs
        }));
      },

      addChatMessage: (message) => {
        const newMessage = {
          ...message,
          id: `m${Date.now()}`,
          timestamp: new Date()
        };
        set(state => ({
          chatMessages: [...state.chatMessages, newMessage]
        }));
      },

      clearChatMessages: (companyId: string) => {
        set(state => ({
          chatMessages: state.chatMessages.filter(m => m.companyId !== companyId)
        }));
      },

      sendSMS: (to, message) => {
        const { currentUser, currentCompany } = get();
        if (currentUser && currentCompany) {
          get().addActivityLog({
            type: 'user_created',
            description: `SMS enviado a ${to}: "${message.substring(0, 30)}..."`,
            companyId: currentCompany.id,
            userId: currentUser.id
          });
        }
      }
    }),
    {
      name: 'admin-portal-storage'
    }
  )
);
