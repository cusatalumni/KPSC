import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '';

export const supabase = (supabaseUrl && supabaseKey) 
    ? createClient(supabaseUrl, supabaseKey, {
        auth: { persistSession: false, autoRefreshToken: false }
      }) 
    : null;

export async function upsertSupabaseData(table: string, data: any[], onConflict: string = 'id') {
    if (!supabase) return null;
    
    const intIdTables = ['questionbank', 'liveupdates', 'results'];
    const cleanTable = table.toLowerCase();
    
    const cleanData = data.map(item => {
        const entry: any = { ...item };
        
        if (intIdTables.includes(cleanTable) && entry.id !== undefined) {
            const parsedId = parseInt(String(entry.id));
            entry.id = isNaN(parsedId) ? (Date.now() + Math.floor(Math.random() * 1000)) : parsedId;
        } else if (entry.id !== undefined) {
            entry.id = String(entry.id).trim();
        }

        // Standardize common fields
        if (Object.prototype.hasOwnProperty.call(entry, 'correct_answer_index')) {
            entry.correct_answer_index = parseInt(String(entry.correct_answer_index || '0'));
        }
        if (Object.prototype.hasOwnProperty.call(entry, 'questions')) {
            entry.questions = parseInt(String(entry.questions || '0'));
        }
        if (Object.prototype.hasOwnProperty.call(entry, 'duration')) {
            entry.duration = parseInt(String(entry.duration || '0'));
        }
        
        return entry;
    });

    // CRITICAL: Deduplicate data by primary key before sending to Supabase
    // This prevents the "ON CONFLICT DO UPDATE command cannot affect row a second time" error
    const uniqueMap = new Map();
    cleanData.forEach(item => {
        const pk = item[onConflict];
        if (pk) uniqueMap.set(pk, item);
    });
    const finalBatch = Array.from(uniqueMap.values());

    const { data: result, error } = await supabase
        .from(cleanTable)
        .upsert(finalBatch, { onConflict });

    if (error) {
        console.error(`Supabase Upsert Failed [${cleanTable}]:`, error.message);
        throw new Error(`Supabase Error: ${error.message}`);
    }
    return result;
}

export async function deleteSupabaseRow(table: string, id: string) {
    if (!supabase) return null;
    const intIdTables = ['questionbank', 'liveupdates', 'results'];
    const cleanId = intIdTables.includes(table.toLowerCase()) ? parseInt(id) : id;
    const { error } = await supabase.from(table.toLowerCase()).delete().eq('id', cleanId);
    if (error) throw error;
}