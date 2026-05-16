import { decode } from 'base64-arraybuffer';
import { supabase } from '@/lib/supabase';
import type { MoodPulse, MoodPulseInput } from './types';

export async function createPulse(params: { userId: string; input: MoodPulseInput }) {
  const { data, error } = await supabase
    .from('mood_pulses')
    .insert({
      user_id: params.userId,
      mood_level: params.input.mood_level,
      note: params.input.note,
      photo_urls: params.input.photo_urls,
    })
    .select()
    .single();
  if (error) throw error;
  return data as MoodPulse;
}

export async function listPulsesByDate(params: { userId: string; date: string }) {
  // date format YYYY-MM-DD. Filter pulses logged_at trong khoảng [date 00:00, date+1 00:00)
  const { data, error } = await supabase
    .from('mood_pulses')
    .select('*')
    .eq('user_id', params.userId)
    .gte('logged_at', `${params.date}T00:00:00`)
    .lt('logged_at', `${params.date}T23:59:59.999`)
    .order('logged_at', { ascending: true });
  if (error) throw error;
  return (data ?? []) as MoodPulse[];
}

export async function listPulsesInRange(params: {
  userId: string;
  startDate: string;
  endDate: string;
}) {
  const { data, error } = await supabase
    .from('mood_pulses')
    .select('*')
    .eq('user_id', params.userId)
    .gte('logged_at', `${params.startDate}T00:00:00`)
    .lt('logged_at', `${params.endDate}T23:59:59.999`)
    .order('logged_at', { ascending: true });
  if (error) throw error;
  return (data ?? []) as MoodPulse[];
}

export async function deletePulse(pulseId: string) {
  const { error } = await supabase.from('mood_pulses').delete().eq('id', pulseId);
  if (error) throw error;
}

/**
 * Upload pulse photo lên bucket `mood-photos` với path
 * `{userId}/pulses/{pulseId}/{idx}.{ext}` — match RLS folder pattern.
 */
export async function uploadPulsePhoto(params: {
  userId: string;
  pulseTempId: string; // có thể tạm uuid client, hoặc uuid sau khi insert pulse
  index: number;
  asset: { uri: string; base64?: string | null; mimeType?: string | null };
}): Promise<string> {
  if (!params.asset.base64) throw new Error('Asset thiếu base64');
  const mime = params.asset.mimeType ?? 'image/jpeg';
  const ext = mime.split('/')[1]?.replace('jpeg', 'jpg') ?? 'jpg';
  const path = `${params.userId}/pulses/${params.pulseTempId}/${params.index}.${ext}`;
  const arrayBuffer = decode(params.asset.base64);
  const { error } = await supabase.storage
    .from('mood-photos')
    .upload(path, arrayBuffer, { contentType: mime, upsert: true });
  if (error) throw error;
  return path;
}
