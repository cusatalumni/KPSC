
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
    
    const intIdTables = ['questionbank', 'liveupdates', 'syllabus', 'results'];
    
    const cleanData = data.map(item => {
        const entry: any = { ...item };
        
        // Coerce ID to integer for specific tables
        if (intIdTables.includes(table.toLowerCase()) && entry.id !== undefined) {
            entry.id = parseInt(String(entry.id));
            if (isNaN(entry.id)) {
                // If not a valid number, fallback to a timestamp to prevent crash, 
                // though source data should ideally be clean.
                entry.id = Date.now() + Math.floor(Math.random() * 1000);
            }
        }

        // Sanitize numeric fields based on schema
        if (Object.prototype.hasOwnProperty.call(entry, 'correct_answer_index')) {
            if (entry.correct_answer_index === "" || entry.correct_answer_index === undefined) entry.correct_answer_index = 0;
            else entry.correct_answer_index = parseInt(String(entry.correct_answer_index));
        }
        if (Object.prototype.hasOwnProperty.call(entry, 'questions')) {
            if (entry.questions === "" || entry.questions === undefined) entry.questions = 0;
            else entry.questions = parseInt(String(entry.questions));
        }
        if (Object.prototype.hasOwnProperty.call(entry, 'duration')) {
            if (entry.duration === "" || entry.duration === undefined) entry.duration = 0;
            else entry.duration = parseInt(String(entry.duration));
        }
        if (Object.prototype.hasOwnProperty.call(entry, 'score')) {
            entry.score = parseFloat(String(entry.score || '0'));
        }
        if (Object.prototype.hasOwnProperty.call(entry, 'total')) {
            entry.total = parseInt(String(entry.total || '0'));
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
    const intIdTables = ['questionbank', 'liveupdates', 'syllabus', 'results'];
    const cleanId = intIdTables.includes(table.toLowerCase()) ? parseInt(id) : id;
    const { error } = await supabase.from(table).delete().eq('id', cleanId);
    if (error) throw error;
}
