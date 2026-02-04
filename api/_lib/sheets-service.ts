
import { google } from 'googleapis';

declare var process: any;

/**
 * Enhanced private key formatter to handle common issues with Vercel/Env variables.
 * It strips quotes, handles escaped newlines, and ensures the key is in a valid PEM format.
 */
const formatPrivateKey = (key: string | undefined): string | undefined => {
    if (!key) return undefined;
    
    let cleaned = key.trim();
    
    // 1. Remove wrapping quotes (single or double) if present
    if ((cleaned.startsWith('"') && cleaned.endsWith('"')) || 
        (cleaned.startsWith("'") && cleaned.endsWith("'"))) {
        cleaned = cleaned.substring(1, cleaned.length - 1);
    }
    
    // 2. Unescape literal backslash-n sequences back to real newlines
    // Vercel sometimes double-escapes these depending on how they are entered.
    cleaned = cleaned.replace(/\\n/g, '\n');
    
    // 3. Ensure the key actually starts and ends with the PEM headers
    // If a user only pasted the body, this would fix it (though usually they paste the whole thing)
    if (cleaned && !cleaned.includes('-----BEGIN PRIVATE KEY-----')) {
        cleaned = `-----BEGIN PRIVATE KEY-----\n${cleaned}\n-----END PRIVATE KEY-----`;
    }
    
    return cleaned;
};

const getSpreadsheetId = (): string => {
    const id = process.env.SPREADSHEET_ID || process.env.GOOGLE_SPREADSHEET_ID;
    if (!id) throw new Error('Missing SPREADSHEET_ID.');
    return id.trim().replace(/['"]/g, '');
};

async function getSheetsClient() {
    const clientEmail = process.env.GOOGLE_CLIENT_EMAIL?.trim().replace(/['"]/g, '');
    const rawKey = process.env.GOOGLE_PRIVATE_KEY;
    const privateKey = formatPrivateKey(rawKey);

    // Strict validation before passing to the library
    if (!clientEmail) {
        throw new Error('GOOGLE_CLIENT_EMAIL is missing. Check your Vercel/Env settings.');
    }
    if (!privateKey) {
        throw new Error('GOOGLE_PRIVATE_KEY is missing. Check your Vercel/Env settings.');
    }
    if (privateKey.length < 500) {
        throw new Error(`GOOGLE_PRIVATE_KEY appears truncated or invalid (Length: ${privateKey.length}). Expected ~1600+ chars.`);
    }

    try {
        // We explicitly pass the key to the JWT constructor.
        // Third param is 'key', second is 'keyFile' (which we leave null).
        const auth = new google.auth.JWT(
            clientEmail,
            null, 
            privateKey,
            ['https://www.googleapis.com/auth/spreadsheets']
        );
        
        // Force authentication attempt to catch errors early
        await auth.authorize();
        
        return google.sheets({ version: 'v4', auth });
    } catch (e: any) {
        console.error("Sheets Auth Exception:", e.message);
        // Clean the error message for the frontend
        const cleanMsg = e.message.includes('No key or keyFile set') 
            ? 'The Private Key was not recognized. Please re-check the GOOGLE_PRIVATE_KEY format in Vercel.'
            : e.message;
        throw new Error(`Authentication Failed: ${cleanMsg}`);
    }
}

export const readSheetData = async (range: string) => {
    try {
        const spreadsheetId = getSpreadsheetId();
        const sheets = await getSheetsClient();
        const response = await sheets.spreadsheets.values.get({ spreadsheetId, range });
        return response.data.values || [];
    } catch (error: any) {
        console.error(`Read Error [${range}]:`, error.message);
        throw error;
    }
};

export const appendSheetData = async (range: string, values: any[][]) => {
    if (!values.length) return;
    try {
        const spreadsheetId = getSpreadsheetId();
        const sheets = await getSheetsClient();
        await sheets.spreadsheets.values.append({
            spreadsheetId,
            range,
            valueInputOption: 'USER_ENTERED',
            requestBody: { values },
        });
    } catch (error: any) {
        console.error(`Append Error [${range}]:`, error.message);
        throw error;
    }
};

export const clearAndWriteSheetData = async (range: string, values: any[][]) => {
    try {
        const spreadsheetId = getSpreadsheetId();
        const sheets = await getSheetsClient();
        await sheets.spreadsheets.values.clear({ spreadsheetId, range });
        if (values.length > 0) {
            await sheets.spreadsheets.values.update({
                spreadsheetId,
                range,
                valueInputOption: 'USER_ENTERED',
                requestBody: { values },
            });
        }
    } catch (error: any) {
        console.error(`Clear/Write Error [${range}]:`, error.message);
        throw error;
    }
};

export const findAndUpsertRow = async (sheetName: string, id: string, newRowData: any[]) => {
    try {
        const spreadsheetId = getSpreadsheetId();
        const sheets = await getSheetsClient();
        const response = await sheets.spreadsheets.values.get({ spreadsheetId, range: `${sheetName}!A:A` });
        const rows = response.data.values || [];
        const rowIndex = rows.findIndex(row => row[0] === id);
        
        if (rowIndex !== -1) {
            await sheets.spreadsheets.values.update({
                spreadsheetId,
                range: `${sheetName}!A${rowIndex + 1}`,
                valueInputOption: 'USER_ENTERED',
                requestBody: { values: [newRowData] },
            });
        } else {
            await sheets.spreadsheets.values.append({
                spreadsheetId,
                range: `${sheetName}!A1`,
                valueInputOption: 'USER_ENTERED',
                requestBody: { values: [newRowData] },
            });
        }
    } catch (error: any) {
        console.error(`Upsert Error [${sheetName}]:`, error.message);
        throw error;
    }
};

export const deleteRowById = async (sheetName: string, id: string) => {
    try {
        const spreadsheetId = getSpreadsheetId();
        const sheets = await getSheetsClient();
        const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId });
        const sheet = spreadsheet.data.sheets?.find(s => s.properties?.title === sheetName);
        const sheetId = sheet?.properties?.sheetId;
        if (sheetId === undefined) throw new Error(`Sheet tab "${sheetName}" not found.`);

        const response = await sheets.spreadsheets.values.get({ spreadsheetId, range: `${sheetName}!A:A` });
        const rows = response.data.values || [];
        const rowIndex = rows.findIndex(row => row[0] === id);
        
        if (rowIndex === -1) return;

        await sheets.spreadsheets.batchUpdate({
            spreadsheetId,
            requestBody: {
                requests: [{
                    deleteDimension: {
                        range: {
                            sheetId,
                            dimension: 'ROWS',
                            startIndex: rowIndex,
                            endIndex: rowIndex + 1
                        }
                    }
                }]
            }
        });
    } catch (error: any) {
        console.error(`Delete Error [${sheetName}]:`, error.message);
        throw error;
    }
};
