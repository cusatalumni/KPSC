
import { google } from 'googleapis';

declare var process: any;

const formatPrivateKey = (key: string | undefined): string | undefined => {
    if (!key) return undefined;
    let cleaned = key.trim();
    if ((cleaned.startsWith('"') && cleaned.endsWith('"')) || (cleaned.startsWith("'") && cleaned.endsWith("'"))) {
        cleaned = cleaned.slice(1, -1);
    }
    cleaned = cleaned.replace(/\\n/g, '\n');
    if (!cleaned.includes('-----BEGIN PRIVATE KEY-----')) {
        cleaned = `-----BEGIN PRIVATE KEY-----\n${cleaned}\n-----END PRIVATE KEY-----`;
    }
    return cleaned;
};

const getSpreadsheetId = (): string => {
    const id = process.env.SPREADSHEET_ID || process.env.GOOGLE_SPREADSHEET_ID || process.env.VITE_SPREADSHEET_ID;
    if (!id) throw new Error('Backend Missing Config: SPREADSHEET_ID');
    return id.trim().replace(/['"]/g, '');
};

async function getSheetsClient(scopes: string[]) {
    const clientEmail = (process.env.GOOGLE_CLIENT_EMAIL || process.env.CLIENT_EMAIL)?.trim().replace(/['"]/g, '');
    const privateKey = formatPrivateKey(process.env.GOOGLE_PRIVATE_KEY || process.env.PRIVATE_KEY);

    if (!clientEmail) throw new Error('Backend Missing Config: GOOGLE_CLIENT_EMAIL');
    if (!privateKey) throw new Error('Backend Missing Config: GOOGLE_PRIVATE_KEY');

    try {
        const auth = new google.auth.GoogleAuth({
            credentials: {
                client_email: clientEmail,
                private_key: privateKey,
            },
            scopes: scopes,
        });
        return google.sheets({ version: 'v4', auth });
    } catch (e: any) {
        throw new Error(`Google Auth Init Failed: ${e.message}`);
    }
}

const getSafeRange = (range: string) => {
    if (range.includes('!')) {
        const [sheet, cells] = range.split('!');
        return `'${sheet.replace(/'/g, "''")}'!${cells}`;
    }
    return `'${range.replace(/'/g, "''")}'`;
};

export const readSheetData = async (range: string) => {
    const spreadsheetId = getSpreadsheetId();
    const sheets = await getSheetsClient(['https://www.googleapis.com/auth/spreadsheets.readonly']);
    const response = await sheets.spreadsheets.values.get({ 
        spreadsheetId, 
        range: getSafeRange(range) 
    });
    return response.data.values || [];
};

export const clearAndWriteSheetData = async (range: string, values: any[][]) => {
    const spreadsheetId = getSpreadsheetId();
    const sheets = await getSheetsClient(['https://www.googleapis.com/auth/spreadsheets']);
    await sheets.spreadsheets.values.clear({ spreadsheetId, range: getSafeRange(range) });
    if (values.length === 0) return;
    const sheetName = range.split('!')[0];
    const startCell = range.split('!')[1]?.split(':')[0] || 'A2';
    await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: getSafeRange(`${sheetName}!${startCell}`),
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
        range: getSafeRange(range),
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
    if (sheetId === undefined) throw new Error(`Sheet '${sheetName}' not found.`);
    const response = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: getSafeRange(`${sheetName}!A:A`),
    });
    const rows = response.data.values || [];
    const rowIndex = rows.findIndex(row => row[0] === id);
    if (rowIndex === -1) throw new Error(`ID '${id}' not found in '${sheetName}'.`);
    await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: {
            requests: [{ deleteDimension: { range: { sheetId, dimension: 'ROWS', startIndex: rowIndex, endIndex: rowIndex + 1 } } }]
        }
    });
};

export const findAndUpsertRow = async (sheetName: string, findColumnIndex: number, findValue: string, newRowData: any[]) => {
    const spreadsheetId = getSpreadsheetId();
    const sheets = await getSheetsClient(['https://www.googleapis.com/auth/spreadsheets']);
    const response = await sheets.spreadsheets.values.get({ 
        spreadsheetId, 
        range: getSafeRange(`${sheetName}!A:A`) 
    });
    const rows = response.data.values || [];
    const rowIndex = rows.findIndex(row => row[findColumnIndex] === findValue);
    if (rowIndex !== -1) {
        await sheets.spreadsheets.values.update({
            spreadsheetId,
            range: getSafeRange(`${sheetName}!A${rowIndex + 1}`),
            valueInputOption: 'USER_ENTERED',
            requestBody: { values: [newRowData] },
        });
    } else {
        await sheets.spreadsheets.values.append({
            spreadsheetId,
            range: getSafeRange(`${sheetName}!A1`),
            valueInputOption: 'USER_ENTERED',
            requestBody: { values: [newRowData] },
        });
    }
};
