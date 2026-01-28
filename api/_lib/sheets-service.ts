
import { GoogleAuth } from 'google-auth-library';
import { google } from 'googleapis';

declare var process: any;

/**
 * Creates an authorized Sheets client.
 * Fixes: "incoming JSON object does not contain a client_email field" 
 * by checking variables explicitly.
 */
async function getSheetsClient(scopes: string[]) {
    const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
    const privateKey = process.env.GOOGLE_PRIVATE_KEY;

    if (!clientEmail || !privateKey) {
        throw new Error('Backend Error: Google Service Account credentials (EMAIL or PRIVATE_KEY) are missing.');
    }

    const auth = new GoogleAuth({
        scopes,
        credentials: {
            client_email: clientEmail,
            private_key: privateKey.replace(/\\n/g, '\n'),
        },
    });
    
    const authClient = await auth.getClient();
    return google.sheets({ version: 'v4', auth: authClient as any });
}

export const readSheetData = async (range: string) => {
    const SPREADSHEET_ID = process.env.SPREADSHEET_ID;
    const sheets = await getSheetsClient(['https://www.googleapis.com/auth/spreadsheets.readonly']);
    const response = await sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range,
    });
    return response.data.values || [];
};

export const clearAndWriteSheetData = async (range: string, values: any[][]) => {
    const SPREADSHEET_ID = process.env.SPREADSHEET_ID;
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
    const SPREADSHEET_ID = process.env.SPREADSHEET_ID;
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
    const SPREADSHEET_ID = process.env.SPREADSHEET_ID;
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
