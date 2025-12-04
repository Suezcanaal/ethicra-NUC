
# 🎓 Ethicra – AI-Enhanced Video Interview Platform

Ethicra is a full-stack web application built to simulate and analyze student interviews using facial detection and AI. It offers an integrated dashboard for students to manage resumes, view reports, start interviews, and receive automated feedback.

---

## 📁 Project Structure

```
ethicra/
│
├── frontend/          # Next.js 14 frontend with face detection and video recording
├── backend/           # Django backend with interview upload & analysis API
├── venv/              # Python virtual environment (excluded from Git)
└── README.md
```

---

## 🌐 Frontend (Next.js)

### Features:
- Student Dashboard
- Resume Upload
- Start Interview (Camera/Mic/Face Detection)
- Record Interview using MediaRecorder
- Real-time face validation with TensorFlow.js + BlazeFace
- Upload video to backend

### Commands:
```bash
cd frontend
npm install
npm run dev
```

---

## 🔧 Backend (Django)

### Features:
- REST API for video upload
- Media storage in `/media/`
- Auto video format conversion (.webm → .mp4)
- Frame-by-frame face detection using OpenCV
- Interview analysis score and email notifications

### Commands:
```bash
cd backend
python -m venv ../venv
../venv/Scripts/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

---

## 📊 Interview Analysis Flow

1. User records and uploads interview video
2. Backend:
    - Converts to `.mp4`
    - Extracts frames with OpenCV
    - Detects faces per frame
    - Calculates a face visibility score
    - Stores analysis report
3. Email notification sent to user

---

## ⚙️ Requirements

### Frontend:
- Node.js
- npm

### Backend:
- Python 3.10+
- Django
- OpenCV
- ffmpeg (for video conversion)

---

## 🚫 Git Ignored Items

- `venv/` – Python virtual environment
- `node_modules/` – Frontend dependencies
- `.next/` – Next.js build files
- `media/` – Uploaded and converted interview videos
- `db.sqlite3` – Local development database

---

---

## 📌 To-Do

- [x] Resume upload
- [x] Interview video recording & upload
- [x] Face detection & frame analysis
- [x] Result report with score
- [x] Admin dashboard for interviewer view
- [x] Advanced cheating detection (multi-face, no-face, etc.)

---

## 🤝 Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you’d like to change.

---

## 📜 License

[MIT](LICENSE)

---

## 🙋‍♂️ Author

Developed by **Team Ethicra**  
*Engineering Students | Fullstack Developer | AI Enthusiast*
