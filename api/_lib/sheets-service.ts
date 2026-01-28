
import { google } from 'googleapis';

declare var process: any;

const cleanEnvVar = (val: string | undefined): string | undefined => {
    if (!val) return undefined;
    let cleaned = val.trim();
    if ((cleaned.startsWith('"') && cleaned.endsWith('"')) || 
        (cleaned.startsWith("'") && cleaned.endsWith("'"))) {
        cleaned = cleaned.slice(1, -1);
    }
    return cleaned === "" ? undefined : cleaned;
};

const getSpreadsheetId = (): string => {
    const id = cleanEnvVar(process.env.SPREADSHEET_ID || process.env.GOOGLE_SPREADSHEET_ID || process.env.VITE_SPREADSHEET_ID);
    if (!id) throw new Error('Backend Error: SPREADSHEET_ID missing.');
    return id;
};

async function getSheetsClient(scopes: string[]) {
    const clientEmail = cleanEnvVar(process.env.GOOGLE_CLIENT_EMAIL || process.env.CLIENT_EMAIL);
    const privateKey = cleanEnvVar(process.env.GOOGLE_PRIVATE_KEY || process.env.PRIVATE_KEY);

    if (!clientEmail || !privateKey) {
        throw new Error(`Auth Config Error: Service Account credentials missing.`);
    }

    const formattedKey = privateKey.replace(/\\n/g, '\n').replace(/"/g, '').trim();

    try {
        const auth = new google.auth.GoogleAuth({
            credentials: {
                client_email: clientEmail,
                private_key: formattedKey,
            },
            scopes: scopes,
        });

        const authClient = await auth.getClient();
        // Crucial: Explicitly calling authorize to ensure tokens are generated
        await authClient.authorize();
        
        return google.sheets({ version: 'v4', auth: authClient as any });
    } catch (e: any) {
        console.error("Critical Google Sheets Auth Failure:", e.message);
        throw new Error(`Google API Authentication Failed: ${e.message}`);
    }
}

export const readSheetData = async (range: string) => {
    const spreadsheetId = getSpreadsheetId();
    const sheets = await getSheetsClient(['https://www.googleapis.com/auth/spreadsheets.readonly']);
    const response = await sheets.spreadsheets.values.get({ spreadsheetId, range });
    return response.data.values || [];
};

export const clearAndWriteSheetData = async (range: string, values: any[][]) => {
    const spreadsheetId = getSpreadsheetId();
    const sheets = await getSheetsClient(['https://www.googleapis.com/auth/spreadsheets']);
    const sheetName = range.split('!')[0];
    await sheets.spreadsheets.values.clear({ spreadsheetId, range });
    if (values.length === 0) return;
    await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `${sheetName}!A2`,
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
        range,
        valueInputOption: 'USER_ENTERED',
        requestBody: { values },
    });
};

export const deleteRowById = async (sheetName: string, id: string) => {
    const spreadsheetId = getSpreadsheetId();
    const sheets = await getSheetsClient(['https://www.googleapis.com/auth/spreadsheets']);
    
    // 1. Get the sheet metadata to find the sheetId
    const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId });
    const sheet = spreadsheet.data.sheets?.find(s => s.properties?.title === sheetName);
    const sheetId = sheet?.properties?.sheetId;

    if (sheetId === undefined) throw new Error(`Sheet ${sheetName} not found.`);

    // 2. Find the row index
    const response = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: `${sheetName}!A:A`,
    });
    const rows = response.data.values || [];
    const rowIndex = rows.findIndex(row => row[0] === id);

    if (rowIndex === -1) throw new Error(`Row with ID ${id} not found.`);

    // 3. Send batchUpdate to delete the specific row
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
    const response = await sheets.spreadsheets.values.get({ spreadsheetId, range: `${sheetName}!A:A` });
    const rows = response.data.values || [];
    const rowIndex = rows.findIndex(row => row[findColumnIndex] === findValue);

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
