// ============================================
// PLN RAB & Monitoring - Backend API
// Google Apps Script
// ============================================

// SETUP: Replace with your actual Drive folder ID for uploads
const UPLOAD_FOLDER_ID = '1bqNDBJkAjfU1w30XZE_qua8GXC2h9LGd';

function doGet(e) {
  return handleRequest(e, 'GET');
}

function doPost(e) {
  return handleRequest(e, 'POST');
}

function handleRequest(e, method) {
  // CORS Headers
  const output = ContentService.createTextOutput();
  
  try {
    let action, params;
    
    if (method === 'GET') {
      action = e.parameter.action;
      params = e.parameter;
    } else {
      const body = JSON.parse(e.postData.contents);
      action = body.action;
      params = body;
    }
    
    let result = { success: false, message: 'Action not found' };
    
    switch (action) {
      case 'login':
        result = doLogin(params);
        break;
      case 'getData':
        result = getData(params.sheet, params.filters);
        break;
      case 'getById':
        result = getById(params.sheet, params.id);
        break;
      case 'addData':
        result = addData(params.sheet, params.data);
        break;
      case 'updateData':
        result = updateData(params.sheet, params.id, params.data);
        break;
      case 'deleteData':
        result = deleteData(params.sheet, params.id);
        break;
      case 'uploadFile':
        result = uploadFile(params.fileData, params.fileName, params.folderId);
        break;
      case 'getDashboardData':
        result = getDashboardData(params.filters);
        break;
      default:
        result = { success: false, message: 'Invalid action: ' + action };
    }
    
    output.setMimeType(ContentService.MimeType.JSON);
    output.setContent(JSON.stringify(result));
    
  } catch (error) {
    output.setMimeType(ContentService.MimeType.JSON);
    output.setContent(JSON.stringify({
      success: false,
      message: 'Server Error: ' + error.message,
      stack: error.stack
    }));
  }
  
  return output;
}

// ==========================================
// Authentication
// ==========================================
function doLogin(params) {
  const { username, password } = params;
  
  // Ambil data users
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Users');
  
  if (!sheet) return { success: false, message: 'Tabel Users tidak ditemukan' };
  
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  
  // Find username index and password index
  const userIdx = headers.indexOf('username');
  const passIdx = headers.indexOf('password_hash'); // In a real app, this should be hashed
  
  if (userIdx === -1 || passIdx === -1) {
    return { success: false, message: 'Struktur tabel Users tidak valid' };
  }
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][userIdx] === username && data[i][passIdx] === password) {
      // Build user object
      const user = {};
      headers.forEach((header, index) => {
        if (header !== 'password_hash') { // Don't return password
          user[header] = data[i][index];
        }
      });
      
      return { success: true, user: user };
    }
  }
  
  return { success: false, message: 'Username atau password salah' };
}

// ==========================================
// CRUD Operations
// ==========================================
function getData(sheetName, filtersJson) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(sheetName);
  
  if (!sheet) return { success: false, message: 'Sheet ' + sheetName + ' tidak ditemukan' };
  
  const data = sheet.getDataRange().getValues();
  if (data.length < 2) return { success: true, data: [] }; // No data
  
  const headers = data[0];
  const items = [];
  
  let filters = {};
  if (filtersJson) {
    try {
      filters = JSON.parse(filtersJson);
    } catch(e) {}
  }
  
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const item = {};
    let matchFilters = true;
    
    headers.forEach((header, index) => {
      item[header] = row[index];
    });
    
    // Apply filters
    for (let key in filters) {
      if (filters[key] && item[key] !== undefined && item[key] != filters[key]) {
        matchFilters = false;
        break;
      }
    }
    
    if (matchFilters) {
      items.push(item);
    }
  }
  
  return { success: true, data: items };
}

function getById(sheetName, id) {
  const result = getData(sheetName, JSON.stringify({ id: id }));
  if (result.success && result.data.length > 0) {
    return { success: true, data: result.data[0] };
  }
  return { success: false, message: 'Data tidak ditemukan' };
}

