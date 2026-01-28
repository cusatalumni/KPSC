
import { google } from 'googleapis';

declare var process: any;

/**
 * Environment വാല്യൂകളിൽ നിന്ന് അനാവശ്യ കൊട്ടേഷനുകളും സ്പേസുകളും നീക്കം ചെയ്യുന്നു.
 * Vercel-ൽ നിന്ന് ലഭിക്കുന്ന ഡാറ്റാ ഫോർമാറ്റിലെ പ്രശ്നങ്ങൾ ഇത് പരിഹരിക്കും.
 */
const cleanEnvVar = (val: string | undefined): string | undefined => {
    if (!val) return undefined;
    let cleaned = val.trim();
    
    // തുടക്കത്തിലും അവസാനത്തിലും ഉള്ള ", ' എന്നിവ നീക്കം ചെയ്യുന്നു
    if ((cleaned.startsWith('"') && cleaned.endsWith('"')) || 
        (cleaned.startsWith("'") && cleaned.endsWith("'"))) {
        cleaned = cleaned.slice(1, -1);
    }
    
    return cleaned === "" ? undefined : cleaned;
};

/**
 * Spreadsheet ID കണ്ടെത്തുന്നു.
 */
const getSpreadsheetId = (): string => {
    const id = cleanEnvVar(
        process.env.SPREADSHEET_ID || 
        process.env.GOOGLE_SPREADSHEET_ID ||
        process.env.VITE_SPREADSHEET_ID
    );

    if (!id) {
        throw new Error('വിവരങ്ങൾ ശേഖരിക്കാൻ ആവശ്യമായ SPREADSHEET_ID കണ്ടെത്തിയില്ല. Vercel സെറ്റിങ്സ് പരിശോധിക്കുക.');
    }
    return id;
};

/**
 * ഗൂഗിൾ ഷീറ്റ്സ് ക്ലയന്റ് തയ്യാറാക്കുന്നു.
 */
async function getSheetsClient(scopes: string[]) {
    const clientEmail = cleanEnvVar(
        process.env.GOOGLE_CLIENT_EMAIL || 
        process.env.CLIENT_EMAIL ||
        process.env.VITE_GOOGLE_CLIENT_EMAIL
    );

    let privateKey = cleanEnvVar(
        process.env.GOOGLE_PRIVATE_KEY || 
        process.env.PRIVATE_KEY ||
        process.env.VITE_GOOGLE_PRIVATE_KEY
    );

    if (!clientEmail || !privateKey) {
        throw new Error(`ഓതന്റിക്കേഷൻ വിവരങ്ങൾ അപൂർണ്ണമാണ്. Email: ${!!clientEmail}, Key: ${!!privateKey}`);
    }

    // പ്രൈവറ്റ് കീ ഫോർമാറ്റ് ശരിയാക്കുന്നു
    // \n കമാൻഡുകളെ യഥാർത്ഥ ന്യൂലൈനുകളാക്കി മാറ്റുന്നു.
    const formattedKey = privateKey
        .replace(/\\n/g, '\n')
        .replace(/\"/g, '') // അറിയാതെ വരുന്ന കൊട്ടേഷനുകൾ കളയുന്നു
        .trim();

    try {
        // JWT (JSON Web Token) ഉപയോഗിച്ചുള്ള ഓതന്റിക്കേഷൻ
        const auth = new google.auth.JWT(
            clientEmail,
            undefined,
            formattedKey,
            scopes
        );

        // കണക്ഷൻ ടെസ്റ്റ് ചെയ്യാൻ ആധികാരികത ഉറപ്പാക്കുന്നു
        await auth.authorize();
        
        return google.sheets({ version: 'v4', auth });
    } catch (e: any) {
        console.error("Google Auth Error Detail:", e.message);
        throw new Error(`ഗൂഗിൾ ഷീറ്റ്സുമായി ബന്ധപ്പെടാൻ സാധിക്കുന്നില്ല: ${e.message}`);
    }
}

export const readSheetData = async (range: string) => {
    const spreadsheetId = getSpreadsheetId();
    const sheets = await getSheetsClient(['https://www.googleapis.com/auth/spreadsheets.readonly']);
    const response = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range,
    });
    return response.data.values || [];
};

export const clearAndWriteSheetData = async (range: string, values: any[][]) => {
    const spreadsheetId = getSpreadsheetId();
    const sheets = await getSheetsClient(['https://www.googleapis.com/auth/spreadsheets']);
    const sheetName = range.split('!')[0];
    
    await sheets.spreadsheets.values.clear({
        spreadsheetId,
        range,
    });

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

export const findAndUpsertRow = async (
    sheetName: string,
    findColumnIndex: number,
    findValue: string,
    newRowData: any[]
) => {
    const spreadsheetId = getSpreadsheetId();
    const sheets = await getSheetsClient(['https://www.googleapis.com/auth/spreadsheets']);
    const response = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: `${sheetName}!A:A`,
    });
    
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
