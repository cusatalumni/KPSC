
import { google } from 'googleapis';

declare var process: any;

/**
 * Robust private key formatting.
 * Handles literal \n strings and ensures proper headers for Node.js crypto decoder.
 */
const formatPrivateKey = (key: string | undefined): string | undefined => {
    if (!key) return undefined;
    
    let cleaned = key.trim();
    
    // Remove wrapping quotes if present
    if ((cleaned.startsWith('"') && cleaned.endsWith('"')) || 
        (cleaned.startsWith("'") && cleaned.endsWith("'"))) {
        cleaned = cleaned.slice(1, -1);
    }

    // Replace literal '\n' characters with actual newlines
    cleaned = cleaned.replace(/\\n/g, '\n');

    // Ensure BEGIN/END headers are present
    if (!cleaned.includes('-----BEGIN PRIVATE KEY-----')) {
        cleaned = `-----BEGIN PRIVATE KEY-----\n${cleaned}\n-----END PRIVATE KEY-----`;
    }

    return cleaned;
};

const getSpreadsheetId = (): string => {
    const id = process.env.SPREADSHEET_ID || process.env.GOOGLE_SPREADSHEET_ID || process.env.VITE_SPREADSHEET_ID;
    if (!id) {
        throw new Error('Backend Error: SPREADSHEET_ID missing from environment variables.');
    }
    return id.trim().replace(/['"]/g, '');
};

async function getSheetsClient(scopes: string[]) {
    const clientEmail = (process.env.GOOGLE_CLIENT_EMAIL || process.env.CLIENT_EMAIL)?.trim().replace(/['"]/g, '');
    const rawKey = process.env.GOOGLE_PRIVATE_KEY || process.env.PRIVATE_KEY;
    const privateKey = formatPrivateKey(rawKey);

    if (!clientEmail) {
        throw new Error(`Auth Config Error: GOOGLE_CLIENT_EMAIL is missing.`);
    }
    if (!privateKey || privateKey.length < 50) {
        throw new Error(`Auth Config Error: GOOGLE_PRIVATE_KEY is missing or too short.`);
    }

    try {
        // Use GoogleAuth with explicit credentials object - standard for modern googleapis versions
        const auth = new google.auth.GoogleAuth({
            credentials: {
                client_email: clientEmail,
                private_key: privateKey,
            },
            scopes: scopes,
        });

        const authClient = await auth.getClient();
        return google.sheets({ version: 'v4', auth: authClient as any });
    } catch (e: any) {
        console.error("Google Auth Scopes/Credentials Failure:", e.message);
        throw new Error(`Google API Authentication Failed: ${e.message}. Ensure the key is valid and the Sheet is shared with ${clientEmail}`);
    }
}

export const readSheetData = async (range: string) => {
    const spreadsheetId = getSpreadsheetId();
    const sheets = await getSheetsClient(['https://www.googleapis.com/auth/spreadsheets.readonly']);
    const response = await sheets.spreadsheets.values.get({ spreadsheetId, range });
    return response.data.values || [];
};

export const clearAndWriteSheetData = async (range: string, values: any[][]) => {
    const spreadsheetId = getSpreadsheetId();
    const sheets = await getSheetsClient(['https://www.googleapis.com/auth/spreadsheets']);
    const sheetName = range.split('!')[0];
    await sheets.spreadsheets.values.clear({ spreadsheetId, range });
    if (values.length === 0) return;
    await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `${sheetName}!A2`,
        valueInputOption: 'USER_ENTERED',
        requestBody: { values },
    });
};

export const appendSheetData = async (range: string, values: any[][]) => {
    if (values.length === 0) return;
    const spreadsheetId = getSpreadsheetId();
    const sheets = await getSheetsClient(['https://www.googleapis.com/auth/spreadsheets']);
    await sheets.spreadsheets.values.append({
        spreadsheetId,
        range,
        valueInputOption: 'USER_ENTERED',
        requestBody: { values },
    });
};

export const deleteRowById = async (sheetName: string, id: string) => {
    const spreadsheetId = getSpreadsheetId();
    const sheets = await getSheetsClient(['https://www.googleapis.com/auth/spreadsheets']);
    
    const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId });
    const sheet = spreadsheet.data.sheets?.find(s => s.properties?.title === sheetName);
    const sheetId = sheet?.properties?.sheetId;

    if (sheetId === undefined) throw new Error(`Sheet ${sheetName} not found.`);

    const response = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: `${sheetName}!A:A`,
    });
    const rows = response.data.values || [];
    const rowIndex = rows.findIndex(row => row[0] === id);

    if (rowIndex === -1) throw new Error(`Row with ID ${id} not found.`);

    await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: {
            requests: [
                {
                    deleteDimension: {
                        range: {
                            sheetId: sheetId,
                            dimension: 'ROWS',
                            startIndex: rowIndex,
                            endIndex: rowIndex + 1
                        }
                    }
                }
            ]
        }
    });
};

export const findAndUpsertRow = async (sheetName: string, findColumnIndex: number, findValue: string, newRowData: any[]) => {
    const spreadsheetId = getSpreadsheetId();
    const sheets = await getSheetsClient(['https://www.googleapis.com/auth/spreadsheets']);
    const response = await sheets.spreadsheets.values.get({ spreadsheetId, range: `${sheetName}!A:A` });
    const rows = response.data.values || [];
    const rowIndex = rows.findIndex(row => row[findColumnIndex] === findValue);

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
