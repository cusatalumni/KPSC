
import { google } from 'googleapis';

declare var process: any;

/**
 * Robust private key formatter for Google Service Account keys.
 * Handles: 
 * - Literal newlines vs escaped \n
 * - Double-quoted strings from Vercel env UI
 * - Missing PEM headers
 */
const formatPrivateKey = (key: string | undefined): string | undefined => {
    if (!key) return undefined;
    
    let cleaned = key.trim();
    
    // 1. Remove wrapping quotes that Vercel or users might add
    if (cleaned.startsWith('"') && cleaned.endsWith('"')) {
        cleaned = cleaned.substring(1, cleaned.length - 1);
    }
    if (cleaned.startsWith("'") && cleaned.endsWith("'")) {
        cleaned = cleaned.substring(1, cleaned.length - 1);
    }
    
    // 2. Critical Fix: Handle double-escaped newlines. 
    // Vercel sometimes treats the string as a literal with \\n
    cleaned = cleaned.replace(/\\n/g, '\n');
    
    // 3. Ensure the key is wrapped in the standard PEM headers if they are missing
    if (cleaned && !cleaned.includes('-----BEGIN PRIVATE KEY-----')) {
        cleaned = `-----BEGIN PRIVATE KEY-----\n${cleaned}\n-----END PRIVATE KEY-----`;
    }
    
    return cleaned;
};

const getSpreadsheetId = (): string => {
    const id = process.env.SPREADSHEET_ID || process.env.GOOGLE_SPREADSHEET_ID;
    if (!id) throw new Error('SPREADSHEET_ID is missing.');
    return id.trim().replace(/['"]/g, '');
};

async function getSheetsClient() {
    const clientEmail = process.env.GOOGLE_CLIENT_EMAIL?.trim().replace(/['"]/g, '');
    const rawKey = process.env.GOOGLE_PRIVATE_KEY;
    const privateKey = formatPrivateKey(rawKey);

    if (!clientEmail) throw new Error('GOOGLE_CLIENT_EMAIL is missing.');
    if (!privateKey) throw new Error('GOOGLE_PRIVATE_KEY is missing.');

    try {
        const auth = new google.auth.JWT(
            clientEmail,
            null,
            privateKey,
            ['https://www.googleapis.com/auth/spreadsheets']
        );
        
        await auth.authorize();
        return google.sheets({ version: 'v4', auth });
    } catch (e: any) {
        console.error("Auth Failure Details:", e.message);
        throw new Error(`Authentication Failed: ${e.message}`);
    }
}

export const readSheetData = async (range: string) => {
    const spreadsheetId = getSpreadsheetId();
    const sheets = await getSheetsClient();
    const response = await sheets.spreadsheets.values.get({ spreadsheetId, range });
    return response.data.values || [];
};

export const appendSheetData = async (range: string, values: any[][]) => {
    if (!values.length) return;
    const spreadsheetId = getSpreadsheetId();
    const sheets = await getSheetsClient();
    await sheets.spreadsheets.values.append({
        spreadsheetId,
        range,
        valueInputOption: 'USER_ENTERED',
        requestBody: { values },
    });
};

export const clearAndWriteSheetData = async (range: string, values: any[][]) => {
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
};

export const findAndUpsertRow = async (sheetName: string, id: string, newRowData: any[]) => {
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
};

export const deleteRowById = async (sheetName: string, id: string) => {
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
};
