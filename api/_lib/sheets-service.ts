
import { google } from 'googleapis';

declare var process: any;

/**
 * Helper to clean environment variable strings.
 * Removes leading/trailing quotes and whitespace.
 */
const cleanEnvVar = (val: string | undefined): string | undefined => {
    if (!val) return undefined;
    const cleaned = val.trim().replace(/^["'](.*)["']$/, '$1');
    return cleaned === "" ? undefined : cleaned;
};

/**
 * Retrieves the spreadsheet ID from environment variables.
 * Checks multiple naming conventions for maximum compatibility.
 */
const getSpreadsheetId = (): string => {
    // Priority: SPREADSHEET_ID (Standard) -> VITE_SPREADSHEET_ID (Vite fallback)
    const id = cleanEnvVar(
        process.env.SPREADSHEET_ID || 
        process.env.VITE_SPREADSHEET_ID ||
        (process as any).env?.SPREADSHEET_ID
    );

    if (!id) {
        throw new Error(
            'Backend Config Error: SPREADSHEET_ID is missing. ' +
            'Please go to Vercel Dashboard -> Settings -> Environment Variables and add "SPREADSHEET_ID" with your Google Sheet ID.'
        );
    }
    return id;
};

/**
 * Creates an authorized Sheets client using JWT.
 */
async function getSheetsClient(scopes: string[]) {
    const rawEmail = process.env.GOOGLE_CLIENT_EMAIL || process.env.VITE_GOOGLE_CLIENT_EMAIL;
    const rawKey = process.env.GOOGLE_PRIVATE_KEY || process.env.VITE_GOOGLE_PRIVATE_KEY;

    const clientEmail = cleanEnvVar(rawEmail);
    const privateKey = cleanEnvVar(rawKey);

    if (!clientEmail) {
        throw new Error('Backend Config Error: GOOGLE_CLIENT_EMAIL is missing. Check Vercel Environment Variables.');
    }
    if (!privateKey) {
        throw new Error('Backend Config Error: GOOGLE_PRIVATE_KEY is missing. Check Vercel Environment Variables.');
    }

    // Standardize key format (handling escaped newlines from environment strings)
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
        console.error("Auth Init Error:", e.message);
        throw new Error(`Google Auth Failed: ${e.message}`);
    }
}

export const readSheetData = async (range: string) => {
    const spreadsheetId = getSpreadsheetId();
    const sheets = await getSheetsClient(['https://www.googleapis.com/auth/spreadsheets.readonly']);
    const response = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range,
    });
    return response.data.values || [];
};

export const clearAndWriteSheetData = async (range: string, values: any[][]) => {
    const spreadsheetId = getSpreadsheetId();
    const sheets = await getSheetsClient(['https://www.googleapis.com/auth/spreadsheets']);
    const sheetName = range.split('!')[0];
    
    await sheets.spreadsheets.values.clear({
        spreadsheetId,
        range,
    });

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

export const findAndUpsertRow = async (
    sheetName: string,
    findColumnIndex: number,
    findValue: string,
    newRowData: any[]
) => {
    const spreadsheetId = getSpreadsheetId();
    const sheets = await getSheetsClient(['https://www.googleapis.com/auth/spreadsheets']);
    const response = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: `${sheetName}!A:A`,
    });
    
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