function addData(sheetName, dataObj) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(sheetName);
  
  if (!sheet) return { success: false, message: 'Sheet ' + sheetName + ' tidak ditemukan' };
  
  const headers = sheet.getDataRange().getValues()[0];
  const newRow = [];
  
  // Generate ID if not provided
  if (!dataObj.id) {
    dataObj.id = Utilities.getUuid();
  }
  
  // Add created_at if exists in headers
  if (headers.includes('created_at') && !dataObj.created_at) {
    dataObj.created_at = new Date().toISOString();
  }
  
  headers.forEach(header => {
    newRow.push(dataObj[header] !== undefined ? dataObj[header] : '');
  });
  
  sheet.appendRow(newRow);
  
  return { success: true, data: dataObj, message: 'Data berhasil ditambahkan' };
}

function updateData(sheetName, id, dataObj) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(sheetName);
  
  if (!sheet) return { success: false, message: 'Sheet ' + sheetName + ' tidak ditemukan' };
  
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const idIdx = headers.indexOf('id');
  
  if (idIdx === -1) return { success: false, message: 'Kolom ID tidak ditemukan' };
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][idIdx] == id) {
      // Found the row, update values
      headers.forEach((header, index) => {
        if (dataObj[header] !== undefined) {
          // Add +1 because getRange is 1-indexed, and +1 because data array is 0-indexed while skipping header
          sheet.getRange(i + 1, index + 1).setValue(dataObj[header]);
        }
      });
      return { success: true, message: 'Data berhasil diupdate' };
    }
  }
  
  return { success: false, message: 'Data dengan ID tersebut tidak ditemukan' };
}

function deleteData(sheetName, id) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(sheetName);
  
  if (!sheet) return { success: false, message: 'Sheet ' + sheetName + ' tidak ditemukan' };
  
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const idIdx = headers.indexOf('id');
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][idIdx] == id) {
      sheet.deleteRow(i + 1);
      return { success: true, message: 'Data berhasil dihapus' };
    }
  }
  
  return { success: false, message: 'Data tidak ditemukan' };
}

// ==========================================
// File Upload to Drive
// ==========================================
function uploadFile(base64Data, fileName, folderId) {
  try {
    const fId = folderId || UPLOAD_FOLDER_ID;
    const folder = DriveApp.getFolderById(fId);
    
    // Split the base64 string to get the mime type and the data
    const splitBase = base64Data.split(',');
    const type = splitBase[0].split(';')[0].replace('data:', '');
    const byteCharacters = Utilities.base64Decode(splitBase[1]);
    
    const blob = Utilities.newBlob(byteCharacters, type, fileName);
    const file = folder.createFile(blob);
    
    // Make file accessible
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    
    return { 
      success: true, 
      url: file.getUrl(),
      downloadUrl: file.getDownloadUrl(),
      id: file.getId()
    };
  } catch (error) {
    return { success: false, message: 'Gagal upload file: ' + error.message };
  }
}

// ==========================================
// Dashboard Dashboard (Aggregation)
// ==========================================
function getDashboardData(filtersJson) {
  // In a real implementation, this would aggregate data from Pekerjaan, Kontrak, Realisasi
  // For now, let's return some basic aggregated stats or default demo data if sheets are empty
  
  let filters = {};
  if (filtersJson) {
    try { filters = JSON.parse(filtersJson); } catch(e) {}
  }
  
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // Check if we have data in Pekerjaan
  const sheetPekerjaan = ss.getSheetByName('Pekerjaan');
  const sheetKontrak = ss.getSheetByName('Kontrak');
  
  if (!sheetPekerjaan || sheetPekerjaan.getLastRow() < 2) {
    // Return mock data if no real data yet
    return {
      success: true,
      isMock: true,
      message: 'Menampilkan data demo karena database masih kosong'
    };
  }
  
  // Very basic aggregation logic here
  // Real implementation would calculate these from the actual sheets
  
  return {
    success: true,
    data: {
      totalAnggaran: 0, // Calculate from Pekerjaan volume * ...
      nilaiKontrak: 0, // Calculate from Kontrak
      realisasi: 0, // Calculate from Realisasi
      // ... fill with actual calculated values
    }
  };
}
