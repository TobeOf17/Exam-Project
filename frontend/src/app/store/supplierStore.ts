import { create } from 'zustand';
import supplierService, { Supplier as APISupplier } from '../services/supplierService';

export interface Supplier {
  id: string;
  name: string;
  contact: string;
}

interface SupplierState {
  suppliers: Supplier[];
  isLoading: boolean;
  error: string | null;
}

interface SupplierActions {
  fetchSuppliers: (search?: string) => Promise<void>;
  addSupplier: (supplier: Omit<Supplier, 'id'>) => Promise<Supplier>;
  updateSupplier: (id: string, data: Partial<Omit<Supplier, 'id'>>) => Promise<void>;
  deleteSupplier: (id: string) => Promise<void>;
  initializeSuppliers: (suppliers: Supplier[]) => void;
  clearError: () => void;
}

type SupplierStore = SupplierState & SupplierActions;

// Helper to map API Supplier to frontend Supplier format
const mapAPISupplierToSupplier = (apiSupplier: APISupplier): Supplier => ({
  id: String(apiSupplier.id),
  name: apiSupplier.name,
  contact: apiSupplier.contact_info,
});

export const useSupplierStore = create<SupplierStore>((set, get) => ({
  suppliers: [],
  isLoading: false,
  error: null,

  fetchSuppliers: async (search?: string) => {
    set({ isLoading: true, error: null });
    try {
      const apiSuppliers = await supplierService.getSuppliers(search);
      const suppliers = apiSuppliers.map(mapAPISupplierToSupplier);
      set({ suppliers, isLoading: false });
    } catch (error) {
      console.error('Error fetching suppliers:', error);
      set({ error: 'Failed to fetch suppliers', isLoading: false });
    }
  },

  addSupplier: async (supplierData) => {
    set({ isLoading: true, error: null });
    try {
      const apiSupplier = await supplierService.createSupplier({
        name: supplierData.name,
        contact_info: supplierData.contact,
      });

      const supplier = mapAPISupplierToSupplier(apiSupplier);

      set((state) => ({
        suppliers: [...state.suppliers, supplier],
        isLoading: false,
      }));

      return supplier;
    } catch (error) {
      console.error('Error adding supplier:', error);
      set({ error: 'Failed to add supplier', isLoading: false });
      throw error;
    }
  },

  updateSupplier: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      const updateData: { name?: string; contact_info?: string } = {};
      if (data.name) updateData.name = data.name;
      if (data.contact) updateData.contact_info = data.contact;

      const apiSupplier = await supplierService.updateSupplier(parseInt(id), updateData);
      const updatedSupplier = mapAPISupplierToSupplier(apiSupplier);

      set((state) => ({
        suppliers: state.suppliers.map((s) =>
          s.id === id ? updatedSupplier : s
        ),
        isLoading: false,
      }));
    } catch (error) {
      console.error('Error updating supplier:', error);
      set({ error: 'Failed to update supplier', isLoading: false });
      throw error;
    }
  },

  deleteSupplier: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await supplierService.deleteSupplier(parseInt(id));

      set((state) => ({
        suppliers: state.suppliers.filter((s) => s.id !== id),
        isLoading: false,
      }));
    } catch (error) {
      console.error('Error deleting supplier:', error);
      set({ error: 'Failed to delete supplier', isLoading: false });
      throw error;
    }
  },

  initializeSuppliers: (suppliers) =>
    set(() => ({
      suppliers,
    })),

  clearError: () => set({ error: null }),
}));
