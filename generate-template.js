const xlsx = require('xlsx');

// Create template data
const data = [
  {
    'Nama': 'John Doe',
    'Email': 'john@example.com',
    'Nomor Telepon': '081234567890',
    'Kelas': 'XII IPA 1',
    'Angkatan': 2020,
    'Pax': 1
  },
  {
    'Nama': 'Jane Smith',
    'Email': 'jane@example.com',
    'Nomor Telepon': '081234567891',
    'Kelas': 'XII IPA 2',
    'Angkatan': 2020,
    'Pax': 2
  }
];

// Create worksheet
const ws = xlsx.utils.json_to_sheet(data);

// Set column widths
ws['!cols'] = [
  { wch: 25 }, // Nama
  { wch: 30 }, // Email
  { wch: 20 }, // Nomor Telepon
  { wch: 15 }, // Kelas
  { wch: 12 }, // Angkatan
  { wch: 8 }   // Pax
];

// Create workbook
const wb = xlsx.utils.book_new();
xlsx.utils.book_append_sheet(wb, ws, 'Peserta');

// Write file
xlsx.writeFile(wb, 'template-import-peserta.xlsx');

console.log('Template Excel berhasil dibuat: template-import-peserta.xlsx');
