import { supabase } from '@/lib/supabase';
import type { PlantType } from '@/features/garden/mapping';

export interface UserInventory {
  user_id: string;
  seeds_balance: number;
  owned_themes: string[];
  active_theme: string;
  active_plant: PlantType;
  owned_plants: PlantType[];
  last_watered_date: string | null;
  water_streak: number;
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

/**
 * Cộng seeds — dùng cho reward (main entry save, streak bonus) hoặc buy with $$.
 */
export async function addSeeds(params: { userId: string; amount: number }) {
  // Read current, then update — RLS prevents race with single user
  const current = await getInventory(params.userId);
  const newBalance = (current?.seeds_balance ?? 0) + params.amount;
  const { data, error } = await supabase
    .from('user_inventory')
    .upsert(
      { user_id: params.userId, seeds_balance: newBalance },
      { onConflict: 'user_id' },
    )
    .select()
    .single();
  if (error) throw error;
  return data as UserInventory;
}

/**
 * Spend seeds + unlock plant. Atomic-ish (read balance → check → update).
 * Throw nếu không đủ seeds hoặc plant đã unlock.
 */
export async function unlockPlant(params: {
  userId: string;
  plant: PlantType;
  cost: number;
}) {
  const current = await getInventory(params.userId);
  if (!current) throw new Error('Inventory not found');
  if (current.owned_plants.includes(params.plant)) {
    throw new Error('Plant đã được unlock rồi');
  }
  if (current.seeds_balance < params.cost) {
    throw new Error(
      `Không đủ seeds. Cần ${params.cost}, hiện có ${current.seeds_balance}.`,
    );
  }

  const newBalance = current.seeds_balance - params.cost;
  const newOwned = [...current.owned_plants, params.plant];
  const { data, error } = await supabase
    .from('user_inventory')
    .update({
      seeds_balance: newBalance,
      owned_plants: newOwned,
    })
    .eq('user_id', params.userId)
    .select()
    .single();
  if (error) throw error;
  return data as UserInventory;
}

/**
 * Fake purchase seeds với $$ — dùng cho coursework demo (không cần real IAP).
 * Cộng seeds + log transaction vào purchases table.
 */
export async function fakePurchaseSeeds(params: {
  userId: string;
  amount: number;
  pricePaidVnd: number;
}) {
  const updated = await addSeeds({ userId: params.userId, amount: params.amount });

  // Log fake transaction
  await supabase.from('purchases').insert({
    user_id: params.userId,
    platform: 'ios', // fake
    receipt: `fake-receipt-${Date.now()}`,
    transaction_id: `fake-txn-${Date.now()}`,
    amount_vnd: params.pricePaidVnd,
    status: 'completed',
    completed_at: new Date().toISOString(),
  });

  return updated;
}

/**
 * Tưới cây — daily streak action. Chỉ tưới được 1 lần/ngày.
 * Tăng water_streak (consecutive days), set last_watered_date = today.
 * Trả về { inventory, alreadyWatered } — alreadyWatered=true nếu đã tưới hôm nay.
 */
export async function waterPlant(params: { userId: string; todayStr: string }) {
  const current = await getInventory(params.userId);
  if (current?.last_watered_date === params.todayStr) {
    return { inventory: current, alreadyWatered: true };
  }

  // Streak: nếu last_watered = hôm qua → +1, else reset về 1
  let newStreak = 1;
  if (current?.last_watered_date) {
    const last = new Date(current.last_watered_date);
    const today = new Date(params.todayStr);
    const diffDays = Math.round((today.getTime() - last.getTime()) / 86400000);
    newStreak = diffDays === 1 ? current.water_streak + 1 : 1;
  }

  const { data, error } = await supabase
    .from('user_inventory')
    .upsert(
      {
        user_id: params.userId,
        last_watered_date: params.todayStr,
        water_streak: newStreak,
      },
      { onConflict: 'user_id' },
    )
    .select()
    .single();
  if (error) throw error;
  return { inventory: data as UserInventory, alreadyWatered: false };
}

/**
 * Đổi weather theme cho garden (sunny/cloudy/rainy/snowy).
 */
export async function updateActiveTheme(params: { userId: string; theme: string }) {
  const { data, error } = await supabase
    .from('user_inventory')
    .upsert(
      { user_id: params.userId, active_theme: params.theme },
      { onConflict: 'user_id' },
    )
    .select()
    .single();
  if (error) throw error;
  return data as UserInventory;
}

/**
 * Toggle premium status — fake subscription cho coursework.
 */
export async function setPremium(params: { userId: string; isPremium: boolean }) {
  const { data, error } = await supabase
    .from('profiles')
    .update({ is_premium: params.isPremium })
    .eq('id', params.userId)
    .select()
    .single();
  if (error) throw error;
  return data;
}
