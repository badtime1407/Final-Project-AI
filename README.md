✋ AI Finger Counting System (Final Project)

Real-Time Finger Counting System using AI on Web Browser
ระบบตรวจจับและนับจำนวนนิ้วมือทั้งสองข้างแบบเรียลไทม์ผ่านกล้องเว็บ

📌 Overview

โปรเจกต์นี้เป็นระบบที่ใช้ AI สำหรับตรวจจับตำแหน่งมือและนับจำนวนนิ้วที่ยกอยู่แบบ Real-Time ผ่าน Web Browser โดยไม่ต้องติดตั้งโปรแกรมเพิ่มเติม

ระบบสามารถ:

ตรวจจับมือได้สูงสุด 2 ข้าง

นับนิ้วได้ตั้งแต่ 0–10

แสดงผลแบบเรียลไทม์บนหน้าเว็บ

ใช้งานผ่านกล้อง Webcam

🧠 Technologies Used

MediaPipe – ตรวจจับตำแหน่งจุด landmark ของมือ

Next.js – Frontend framework

React – UI rendering

TypeScript

Tailwind CSS

Web Camera API

⚙️ How It Works

เปิดกล้องผ่าน Web Browser

ตรวจจับมือด้วย MediaPipe

ได้ตำแหน่ง landmark 21 จุดต่อ 1 มือ

วิเคราะห์ตำแหน่งปลายนิ้ว (Finger Tip)

เปรียบเทียบกับข้อนิ้วเพื่อดูว่ายกอยู่หรือไม่

รวมผลทั้งสองมือ

แสดงผลจำนวนรวมบนหน้าจอ

📷 Features

✅ Real-Time Finger Counting
✅ รองรับสองมือ
✅ แสดงผล Bounding Points
✅ ทำงานบน Web Browser
✅ ไม่ต้องติดตั้งโปรแกรมเพิ่ม

🚀 Installation & Setup
# Clone repository
git clone https://github.com/badtime1407/Final-Project-AI.git

# เข้าโฟลเดอร์โปรเจกต์
cd Final-Project-AI

# ติดตั้ง dependencies
npm install

# รันโปรเจกต์
npm run dev

จากนั้นเปิดที่:

http://localhost:3000

อนุญาตการใช้กล้อง แล้วเริ่มใช้งานได้เลย 🎉

📊 Output Example

ระบบจะแสดงผล:

จุด landmark บนมือ

จำนวนรวมของนิ้วที่ยกอยู่

แสดงผลแบบ Real-Time

⚠️ Limitations

ความแม่นยำขึ้นกับแสงและความชัดของกล้อง

มือที่ซ้อนกันอาจทำให้ค่าคลาดเคลื่อน

มุมกล้องบางมุมอาจนับผิด

🔮 Future Improvements

เพิ่ม Gesture Recognition (เช่น 👍 ✌️ ✋)

เชื่อมต่อกับเกมหรือระบบควบคุมด้วยมือ

เพิ่มระบบควบคุมผ่านท่าทาง (Hand Control Interface)

เพิ่มการบันทึกสถิติการใช้งาน

🎓 Project Information

Final Project – Artificial Intelligence
Developed for educational purposes