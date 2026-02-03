
import { google } from 'googleapis';

declare var process: any;

const formatPrivateKey = (key: string | undefined): string | undefined => {
    if (!key) return undefined;
    
    // Remove wrapping quotes and fix newlines
    let cleaned = key.trim();
    
    // Some platforms wrap the key in extra quotes
    if (cleaned.startsWith('"') && cleaned.endsWith('"')) {
        cleaned = cleaned.substring(1, cleaned.length - 1);
    } else if (cleaned.startsWith("'") && cleaned.endsWith("'")) {
        cleaned = cleaned.substring(1, cleaned.length - 1);
    }
    
    // Replace escaped \n with actual newlines
    cleaned = cleaned.replace(/\\n/g, '\n');
    
    // Ensure the markers are correct
    if (!cleaned.includes('-----BEGIN PRIVATE KEY-----')) {
        cleaned = `-----BEGIN PRIVATE KEY-----\n${cleaned}\n-----END PRIVATE KEY-----`;
    }
    
    return cleaned;
};

const getSpreadsheetId = (): string => {
    const id = process.env.SPREADSHEET_ID || process.env.GOOGLE_SPREADSHEET_ID;
    if (!id) throw new Error('Backend Error: SPREADSHEET_ID environment variable is missing.');
    return id.trim().replace(/['"]/g, '');
};

async function getSheetsClient() {
    const clientEmail = process.env.GOOGLE_CLIENT_EMAIL?.trim().replace(/['"]/g, '');
    const privateKey = formatPrivateKey(process.env.GOOGLE_PRIVATE_KEY);

    if (!clientEmail) {
        throw new Error('Backend Error: GOOGLE_CLIENT_EMAIL is missing. Check Vercel environment variables.');
    }
    if (!privateKey) {
        throw new Error('Backend Error: GOOGLE_PRIVATE_KEY is missing. Check Vercel environment variables.');
    }

    try {
        const auth = new google.auth.GoogleAuth({
            credentials: {
                client_email: clientEmail,
                private_key: privateKey,
            },
            scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });
        const client = await auth.getClient();
        return google.sheets({ version: 'v4', auth: client as any });
    } catch (e: any) {
        console.error("Authentication Setup Failed:", e.message);
        throw new Error(`Google Sheets Auth Failed: ${e.message}`);
    }
}

export const readSheetData = async (range: string) => {
    try {
        const spreadsheetId = getSpreadsheetId();
        const sheets = await getSheetsClient();
        const response = await sheets.spreadsheets.values.get({ 
            spreadsheetId, 
            range: range.includes('!') ? range : `'${range}'` 
        });
        return response.data.values || [];
    } catch (error: any) {
        console.error(`Sheet Read Error [${range}]:`, error.message);
        // Fallback or throw based on preference. Here we throw to show the error.
        throw error;
    }
};

export const appendSheetData = async (range: string, values: any[][]) => {
    if (values.length === 0) return;
    try {
        const spreadsheetId = getSpreadsheetId();
        const sheets = await getSheetsClient();
        await sheets.spreadsheets.values.append({
            spreadsheetId,
            range,
            valueInputOption: 'USER_ENTERED',
            requestBody: { values },
        });
    } catch (error: any) {
        console.error(`Sheet Append Error [${range}]:`, error.message);
        throw error;
    }
};

export const clearAndWriteSheetData = async (range: string, values: any[][]) => {
    try {
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
    } catch (error: any) {
        console.error(`Sheet Update Error [${range}]:`, error.message);
        throw error;
    }
};

export const findAndUpsertRow = async (sheetName: string, id: string, newRowData: any[]) => {
    try {
        const spreadsheetId = getSpreadsheetId();
        const sheets = await getSheetsClient();
        
        const response = await sheets.spreadsheets.values.get({ 
            spreadsheetId, 
            range: `${sheetName}!A:A` 
        });
        
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
    } catch (error: any) {
        console.error(`Sheet Upsert Error [${sheetName}]:`, error.message);
        throw error;
    }
};

export const deleteRowById = async (sheetName: string, id: string) => {
    try {
        const spreadsheetId = getSpreadsheetId();
        const sheets = await getSheetsClient();
        const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId });
        const sheet = spreadsheet.data.sheets?.find(s => s.properties?.title === sheetName);
        const sheetId = sheet?.properties?.sheetId;
        
        if (sheetId === undefined) throw new Error(`Sheet ${sheetName} not found.`);

        const response = await sheets.spreadsheets.values.get({ spreadsheetId, range: `${sheetName}!A:A` });
        const rows = response.data.values || [];
        const rowIndex = rows.findIndex(row => row[0] === id);
        
        if (rowIndex === -1) return;

        await sheets.spreadsheets.batchUpdate({
            spreadsheetId,
            requestBody: {
                requests: [{ deleteDimension: { range: { sheetId, dimension: 'ROWS', startIndex: rowIndex, endIndex: rowIndex + 1 } } }]
            }
        });
    } catch (error: any) {
        console.error(`Sheet Delete Error [${sheetName}]:`, error.message);
        throw error;
    }
};
