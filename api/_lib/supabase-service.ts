
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_ANON_KEY || '';

export const supabase = (supabaseUrl && supabaseKey) 
    ? createClient(supabaseUrl, supabaseKey) 
    : null;

/**
 * Bulk insert or update data into Supabase
 * @param onConflict The column name to check for conflicts (defaults to 'id')
 */
export async function upsertSupabaseData(table: string, data: any[], onConflict: string = 'id') {
    if (!supabase) return null;
    
    const { data: result, error } = await supabase
        .from(table)
        .upsert(data, { onConflict });

    if (error) {
        console.error(`Supabase Upsert Error (${table}):`, error.message);
        throw error;
    }
    return result;
}

/**
 * Delete a row from Supabase
 */
export async function deleteSupabaseRow(table: string, id: string) {
    if (!supabase) return null;
    const { error } = await supabase.from(table).delete().eq('id', id);
    if (error) throw error;
}
