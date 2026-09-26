/**
 * ==============================================================================
 * Google Apps Script for Kim Somangkol Physics Platform (somongkol.vercel.app)
 * ------------------------------------------------------------------------------
 * កូដនេះប្រើសម្រាប់ភ្ជាប់គេហទំព័ររូបវិទ្យា ជាមួយ Google Sheets ក្នុង Google Drive
 * 1. ទទួលទិន្នន័យចុះឈ្មោះពីសិស្ស (doPost) បញ្ចូលក្នុង Sheets ដោយស្វ័យប្រវត្តិ
 * 2. បញ្ជូនទិន្នន័យសិស្សពី Sheets ត្រឡប់ទៅបង្ហាញលើគេហទំព័រវិញ (doGet)
 * ==============================================================================
 *
 * របៀបដំឡើង (Quick Setup Guide):
 * 1. បើក Google Sheets ក្នុង My Drive របស់អ្នក (ឬចូល https://sheets.new)
 * 2. ចុចម៉ឺនុយ Extensions (ផ្នែកបន្ថែម) -> Apps Script
 * 3. លុបកូដចាស់ៗចេញ រួចចម្លង (Copy) កូដក្នុងឯកសារនេះទាំងស្រុងទៅបិទភ្ជាប់ (Paste)
 * 4. ចុច Save (រូបថាស)
 * 5. ចុច Deploy (ដាក់ឱ្យប្រើប្រាស់) -> New deployment (ការដាក់ឱ្យប្រើប្រាស់ថ្មី)
 * 6. ចុចលើរូបកង់ធ្មេញ (Select type) -> ជ្រើសរើស "Web app" (កម្មវិធីបណ្ដាញ)
 *    - Description: Physics Enrollment API
 *    - Execute as: Me (គណនី Google របស់អ្នក)
 *    - Who has access: Anyone (អ្នកណាក៏បាន)  <--- **សំខាន់បំផុត**
 * 7. ចុច Deploy -> អនុញ្ញាតសិទ្ធិ (Authorize access)
 * 8. ចម្លង Web app URL (https://script.google.com/macros/s/.../exec)
 *    យកទៅដាក់ក្នុងគេហទំព័រត្រង់ប៊ូតុង "⚙️ កំណត់តំណ Sheets" ជាការស្រេច!
 */

// 1. Handles GET requests: Fetches all registered students as JSON
function doGet(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data = sheet.getDataRange().getValues();

    // If sheet is empty or only has the header row
    if (data.length <= 1) {
      return ContentService.createTextOutput(JSON.stringify({
        status: 'success',
        count: 0,
        data: []
      })).setMimeType(ContentService.MimeType.JSON);
    }

    var students = [];
    for (var i = 1; i < data.length; i++) {
      var row = data[i];
      var name = row[1];
      // Skip empty rows
      if (!name || String(name).trim() === '') continue;

      var id = row[0] || i;
      var grade = row[2] || '';
      var day = row[3] || '';
      var time = row[4] || '';
      var phone = row[5] || '';
      var date = row[6] || '';
      var status = row[7] || 'បានចុះឈ្មោះជាក់ស្តែង';

      var schedule = '';
      if (day && time) {
        schedule = day + ' (' + time + ')';
      } else {
        schedule = time || day || '';
      }

      students.push({
        id: id,
        name: String(name).trim(),
        grade: String(grade).trim(),
        day: String(day).trim(),
        time: String(time).trim(),
        schedule: schedule,
        phone: String(phone).trim(),
        date: String(date).trim(),
        status: String(status).trim()
      });
    }

    return ContentService.createTextOutput(JSON.stringify({
      status: 'success',
      count: students.length,
      data: students
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// 2. Handles POST requests: Appends a newly registered student to Google Sheets
function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

    // Auto-create Khmer headers if the sheet is completely blank
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        'ល.រ',
        'ឈ្មោះសិស្ស',
        'ថ្នាក់ទី',
        'ថ្ងៃសិក្សា',
        'ម៉ោងសិក្សា',
        'លេខទូរស័ព្ទ / Telegram',
        'កាលបរិច្ឆេទចុះឈ្មោះ',
        'ស្ថានភាព'
      ]);

      // Style header row nicely
      var headerRange = sheet.getRange(1, 1, 1, 8);
      headerRange.setFontWeight('bold');
      headerRange.setBackground('#0F9D58');
      headerRange.setFontColor('#FFFFFF');
      headerRange.setHorizontalAlignment('center');
      sheet.setFrozenRows(1);
    }

    var data = {};
    if (e.postData && e.postData.contents) {
      try {
        data = JSON.parse(e.postData.contents);
      } catch (ex) {
        data = e.parameter || {};
      }
    } else {
      data = e.parameter || {};
    }

    var nextId = sheet.getLastRow(); // Sequential row count as ID
    var name = data.name || '';
    var grade = data.grade || '';
    var day = data.day || '';
    var time = data.time || '';
    var phone = data.phone || '';
    var date = data.date || Utilities.formatDate(new Date(), 'Asia/Phnom_Penh', 'dd/MM/yyyy hh:mm a');
    var status = data.status || 'បានចុះឈ្មោះជាក់ស្តែង';

    if (name && String(name).trim() !== '') {
      sheet.appendRow([
        nextId,
        String(name).trim(),
        String(grade).trim(),
        String(day).trim(),
        String(time).trim(),
        String(phone).trim(),
        String(date).trim(),
        String(status).trim()
      ]);
    }

    return ContentService.createTextOutput(JSON.stringify({
      status: 'success',
      id: nextId,
      message: 'Student record saved successfully'
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}
