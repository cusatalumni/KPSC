
import { google } from 'googleapis';

declare var process: any;

/**
 * Advanced sanitizer for Google Private Key.
 * Handles: escaped newlines, wrapping quotes, and missing PEM headers.
 */
const getFormattedKey = (key: string | undefined): string | undefined => {
    if (!key) return undefined;
    
    let cleaned = key.trim();

    // 1. Remove wrapping quotes if present
    if ((cleaned.startsWith('"') && cleaned.endsWith('"')) || (cleaned.startsWith("'") && cleaned.endsWith("'"))) {
        cleaned = cleaned.substring(1, cleaned.length - 1);
    }

    // 2. Convert literal "\n" strings to actual newline characters
    cleaned = cleaned.replace(/\\n/g, '\n');

    // 3. Ensure the key has the correct PEM headers
    if (!cleaned.includes('-----BEGIN PRIVATE KEY-----')) {
        cleaned = `-----BEGIN PRIVATE KEY-----\n${cleaned}\n-----END PRIVATE KEY-----`;
    }

    return cleaned;
};

const getSpreadsheetId = (): string => {
    const id = process.env.SPREADSHEET_ID || process.env.GOOGLE_SPREADSHEET_ID;
    if (!id) throw new Error('SPREADSHEET_ID is not configured in Vercel.');
    return id.trim().replace(/['"]/g, '');
};

async function getSheetsClient() {
    const clientEmail = process.env.GOOGLE_CLIENT_EMAIL?.trim().replace(/['"]/g, '');
    const rawKey = process.env.GOOGLE_PRIVATE_KEY;
    const privateKey = getFormattedKey(rawKey);

    if (!clientEmail || !privateKey) {
        throw new Error('Google Sheets credentials (EMAIL or PRIVATE_KEY) are missing or invalid.');
    }

    try {
        // Direct credential injection is more reliable in serverless
        const auth = new google.auth.GoogleAuth({
            credentials: {
                client_email: clientEmail,
                private_key: privateKey,
            },
            scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });

        const authClient = await auth.getClient();
        return google.sheets({ version: 'v4', auth: authClient as any });
    } catch (e: any) {
        console.error("Sheets Auth System Error:", e.message);
        throw new Error(`Auth Initialization Failed: ${e.message}`);
    }
}

export const readSheetData = async (range: string) => {
    try {
        const spreadsheetId = getSpreadsheetId();
        const sheets = await getSheetsClient();
        const response = await sheets.spreadsheets.values.get({ spreadsheetId, range });
        return response.data.values || [];
    } catch (e: any) {
        console.error(`Fetch Error on ${range}:`, e.message);
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
        console.error(`Append Error on ${range}:`, e.message);
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
        console.error(`Write Error on ${range}:`, e.message);
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
        console.error(`Upsert Error:`, e.message);
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
        console.error(`Delete Error:`, e.message);
        throw e;
    }
};
