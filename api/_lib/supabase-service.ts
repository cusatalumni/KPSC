
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || '';
// Use Service Role Key if available to bypass RLS, otherwise fallback to Anon Key
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '';

export const supabase = (supabaseUrl && supabaseKey) 
    ? createClient(supabaseUrl, supabaseKey, {
        auth: {
          persistSession: false,
          autoRefreshToken: false
        }
      }) 
    : null;

/**
 * Bulk insert or update data into Supabase
 * @param onConflict The column name to check for conflicts (defaults to 'id')
 */
export async function upsertSupabaseData(table: string, data: any[], onConflict: string = 'id') {
    if (!supabase) return null;
    
    // Ensure all data objects are clean and formatted correctly for Supabase
    const cleanData = data.map(item => {
        const entry: any = { ...item };
        // Convert any empty strings to null for numeric/json columns if necessary
        return entry;
    });

    const { data: result, error } = await supabase
        .from(table)
        .upsert(cleanData, { onConflict });

    if (error) {
        console.error(`Supabase Upsert Error (${table}):`, error.message, error.details);
        throw new Error(`Supabase Sync Failed: ${error.message} (${error.details || 'Check column types'})`);
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
