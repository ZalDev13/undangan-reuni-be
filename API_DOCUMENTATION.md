# Undangan Reuni API Documentation

## Base URL
```
http://localhost:5000/api
```

Saat menggunakan ngrok, ganti dengan:
```
https://your-ngrok-url.ngrok.io/api
```

---

## Endpoints

### 1. Import Participants (Bulk Import dari Excel)

**Endpoint:** `POST /api/import/import`

**Content-Type:** `multipart/form-data`

**Request:**
- Upload file Excel (.xlsx, .xls) atau CSV (.csv)
- Field name: `file`

**Format Excel:**
| Nama | Email | Nomor Telepon | Kelas | Angkatan | Pax |
|------|-------|---------------|-------|----------|-----|
| John Doe | john@example.com | 081234567890 | XII IPA 1 | 2020 | 1 |
| Jane Smith | jane@example.com | 081234567891 | XII IPA 2 | 2020 | 2 |

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Import selesai",
  "summary": {
    "total": 100,
    "success": 95,
    "duplicate": 3,
    "failed": 2
  },
  "data": {
    "success": [...],
    "duplicate": [...],
    "failed": [...]
  }
}
```

---

### 2. Create Participant (Tambah Peserta)

**Endpoint:** `POST /api/participants`

**Request Body:**
```json
{
  "nama": "John Doe",
  "email": "john@example.com",
  "nomorTelepon": "081234567890",
  "kelas": "XII IPA 1",
  "angkatan": 2020,
  "pax": 1
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Peserta berhasil ditambahkan",
  "data": {
    "id": "65f1234567890abcdef12345",
    "nama": "John Doe",
    "email": "john@example.com",
    "nomorTelepon": "081234567890",
    "kelas": "XII IPA 1",
    "angkatan": 2020,
    "pax": 1,
    "qrCode": "data:image/png;base64,iVBORw0KGgoAAAANS...",
    "statusKehadiran": "belum_konfirmasi",
    "uniqueUrl": "https://your-ngrok-url.ngrok.io/undangan/20201234567890abc"
  }
}
```

**Response (400 Bad Request - Email sudah terdaftar):**
```json
{
  "success": false,
  "message": "Email sudah terdaftar"
}
```

---

### 2. Get All Participants (Daftar Semua Peserta)

**Endpoint:** `GET /api/participants`

**Response (200 OK):**
```json
{
  "success": true,
  "count": 3,
  "data": [
    {
      "id": "65f1234567890abcdef12345",
      "nama": "John Doe",
      "email": "john@example.com",
      "nomorTelepon": "081234567890",
      "kelas": "XII IPA 1",
      "angkatan": 2020,
      "statusKehadiran": "belum_konfirmasi",
      "tanggalDibuat": "2025-02-28T10:00:00.000Z"
    }
  ]
}
```

---

### 3. Get Participant by QR Code

**Endpoint:** `GET /api/participants/qr/:qrCode`

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "65f1234567890abcdef12345",
    "nama": "John Doe",
    "email": "john@example.com",
    "kelas": "XII IPA 1",
    "angkatan": 2020,
    "pax": 1,
    "statusKehadiran": "belum_konfirmasi"
  }
}
```

**Response (404 Not Found):**
```json
{
  "success": false,
  "message": "Peserta tidak ditemukan"
}
```

---

### 4. Update Attendance Status (Update Status Kehadiran)

**Endpoint:** `PUT /api/participants/:id/attendance`

**Request Body:**
```json
{
  "statusKehadiran": "hadir"
}
```

**Valid status:** `belum_konfirmasi`, `hadir`, `tidak_hadir`

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Status kehadiran berhasil diupdate",
  "data": {
    "id": "65f1234567890abcdef12345",
    "nama": "John Doe",
    "statusKehadiran": "hadir"
  }
}
```

---

### 5. Delete Participant (Hapus Peserta)

**Endpoint:** `DELETE /api/participants/:id`

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Peserta berhasil dihapus"
}
```

**Response (404 Not Found):**
```json
{
  "success": false,
  "message": "Peserta tidak ditemukan"
}
```

---

### 6. Get Statistics (Statistik Peserta)

**Endpoint:** `GET /api/participants/stats`

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "total": 100,
    "hadir": 45,
    "tidakHadir": 30,
    "belumKonfirmasi": 25
  }
}
```

---

## Error Responses

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Terjadi kesalahan saat memproses permintaan",
  "error": "Error message details"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Route not found"
}
```

---

## Flow QR Code

1. **Input Peserta** → Admin menginput data peserta melalui form atau import Excel
2. **Generate QR Code** → Sistem otomatis generate QR code unik untuk setiap peserta
3. **QR Code Content** → QR code berisi URL unik: `https://your-ngrok-url.ngrok.io/undangan/{uniqueId}`
4. **Download QR Code** → Admin download QR code untuk dibagikan ke peserta
5. **Scan QR Code** → Peserta scan QR code dan diarahkan ke halaman undangan digital mereka
6. **Halaman Undangan** → Tampil halaman undangan dengan nama peserta dan jumlah pax

---

## Testing dengan cURL

### Import Excel
```bash
curl -X POST http://localhost:5000/api/import/import \
  -F "file=@/path/to/file.xlsx"
```

### Create Participant
```bash
curl -X POST http://localhost:5000/api/participants \
  -H "Content-Type: application/json" \
  -d "{\"nama\":\"John Doe\",\"email\":\"john@example.com\",\"nomorTelepon\":\"081234567890\",\"kelas\":\"XII IPA 1\",\"angkatan\":2020}"
```

### Get All Participants
```bash
curl http://localhost:5000/api/participants
```

### Get Statistics
```bash
curl http://localhost:5000/api/participants/stats
```
