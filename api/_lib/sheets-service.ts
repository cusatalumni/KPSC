
import { google } from 'googleapis';

declare var process: any;

/**
 * Robust private key formatter for Google Service Account keys.
 * Handles common environment variable issues in Vercel.
 */
const formatPrivateKey = (key: string | undefined): string | undefined => {
    if (!key) return undefined;
    
    let cleaned = key.trim();
    
    // 1. Remove wrapping quotes if present
    if (cleaned.startsWith('"') && cleaned.endsWith('"')) {
        cleaned = cleaned.substring(1, cleaned.length - 1);
    }
    if (cleaned.startsWith("'") && cleaned.endsWith("'")) {
        cleaned = cleaned.substring(1, cleaned.length - 1);
    }
    
    // 2. Fix escaped newlines which is the #1 cause of auth failure
    cleaned = cleaned.replace(/\\n/g, '\n');
    
    // 3. Ensure standard PEM headers are present
    if (cleaned && !cleaned.includes('-----BEGIN PRIVATE KEY-----')) {
        cleaned = `-----BEGIN PRIVATE KEY-----\n${cleaned}\n-----END PRIVATE KEY-----`;
    }
    
    return cleaned;
};

const getSpreadsheetId = (): string => {
    const id = process.env.SPREADSHEET_ID || process.env.GOOGLE_SPREADSHEET_ID;
    if (!id) throw new Error('Missing SPREADSHEET_ID environment variable.');
    return id.trim().replace(/['"]/g, '');
};

async function getSheetsClient() {
    const clientEmail = process.env.GOOGLE_CLIENT_EMAIL?.trim().replace(/['"]/g, '');
    const rawKey = process.env.GOOGLE_PRIVATE_KEY;
    const privateKey = formatPrivateKey(rawKey);

    if (!clientEmail) throw new Error('GOOGLE_CLIENT_EMAIL is missing in environment variables.');
    if (!privateKey) throw new Error('GOOGLE_PRIVATE_KEY is missing or malformed.');

    try {
        const scopes = ['https://www.googleapis.com/auth/spreadsheets'];
        
        // Use the object-based constructor for better reliability with the library
        const auth = new google.auth.JWT({
            email: clientEmail,
            key: privateKey,
            scopes: scopes
        });

        // Test authorization immediately to catch key errors
        await auth.authorize();
        
        return google.sheets({ version: 'v4', auth });
    } catch (e: any) {
        console.error("Sheets Auth Exception:", e.message);
        // Map common errors to user-friendly messages
        let msg = e.message;
        if (msg.includes('No key or keyFile set')) {
            msg = 'The Private Key is empty or invalid. Please check the Vercel GOOGLE_PRIVATE_KEY variable.';
        } else if (msg.includes('invalid_grant')) {
            msg = 'Authentication Failed: Invalid credentials or key expired.';
        }
        throw new Error(`Authentication Failed: ${msg}`);
    }
}

export const readSheetData = async (range: string) => {
    try {
        const spreadsheetId = getSpreadsheetId();
        const sheets = await getSheetsClient();
        const response = await sheets.spreadsheets.values.get({ spreadsheetId, range });
        return response.data.values || [];
    } catch (e: any) {
        console.error(`Read Error on range ${range}:`, e.message);
        throw e;
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
    } catch (e: any) {
        console.error(`Append Error on range ${range}:`, e.message);
        throw e;
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
    } catch (e: any) {
        console.error(`Write Error on range ${range}:`, e.message);
        throw e;
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
    } catch (e: any) {
        console.error(`Upsert Error on sheet ${sheetName}:`, e.message);
        throw e;
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
    } catch (e: any) {
        console.error(`Delete Error on sheet ${sheetName}:`, e.message);
        throw e;
    }
};
