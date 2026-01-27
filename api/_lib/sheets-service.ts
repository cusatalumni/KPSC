
import { GoogleAuth } from 'google-auth-library';
import { google } from 'googleapis';

declare var process: any;
const SPREADSHEET_ID = process.env.SPREADSHEET_ID;

async function getSheetsClient(scopes: string[]) {
    const auth = new GoogleAuth({
        scopes,
        credentials: {
            client_email: process.env.GOOGLE_CLIENT_EMAIL,
            private_key: (process.env.GOOGLE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
        },
    });
    const client = await auth.getClient();
    return google.sheets({ version: 'v4', auth: client as any });
}

export const readSheetData = async (range: string) => {
    const sheets = await getSheetsClient(['https://www.googleapis.com/auth/spreadsheets.readonly']);
    const response = await sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range,
    });
    return response.data.values || [];
};

export const clearAndWriteSheetData = async (range: string, values: any[][]) => {
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
