import { supabase } from '@/lib/supabase';
import type { PlantType } from '@/features/garden/mapping';

export interface UserInventory {
  user_id: string;
  seeds_balance: number;
  owned_themes: string[];
  active_theme: string;
  active_plant: PlantType;
  updated_at: string;
}

export async function getInventory(userId: string): Promise<UserInventory | null> {
  const { data, error } = await supabase
    .from('user_inventory')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();
  if (error) throw error;
  return (data as UserInventory | null) ?? null;
}

export async function updateActivePlant(params: { userId: string; plant: PlantType }) {
  // Dùng upsert thay vì update — defensive cho user đã signup trước khi có trigger
  // handle_new_user. Nếu row chưa tồn tại, insert default + active_plant.
  const { data, error } = await supabase
    .from('user_inventory')
    .upsert(
      { user_id: params.userId, active_plant: params.plant },
      { onConflict: 'user_id' },
    )
    .select()
    .single();
  if (error) {
    console.warn('[updateActivePlant] error:', JSON.stringify(error, null, 2));
    throw error;
  }
  return data as UserInventory;
}
