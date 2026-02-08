
/**
 * Kerala PSC Guru - Database Initializer
 * -------------------------------------
 * 1. Open your Google Sheet.
 * 2. Go to Extensions -> Apps Script.
 * 3. Delete any existing code and paste this.
 * 4. Select "initializeDatabase" from the dropdown and click "Run".
 */

function initializeDatabase() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  const sheets = [
    {
      name: 'Settings',
      headers: ['key', 'value'],
      sample: [['subscription_model_active', 'true'], ['maintenance_mode', 'false']]
    },
    {
      name: 'StudyMaterialsCache',
      headers: ['topic', 'content', 'last_updated'],
      sample: [['Kerala History', '# Kerala History\nSample content...', new Date().toISOString()]]
    },
    {
      name: 'Exams',
      headers: ['id', 'title_ml', 'title_en', 'description_ml', 'description_en', 'category', 'level', 'icon_type'],
      sample: [['ldc_exam', 'LDC പരീക്ഷ', 'LDC Exam', 'പത്താം ക്ലാസ്സ് യോഗ്യതയുള്ള പരീക്ഷ.', '10th level exam.', 'General', 'Preliminary', 'book']]
    },
    {
      name: 'Syllabus',
      headers: ['id', 'exam_id', 'title', 'questions', 'duration', 'subject', 'topic'],
      sample: [['ldc_gk_1', 'ldc_exam', 'General Knowledge', '20', '20', 'GK', 'General']]
    },
    {
      name: 'QuestionBank',
      headers: ['id', 'topic', 'question', 'options', 'correctAnswerIndex', 'subject', 'difficulty'],
      sample: [['q1', 'History', 'കേരളത്തിലെ ഏറ്റവും വലിയ നദി?', '["പെരിയാർ", "ഭารതപ്പുഴ", "പമ്പ", "ചാലിയാർ"]', '0', 'GK', 'Easy']]
    },
    {
      name: 'Bookstore',
      headers: ['id', 'title', 'author', 'imageUrl', 'amazonLink'],
      sample: [['b1', 'PSC Rank File', 'Talent Academy', '', 'https://amazon.in']]
    },
    {
      name: 'Notifications',
      headers: ['id', 'title', 'categoryNumber', 'lastDate', 'link'],
      sample: [['n1', 'LDC 2025', '207/2025', '25-12-2025', 'https://keralapsc.gov.in']]
    },
    {
      name: 'LiveUpdates',
      headers: ['title', 'url', 'section', 'published_date'],
      sample: [['Rank List Published', 'https://keralapsc.gov.in', 'Rank Lists', '2025-01-01']]
    },
    {
      name: 'CurrentAffairs',
      headers: ['id', 'title', 'source', 'date'],
      sample: [['ca1', 'New Kerala Budget', 'Manorama', '2025-01-01']]
    },
    {
      name: 'GK',
      headers: ['id', 'fact', 'category'],
      sample: [['gk1', 'Periyar is the longest river.', 'Geography']]
    }
  ];

  sheets.forEach(s => {
    let sheet = ss.getSheetByName(s.name);
    if (!sheet) {
      sheet = ss.insertSheet(s.name);
    } else {
      sheet.clear(); 
    }
    
    // Set headers
    sheet.getRange(1, 1, 1, s.headers.length)
         .setValues([s.headers])
         .setBackground('#f3f3f3')
         .setFontWeight('bold');
    
    // Add sample data
    if (s.sample) {
      sheet.getRange(2, 1, s.sample.length, s.sample[0].length).setValues(s.sample);
    }
    
    // Freeze top row
    sheet.setFrozenRows(1);
  });

  SpreadsheetApp.getUi().alert('Database Initialized Successfully with New Structure!');
}
