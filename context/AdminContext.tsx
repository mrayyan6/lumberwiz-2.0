"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { createClient } from "@/lib/supabase-browser";
import type { Product } from "@/data/products";

export interface AdminModalState {
  mode: "add" | "edit";
  product?: Product;
  initialCategory?: string;
  onSuccess?: () => void;
}

interface AdminContextType {
  isAdmin: boolean;
  openAdd: (initialCategory?: string, onSuccess?: () => void) => void;
  openEdit: (product: Product, onSuccess?: () => void) => void;
  closeModal: () => void;
  modalState: AdminModalState | null;
}

const AdminContext = createContext<AdminContextType>({
  isAdmin: false,
  openAdd: () => {},
  openEdit: () => {},
  closeModal: () => {},
  modalState: null,
});

export function useAdmin() {
  return useContext(AdminContext);
}

export function AdminProvider({ children }: { children: ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [modalState, setModalState] = useState<AdminModalState | null>(null);

  useEffect(() => {
    const supabase = createClient();

    async function checkAdmin(userId: string) {
      const { data } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", userId)
        .single();
      setIsAdmin(data?.role === "admin");
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) checkAdmin(session.user.id);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        checkAdmin(session.user.id);
      } else {
        setIsAdmin(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const openAdd = useCallback(
    (initialCategory?: string, onSuccess?: () => void) => {
      setModalState({ mode: "add", initialCategory, onSuccess });
    },
    []
  );

  const openEdit = useCallback(
    (product: Product, onSuccess?: () => void) => {
      setModalState({ mode: "edit", product, onSuccess });
    },
    []
  );

  const closeModal = useCallback(() => {
    setModalState(null);
  }, []);

  return (
    <AdminContext.Provider
      value={{ isAdmin, openAdd, openEdit, closeModal, modalState }}
    >
      {children}
    </AdminContext.Provider>
  );
}
