import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || '';
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
    
    const cleanData = data.map(item => {
        const entry: any = { ...item };
        
        // ONLY sanitize numeric fields if they actually belong to the current data object
        // This stops errors like "couldnot find correct_answer_index in bookstore"
        if ('correct_answer_index' in entry) {
            if (entry.correct_answer_index === "" || entry.correct_answer_index === undefined) entry.correct_answer_index = 0;
            else entry.correct_answer_index = parseInt(String(entry.correct_answer_index));
        }
        if ('questions' in entry) {
            if (entry.questions === "" || entry.questions === undefined) entry.questions = 0;
            else entry.questions = parseInt(String(entry.questions));
        }
        if ('duration' in entry) {
            if (entry.duration === "" || entry.duration === undefined) entry.duration = 0;
            else entry.duration = parseInt(String(entry.duration));
        }
        
        return entry;
    });

    const { data: result, error } = await supabase
        .from(table)
        .upsert(cleanData, { onConflict });

    if (error) {
        console.error(`Supabase Upsert Failure [${table}]:`, error);
        throw new Error(`DB Error: ${error.message} (Column alignment mismatch)`);
    }
    return result;
}

export async function deleteSupabaseRow(table: string, id: string) {
    if (!supabase) return null;
    const { error } = await supabase.from(table).delete().eq('id', id);
    if (error) throw error;
}