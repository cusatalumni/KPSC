
import { google } from 'googleapis';

declare var process: any;

/**
 * Format the private key correctly for Google Auth.
 * Handles escaped newlines, literal newlines, and surrounding quotes.
 */
const formatPrivateKey = (key: string | undefined): string | undefined => {
    if (!key) return undefined;
    
    let cleaned = key.trim();
    
    // Remove wrapping double or single quotes
    if ((cleaned.startsWith('"') && cleaned.endsWith('"')) || 
        (cleaned.startsWith("'") && cleaned.endsWith("'"))) {
        cleaned = cleaned.substring(1, cleaned.length - 1);
    }
    
    // Replace literal '\n' string with actual newline character
    // and also handle double escaped '\\n'
    cleaned = cleaned.replace(/\\n/g, '\n');
    
    return cleaned;
};

const getSpreadsheetId = (): string => {
    const id = process.env.SPREADSHEET_ID || process.env.GOOGLE_SPREADSHEET_ID;
    if (!id) throw new Error('SPREADSHEET_ID is missing in environment variables.');
    return id.trim().replace(/['"]/g, '');
};

async function getSheetsClient() {
    const clientEmail = process.env.GOOGLE_CLIENT_EMAIL?.trim().replace(/['"]/g, '');
    const privateKey = formatPrivateKey(process.env.GOOGLE_PRIVATE_KEY);

    if (!clientEmail) {
        throw new Error('GOOGLE_CLIENT_EMAIL is missing or empty.');
    }
    if (!privateKey) {
        throw new Error('GOOGLE_PRIVATE_KEY is missing or empty.');
    }

    try {
        // Explicit JWT setup is the most reliable method for Vercel
        const auth = new google.auth.JWT(
            clientEmail,
            null, // keyFile path is not used
            privateKey,
            ['https://www.googleapis.com/auth/spreadsheets']
        );
        
        // Return authorized sheets client
        return google.sheets({ version: 'v4', auth });
    } catch (e: any) {
        console.error("Sheets Auth Client Initialization Error:", e.message);
        throw new Error(`Authentication Setup Failed: ${e.message}`);
    }
}

export const readSheetData = async (range: string) => {
    try {
        const spreadsheetId = getSpreadsheetId();
        const sheets = await getSheetsClient();
        const response = await sheets.spreadsheets.values.get({ spreadsheetId, range });
        return response.data.values || [];
    } catch (error: any) {
        console.error(`Read Error [${range}]:`, error.message);
        throw new Error(`Google Sheets Read Error: ${error.message}`);
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
    } catch (error: any) {
        console.error(`Append Error [${range}]:`, error.message);
        throw new Error(`Google Sheets Append Error: ${error.message}`);
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
        console.error(`Update Error [${range}]:`, error.message);
        throw new Error(`Google Sheets Update Error: ${error.message}`);
    }
};

export const findAndUpsertRow = async (sheetName: string, id: string, newRowData: any[]) => {
    try {
        const spreadsheetId = getSpreadsheetId();
        const sheets = await getSheetsClient();
        
        // 1. Find if row exists
        const response = await sheets.spreadsheets.values.get({ spreadsheetId, range: `${sheetName}!A:A` });
        const rows = response.data.values || [];
        const rowIndex = rows.findIndex(row => row[0] === id);
        
        if (rowIndex !== -1) {
            // Update existing
            await sheets.spreadsheets.values.update({
                spreadsheetId,
                range: `${sheetName}!A${rowIndex + 1}`,
                valueInputOption: 'USER_ENTERED',
                requestBody: { values: [newRowData] },
            });
        } else {
            // Append new
            await sheets.spreadsheets.values.append({
                spreadsheetId,
                range: `${sheetName}!A1`,
                valueInputOption: 'USER_ENTERED',
                requestBody: { values: [newRowData] },
            });
        }
    } catch (error: any) {
        console.error(`Upsert Error [${sheetName}]:`, error.message);
        throw new Error(`Google Sheets Save Error: ${error.message}`);
    }
};

export const deleteRowById = async (sheetName: string, id: string) => {
    try {
        const spreadsheetId = getSpreadsheetId();
        const sheets = await getSheetsClient();
        
        // Get sheetId (numeric) for the batchUpdate call
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
    } catch (error: any) {
        console.error(`Delete Error [${sheetName}]:`, error.message);
        throw new Error(`Google Sheets Delete Error: ${error.message}`);
    }
};
