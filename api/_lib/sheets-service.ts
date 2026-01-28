
import { google } from 'googleapis';

declare var process: any;

/**
 * Environment വാല്യൂകളിൽ നിന്ന് അനാവശ്യ കൊട്ടേഷനുകളും സ്പേസുകളും നീക്കം ചെയ്യുന്നു.
 */
const cleanEnvVar = (val: string | undefined): string | undefined => {
    if (!val) return undefined;
    let cleaned = val.trim();
    
    // Remove wrapping quotes if they exist
    if ((cleaned.startsWith('"') && cleaned.endsWith('"')) || 
        (cleaned.startsWith("'") && cleaned.endsWith("'"))) {
        cleaned = cleaned.slice(1, -1);
    }
    
    return cleaned === "" ? undefined : cleaned;
};

/**
 * Spreadsheet ID കണ്ടെത്തുന്നു.
 */
const getSpreadsheetId = (): string => {
    const id = cleanEnvVar(
        process.env.SPREADSHEET_ID || 
        process.env.GOOGLE_SPREADSHEET_ID ||
        process.env.VITE_SPREADSHEET_ID
    );

    if (!id) {
        throw new Error('Backend Error: SPREADSHEET_ID missing. Please configure it in Vercel settings.');
    }
    return id;
};

/**
 * ഗൂഗിൾ ഷീറ്റ്സ് ക്ലയന്റ് തയ്യാറാക്കുന്നു.
 * Uses JWT for explicit credential passing which is more reliable.
 */
async function getSheetsClient(scopes: string[]) {
    const clientEmail = cleanEnvVar(
        process.env.GOOGLE_CLIENT_EMAIL || 
        process.env.CLIENT_EMAIL ||
        process.env.VITE_GOOGLE_CLIENT_EMAIL
    );

    const privateKey = cleanEnvVar(
        process.env.GOOGLE_PRIVATE_KEY || 
        process.env.PRIVATE_KEY ||
        process.env.VITE_GOOGLE_PRIVATE_KEY
    );

    if (!clientEmail || !privateKey) {
        throw new Error(`Authentication Error: Missing Google Service Account credentials (Email or Key).`);
    }

    // Standardize the private key format for Node.js
    const formattedKey = privateKey
        .replace(/\\n/g, '\n') // Replace literal \n with real newlines
        .replace(/"/g, '')     // Remove any accidental double quotes
        .trim();

    try {
        // Using JWT directly is more robust in serverless environments
        const auth = new google.auth.JWT(
            clientEmail,
            undefined,
            formattedKey,
            scopes
        );

        return google.sheets({ version: 'v4', auth });
    } catch (e: any) {
        console.error("Critical Google API Initialization Failure:", e.message);
        throw new Error(`Google API Authentication Failed: ${e.message}`);
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
