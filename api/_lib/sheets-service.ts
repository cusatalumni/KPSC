
import { google } from 'googleapis';

declare var process: any;

/**
 * Robust private key formatter.
 * Ensures the key is in correct PEM format for Google Auth.
 */
const formatPrivateKey = (key: string | undefined): string | undefined => {
    if (!key) return undefined;
    
    let cleaned = key.trim();
    
    // Handle cases where the key might be wrapped in different types of quotes
    if (cleaned.startsWith('"') && cleaned.endsWith('"')) {
        cleaned = cleaned.substring(1, cleaned.length - 1);
    } else if (cleaned.startsWith("'") && cleaned.endsWith("'")) {
        cleaned = cleaned.substring(1, cleaned.length - 1);
    }
    
    // Replace literal '\n' string with actual newline characters
    // This is the most common fix for Vercel deployment issues
    return cleaned.replace(/\\n/g, '\n');
};

const getSpreadsheetId = (): string => {
    const id = process.env.SPREADSHEET_ID || process.env.GOOGLE_SPREADSHEET_ID;
    if (!id) throw new Error('SPREADSHEET_ID is missing.');
    return id.trim().replace(/['"]/g, '');
};

async function getSheetsClient() {
    const clientEmail = process.env.GOOGLE_CLIENT_EMAIL?.trim().replace(/['"]/g, '');
    const privateKey = formatPrivateKey(process.env.GOOGLE_PRIVATE_KEY);

    if (!clientEmail || !privateKey) {
        throw new Error('Missing Google Credentials: Check GOOGLE_CLIENT_EMAIL and GOOGLE_PRIVATE_KEY.');
    }

    try {
        // Using GoogleAuth instead of JWT for better compatibility in serverless
        const auth = new google.auth.GoogleAuth({
            credentials: {
                client_email: clientEmail,
                private_key: privateKey,
            },
            scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });
        
        return google.sheets({ version: 'v4', auth });
    } catch (e: any) {
        console.error("Sheets Client Init Error:", e.message);
        throw e;
    }
}

export const readSheetData = async (range: string) => {
    const spreadsheetId = getSpreadsheetId();
    const sheets = await getSheetsClient();
    const response = await sheets.spreadsheets.values.get({ 
        spreadsheetId, 
        range 
    });
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
    await sheets.spreadsheets.values.clear({ spreadsheetId, range });
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
    
    // 1. Get the current IDs (column A)
    const response = await sheets.spreadsheets.values.get({ 
        spreadsheetId, 
        range: `${sheetName}!A:A` 
    });
    
    const rows = response.data.values || [];
    const rowIndex = rows.findIndex(row => row[0] === id);
    
    if (rowIndex !== -1) {
        // Update
        await sheets.spreadsheets.values.update({
            spreadsheetId,
            range: `${sheetName}!A${rowIndex + 1}`,
            valueInputOption: 'USER_ENTERED',
            requestBody: { values: [newRowData] },
        });
    } else {
        // Insert
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
    
    // Find numeric sheet ID
    const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId });
    const sheet = spreadsheet.data.sheets?.find(s => s.properties?.title === sheetName);
    const sheetId = sheet?.properties?.sheetId;
    
    if (sheetId === undefined) throw new Error(`Sheet ${sheetName} not found.`);

    // Find row index
    const response = await sheets.spreadsheets.values.get({ 
        spreadsheetId, 
        range: `${sheetName}!A:A` 
    });
    const rows = response.data.values || [];
    const rowIndex = rows.findIndex(row => row[0] === id);
    
    if (rowIndex === -1) return;

    // Delete via batchUpdate
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
