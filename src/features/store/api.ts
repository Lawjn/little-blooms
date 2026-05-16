import { supabase } from '@/lib/supabase';

export interface StoreItem {
  id: string;
  type: 'seed_pack' | 'plant' | 'theme' | 'premium_pass' | 'set';
  name: string;
  description: string | null;
  price_vnd: number;
  product_id_ios: string | null;
  product_id_android: string | null;
  metadata: {
    seeds_count?: number;
    bonus?: number;
    plant_type?: string;
    theme_key?: string;
    period?: string;
  };
  is_active: boolean;
  display_order: number;
}

export async function listStoreItems(type?: StoreItem['type']) {
  let q = supabase
    .from('store_items')
    .select('*')
    .eq('is_active', true)
    .order('display_order', { ascending: true });
  if (type) q = q.eq('type', type);
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []) as StoreItem[];
}
