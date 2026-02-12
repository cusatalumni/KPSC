import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '';

export const supabase = (supabaseUrl && supabaseKey) 
    ? createClient(supabaseUrl, supabaseKey, {
        auth: { persistSession: false, autoRefreshToken: false }
      }) 
    : null;

export async function upsertSupabaseData(table: string, data: any[], onConflict: string = 'id') {
    if (!supabase || !data.length) return null;
    
    const cleanTable = table.toLowerCase();
    
    // 1. Clean and validate data types
    const processedData = data.map(item => {
        const entry: any = { ...item };
        
        // Ensure ID is string unless it's a numeric table
        const intIdTables = ['questionbank', 'results', 'liveupdates'];
        if (intIdTables.includes(cleanTable) && entry.id !== undefined) {
            entry.id = parseInt(String(entry.id));
        } else if (entry.id !== undefined) {
            entry.id = String(entry.id).trim();
        }

        // Standardize numeric fields
        if (entry.correct_answer_index !== undefined) entry.correct_answer_index = parseInt(String(entry.correct_answer_index));
        if (entry.questions !== undefined) entry.questions = parseInt(String(entry.questions));
        if (entry.duration !== undefined) entry.duration = parseInt(String(entry.duration));
        
        return entry;
    });

    // 2. CRITICAL: Deduplicate the input array by the primary key (id/key/topic)
    // This prevents the "ON CONFLICT DO UPDATE command cannot affect row a second time" error
    const uniqueMap = new Map();
    processedData.forEach(item => {
        const pkValue = item[onConflict];
        if (pkValue !== undefined && pkValue !== null) {
            uniqueMap.set(pkValue, item);
        }
    });
    
    const finalBatch = Array.from(uniqueMap.values());

    const { data: result, error } = await supabase
        .from(cleanTable)
        .upsert(finalBatch, { onConflict });

    if (error) {
        console.error(`Supabase Upsert Error [${cleanTable}]:`, error.message);
        throw new Error(`Supabase Error: ${error.message}`);
    }
    return result;
}

export async function deleteSupabaseRow(table: string, id: string) {
    if (!supabase) return null;
    const cleanTable = table.toLowerCase();
    const intIdTables = ['questionbank', 'results', 'liveupdates'];
    const cleanId = intIdTables.includes(cleanTable) ? parseInt(id) : id;
    
    const { error } = await supabase.from(cleanTable).delete().eq('id', cleanId);
    if (error) throw error;
}