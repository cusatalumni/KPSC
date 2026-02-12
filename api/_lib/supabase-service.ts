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
    
    const processedData = data.map(item => {
        const entry: any = { ...item };
        
        // Handle Integer IDs for specific tables
        const intIdTables = ['questionbank', 'results', 'liveupdates'];
        if (intIdTables.includes(cleanTable) && entry.id !== undefined) {
            const parsedId = parseInt(String(entry.id));
            entry.id = isNaN(parsedId) ? (Date.now() + Math.floor(Math.random() * 1000)) : parsedId;
        } else if (entry.id !== undefined) {
            entry.id = String(entry.id).trim();
        }

        // Sanitization of common numeric fields
        if (entry.correct_answer_index !== undefined) entry.correct_answer_index = parseInt(String(entry.correct_answer_index || '0'));
        if (entry.questions !== undefined) entry.questions = parseInt(String(entry.questions || '0'));
        if (entry.duration !== undefined) entry.duration = parseInt(String(entry.duration || '0'));
        
        return entry;
    });

    // Deduplicate by primary key before upserting
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
        console.error(`Supabase Sync Error [${cleanTable}]:`, error.message);
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