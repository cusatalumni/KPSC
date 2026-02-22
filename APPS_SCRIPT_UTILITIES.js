
/**
 * Kerala PSC Guru - Sheet-side Utilities
 * -------------------------------------
 * 1. Open your Google Sheet.
 * 2. Go to Extensions -> Apps Script.
 * 3. Append this code to the existing code.
 * 4. Save and refresh your Google Sheet.
 */

function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('🚀 PSC Admin')
      .addItem('Setup Results Tab', 'setupResultsTab')
      .addSeparator()
      .addItem('Format JSON in QuestionBank', 'formatQuestionJson')
      .addToUi();
}

function setupResultsTab() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName('Results');
  if (!sheet) {
    sheet = ss.insertSheet('Results');
    const headers = ['id', 'userId', 'userEmail', 'testTitle', 'score', 'total', 'timestamp'];
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]).setBackground('#d9ead3').setFontWeight('bold');
    sheet.setFrozenRows(1);
    SpreadsheetApp.getUi().alert('Results tab created successfully!');
  } else {
    SpreadsheetApp.getUi().alert('Results tab already exists.');
  }
}

function formatQuestionJson() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('QuestionBank');
  if (!sheet) return;
  
  const range = sheet.getRange(2, 4, sheet.getLastRow() - 1, 1);
  const values = range.getValues();
  
  const formatted = values.map(row => {
    let val = row[0];
    if (typeof val === 'string' && !val.startsWith('[')) {
      // If it's comma separated, convert to JSON array
      const parts = val.split(',').map(p => p.trim());
      return [JSON.stringify(parts)];
    }
    return [val];
  });
  
  range.setValues(formatted);
  SpreadsheetApp.getUi().alert('Options formatted to JSON successfully!');
}
