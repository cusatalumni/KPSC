
import { google } from 'googleapis';

declare var process: any;

/**
 * Robust private key cleanup for Vercel.
 */
const formatKey = (key: string | undefined): string | undefined => {
    if (!key) return undefined;
    let sanitized = key.trim();
    
    // Remove wrapping quotes
    if (sanitized.startsWith('"') && sanitized.endsWith('"')) {
        sanitized = sanitized.substring(1, sanitized.length - 1);
    }
    
    // Fix escaped newlines
    sanitized = sanitized.replace(/\\n/g, '\n');
    
    // Ensure PEM header exists
    if (!sanitized.includes('-----BEGIN PRIVATE KEY-----')) {
        sanitized = `-----BEGIN PRIVATE KEY-----\n${sanitized}\n-----END PRIVATE KEY-----`;
    }
    
    return sanitized;
};

const getSpreadsheetId = (): string => {
    const id = process.env.SPREADSHEET_ID || process.env.GOOGLE_SPREADSHEET_ID;
    if (!id) throw new Error('SPREADSHEET_ID not found in environment.');
    return id.trim().replace(/['"]/g, '');
};

async function getSheetsClient() {
    const clientEmail = process.env.GOOGLE_CLIENT_EMAIL?.trim().replace(/['"]/g, '');
    const rawKey = process.env.GOOGLE_PRIVATE_KEY;
    const privateKey = formatKey(rawKey);

    if (!clientEmail || !privateKey) {
        throw new Error('Google Credentials Missing.');
    }

    try {
        // Create an explicit JWT client which is more predictable in serverless
        const jwtClient = new google.auth.JWT(
            clientEmail,
            undefined,
            privateKey,
            ['https://www.googleapis.com/auth/spreadsheets']
        );
        
        await jwtClient.authorize();
        return google.sheets({ version: 'v4', auth: jwtClient });
    } catch (e: any) {
        console.error("Sheets Auth Exception:", e.message);
        throw new Error(`Auth Failed: ${e.message}`);
    }
}

export const readSheetData = async (range: string) => {
    try {
        const spreadsheetId = getSpreadsheetId();
        const sheets = await getSheetsClient();
        const response = await sheets.spreadsheets.values.get({ spreadsheetId, range });
        return response.data.values || [];
    } catch (e: any) {
        console.error(`Read Error on ${range}:`, e.message);
        throw e;
    }
};

export const appendSheetData = async (range: string, values: any[][]) => {
    if (!values.length) return;
    try {
        const spreadsheetId = getSpreadsheetId();
        const sheets = await getSheetsClient();
        await sheets.spreadsheets.values.append({
            spreadsheetId,
            range,
            valueInputOption: 'USER_ENTERED',
            requestBody: { values },
        });
    } catch (e: any) {
        console.error(`Append Error on ${range}:`, e.message);
        throw e;
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
    } catch (e: any) {
        console.error(`Write Error on ${range}:`, e.message);
        throw e;
    }
};

export const findAndUpsertRow = async (sheetName: string, id: string, newRowData: any[]) => {
    try {
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
    } catch (e: any) {
        console.error(`Upsert Error on ${sheetName}:`, e.message);
        throw e;
    }
};

export const deleteRowById = async (sheetName: string, id: string) => {
    try {
        const spreadsheetId = getSpreadsheetId();
        const sheets = await getSheetsClient();
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
    } catch (e: any) {
        console.error(`Delete Error on ${sheetName}:`, e.message);
        throw e;
    }
};
