
import { google } from 'googleapis';

declare var process: any;

const formatPrivateKey = (key: string | undefined): string | undefined => {
    if (!key) return undefined;
    let cleaned = key.trim();
    if ((cleaned.startsWith('"') && cleaned.endsWith('"')) || 
        (cleaned.startsWith("'") && cleaned.endsWith("'"))) {
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
    if (!id) throw new Error('Backend Error: SPREADSHEET_ID missing.');
    return id.trim().replace(/['"]/g, '');
};

async function getSheetsClient(scopes: string[]) {
    const clientEmail = (process.env.GOOGLE_CLIENT_EMAIL || process.env.CLIENT_EMAIL)?.trim().replace(/['"]/g, '');
    const privateKey = formatPrivateKey(process.env.GOOGLE_PRIVATE_KEY || process.env.PRIVATE_KEY);

    if (!clientEmail || !privateKey) {
        throw new Error(`Auth Config Error: Credentials missing.`);
    }

    try {
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
        throw new Error(`Google API Authentication Failed: ${e.message}`);
    }
}

/**
 * Ensures the sheet name is safely wrapped in single quotes for the API.
 */
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
    
    // Clear the range first
    await sheets.spreadsheets.values.clear({ 
        spreadsheetId, 
        range: getSafeRange(range) 
    });
    
    if (values.length === 0) return;

    // Use the sheet name part to write from A2
    const sheetName = range.split('!')[0];
    await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: getSafeRange(`${sheetName}!A2`),
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

    if (sheetId === undefined) throw new Error(`Sheet ${sheetName} not found.`);

    const response = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: getSafeRange(`${sheetName}!A:A`),
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
