
import { google } from 'googleapis';

declare var process: any;

const formatPrivateKey = (key: string | undefined): string | undefined => {
    if (!key) return undefined;
    
    let cleaned = key.trim();
    
    // Remove outer quotes if they exist
    if (cleaned.startsWith('"') && cleaned.endsWith('"')) {
        cleaned = cleaned.substring(1, cleaned.length - 1);
    } else if (cleaned.startsWith("'") && cleaned.endsWith("'")) {
        cleaned = cleaned.substring(1, cleaned.length - 1);
    }
    
    // Handle literal \n and real newlines
    return cleaned.replace(/\\n/g, '\n');
};

const getSpreadsheetId = (): string => {
    const id = process.env.SPREADSHEET_ID || process.env.GOOGLE_SPREADSHEET_ID;
    if (!id) throw new Error('SPREADSHEET_ID environment variable is missing.');
    return id.trim().replace(/['"]/g, '');
};

async function getSheetsClient() {
    const clientEmail = process.env.GOOGLE_CLIENT_EMAIL?.trim().replace(/['"]/g, '');
    const privateKey = formatPrivateKey(process.env.GOOGLE_PRIVATE_KEY);

    if (!clientEmail) {
        throw new Error('GOOGLE_CLIENT_EMAIL is missing in environment variables.');
    }
    if (!privateKey || privateKey.length < 100) {
        throw new Error('GOOGLE_PRIVATE_KEY is missing or invalid in environment variables.');
    }

    try {
        const auth = new google.auth.JWT(
            clientEmail,
            undefined,
            privateKey,
            ['https://www.googleapis.com/auth/spreadsheets']
        );
        
        // This is crucial to ensure credentials are valid before proceeding
        await auth.authorize();
        
        return google.sheets({ version: 'v4', auth });
    } catch (e: any) {
        console.error("Sheets Service Auth Exception:", e.message);
        throw new Error(`Authentication Failed: ${e.message}`);
    }
}

export const readSheetData = async (range: string) => {
    const spreadsheetId = getSpreadsheetId();
    const sheets = await getSheetsClient();
    const response = await sheets.spreadsheets.values.get({ spreadsheetId, range });
    return response.data.values || [];
};

export const appendSheetData = async (range: string, values: any[][]) => {
    if (!values.length) return;
    const spreadsheetId = getSpreadsheetId();
    const sheets = await getSheetsClient();
    await sheets.spreadsheets.values.append({
        spreadsheetId,
        range,
        valueInputOption: 'USER_ENTERED',
        requestBody: { values },
    });
};

export const clearAndWriteSheetData = async (range: string, values: any[][]) => {
    const spreadsheetId = getSpreadsheetId();
    const sheets = await getSheetsClient();
    // Clear first
    await sheets.spreadsheets.values.clear({ spreadsheetId, range });
    // Then update if there are values
    if (values.length > 0) {
        await sheets.spreadsheets.values.update({
            spreadsheetId,
            range,
            valueInputOption: 'USER_ENTERED',
            requestBody: { values },
        });
    }
};

export const findAndUpsertRow = async (sheetName: string, id: string, newRowData: any[]) => {
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
};

export const deleteRowById = async (sheetName: string, id: string) => {
    const spreadsheetId = getSpreadsheetId();
    const sheets = await getSheetsClient();
    
    // We need the sheetId to delete a row
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
};
