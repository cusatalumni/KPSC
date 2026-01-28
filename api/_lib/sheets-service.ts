
import { google } from 'googleapis';

declare var process: any;

/**
 * Helper to clean environment variable strings.
 * Removes leading/trailing quotes that often appear during copy-pasting in Vercel/Dashboards.
 */
const cleanEnvVar = (val: string | undefined): string | undefined => {
    if (!val) return undefined;
    return val.trim().replace(/^["'](.*)["']$/, '$1');
};

/**
 * Creates an authorized Sheets client using JWT directly.
 */
async function getSheetsClient(scopes: string[]) {
    // Attempt to get variables from both standard and VITE_ prefixed names as a fallback
    const rawEmail = process.env.GOOGLE_CLIENT_EMAIL || process.env.VITE_GOOGLE_CLIENT_EMAIL;
    const rawKey = process.env.GOOGLE_PRIVATE_KEY || process.env.VITE_GOOGLE_PRIVATE_KEY;

    const clientEmail = cleanEnvVar(rawEmail);
    const privateKey = cleanEnvVar(rawKey);

    if (!clientEmail) {
        throw new Error('Backend Config Error: GOOGLE_CLIENT_EMAIL is missing or empty.');
    }
    if (!privateKey) {
        throw new Error('Backend Config Error: GOOGLE_PRIVATE_KEY is missing or empty.');
    }

    // Ensure the private key is properly formatted (handling escaped newlines)
    const formattedKey = privateKey.replace(/\\n/g, '\n');

    try {
        const auth = new google.auth.JWT(
            clientEmail,
            undefined,
            formattedKey,
            scopes
        );
        return google.sheets({ version: 'v4', auth });
    } catch (e: any) {
        console.error("Failed to initialize Google Auth JWT:", e.message);
        throw new Error(`Google Auth Initialization Failed: ${e.message}`);
    }
}

export const readSheetData = async (range: string) => {
    const SPREADSHEET_ID = cleanEnvVar(process.env.SPREADSHEET_ID || process.env.VITE_SPREADSHEET_ID);
    if (!SPREADSHEET_ID) throw new Error("Backend Config Error: SPREADSHEET_ID is missing.");
    
    const sheets = await getSheetsClient(['https://www.googleapis.com/auth/spreadsheets.readonly']);
    const response = await sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range,
    });
    return response.data.values || [];
};

export const clearAndWriteSheetData = async (range: string, values: any[][]) => {
    const SPREADSHEET_ID = cleanEnvVar(process.env.SPREADSHEET_ID || process.env.VITE_SPREADSHEET_ID);
    if (!SPREADSHEET_ID) throw new Error("Backend Config Error: SPREADSHEET_ID is missing.");

    const sheets = await getSheetsClient(['https://www.googleapis.com/auth/spreadsheets']);
    const sheetName = range.split('!')[0];
    
    await sheets.spreadsheets.values.clear({
        spreadsheetId: SPREADSHEET_ID,
        range,
    });

    if (values.length === 0) return;

    await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: `${sheetName}!A2`,
        valueInputOption: 'USER_ENTERED',
        requestBody: { values },
    });
};

export const appendSheetData = async (range: string, values: any[][]) => {
    if (values.length === 0) return;
    const SPREADSHEET_ID = cleanEnvVar(process.env.SPREADSHEET_ID || process.env.VITE_SPREADSHEET_ID);
    if (!SPREADSHEET_ID) throw new Error("Backend Config Error: SPREADSHEET_ID is missing.");

    const sheets = await getSheetsClient(['https://www.googleapis.com/auth/spreadsheets']);
    await sheets.spreadsheets.values.append({
        spreadsheetId: SPREADSHEET_ID,
        range,
        valueInputOption: 'USER_ENTERED',
        requestBody: { values },
    });
};

export const findAndUpsertRow = async (
    sheetName: string,
    findColumnIndex: number,
    findValue: string,
    newRowData: any[]
) => {
    const SPREADSHEET_ID = cleanEnvVar(process.env.SPREADSHEET_ID || process.env.VITE_SPREADSHEET_ID);
    if (!SPREADSHEET_ID) throw new Error("Backend Config Error: SPREADSHEET_ID is missing.");

    const sheets = await getSheetsClient(['https://www.googleapis.com/auth/spreadsheets']);
    const response = await sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: `${sheetName}!A:A`,
    });
    
    const rows = response.data.values || [];
    const rowIndex = rows.findIndex(row => row[findColumnIndex] === findValue);

    if (rowIndex !== -1) {
        await sheets.spreadsheets.values.update({
            spreadsheetId: SPREADSHEET_ID,
            range: `${sheetName}!A${rowIndex + 1}`,
            valueInputOption: 'USER_ENTERED',
            requestBody: { values: [newRowData] },
        });
    } else {
        await sheets.spreadsheets.values.append({
            spreadsheetId: SPREADSHEET_ID,
            range: `${sheetName}!A1`,
            valueInputOption: 'USER_ENTERED',
            requestBody: { values: [newRowData] },
        });
    }
};
