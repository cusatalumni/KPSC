
import { google } from 'googleapis';

declare var process: any;

const formatPrivateKey = (key: string | undefined): string | undefined => {
    if (!key) return undefined;
    
    // Remove surrounding quotes if any
    let cleaned = key.trim().replace(/^['"]|['"]$/g, '');
    
    // Handle escaped newlines
    cleaned = cleaned.replace(/\\n/g, '\n');
    
    // Ensure the key has the correct header/footer
    if (!cleaned.includes('-----BEGIN PRIVATE KEY-----')) {
        cleaned = `-----BEGIN PRIVATE KEY-----\n${cleaned}\n-----END PRIVATE KEY-----`;
    }
    
    return cleaned;
};

const getSpreadsheetId = (): string => {
    const id = process.env.SPREADSHEET_ID || process.env.GOOGLE_SPREADSHEET_ID;
    if (!id) throw new Error('Missing Environment Variable: SPREADSHEET_ID');
    return id.trim().replace(/['"]/g, '');
};

async function getSheetsClient() {
    const clientEmail = process.env.GOOGLE_CLIENT_EMAIL?.trim().replace(/['"]/g, '');
    const privateKey = formatPrivateKey(process.env.GOOGLE_PRIVATE_KEY);

    if (!clientEmail) throw new Error('Missing Environment Variable: GOOGLE_CLIENT_EMAIL');
    if (!privateKey) throw new Error('Missing Environment Variable: GOOGLE_PRIVATE_KEY');

    try {
        const auth = new google.auth.GoogleAuth({
            credentials: {
                client_email: clientEmail,
                private_key: privateKey,
            },
            scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });
        return google.sheets({ version: 'v4', auth });
    } catch (e: any) {
        console.error("Google Auth Initialization Error:", e.message);
        throw new Error(`Failed to initialize Google Auth: ${e.message}`);
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
    try {
        const spreadsheetId = getSpreadsheetId();
        const sheets = await getSheetsClient();
        const response = await sheets.spreadsheets.values.get({ 
            spreadsheetId, 
            range: getSafeRange(range) 
        });
        return response.data.values || [];
    } catch (error: any) {
        console.error(`Sheet Read Error [${range}]:`, error.message);
        // Throwing error so the handler can catch it and report status
        throw error;
    }
};

export const clearAndWriteSheetData = async (range: string, values: any[][]) => {
    const spreadsheetId = getSpreadsheetId();
    const sheets = await getSheetsClient();
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
    const sheets = await getSheetsClient();
    await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: getSafeRange(range),
        valueInputOption: 'USER_ENTERED',
        requestBody: { values },
    });
};

export const deleteRowById = async (sheetName: string, id: string) => {
    const spreadsheetId = getSpreadsheetId();
    const sheets = await getSheetsClient();
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
    const sheets = await getSheetsClient();
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
