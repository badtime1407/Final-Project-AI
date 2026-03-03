<<<<<<< HEAD
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

=======
YOLOv8 Real-Time Object Detection (Final Project)
📌 Overview

โปรเจกต์นี้เป็นระบบ Real-Time Object Detection
ที่พัฒนาด้วย YOLOv8 และรันผ่าน ONNX Runtime Web บน Browser

ระบบสามารถตรวจจับวัตถุจากกล้องเว็บแคมแบบเรียลไทม์
พร้อมแสดง Bounding Box, Class Name และ Confidence Score

🎯 Objective

ศึกษาและประยุกต์ใช้ Deep Learning ในงาน Computer Vision
เข้าใจหลักการ Object Detection
ทำงานกับ ONNX Runtime บน WebAssembly
แสดงผลแบบ Real-time ผ่าน Web Browser

🧠 AI Model

Model: YOLOv8n
Dataset: COCO Dataset (80 classes)
Framework: Ultralytics YOLO
Export Format: ONNX
Runtime: onnxruntime-web (WASM)

⚙️ System Workflow

เปิดกล้องเว็บแคม
Capture frame แบบ real-time
Resize ภาพเป็น 640x640
ส่งเข้า YOLOv8 ONNX model
Decode output tensor
Apply Non-Maximum Suppression (NMS)
แสดง Bounding Box + Confidence

🖥️ Technologies Used

Next.js (React)
>>>>>>> parent of 0e4dd31 (Merge branch 'main' of https://github.com/badtime1407/Final-Project-AI)
TypeScript
ONNX Runtime Web
YOLOv8
Tailwind CSS

<<<<<<< HEAD
Web Camera API

⚙️ How It Works

เปิดกล้องผ่าน Web Browser

ตรวจจับมือด้วย MediaPipe
=======
📦 Installation
>>>>>>> parent of 0e4dd31 (Merge branch 'main' of https://github.com/badtime1407/Final-Project-AI)

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

<<<<<<< HEAD
จากนั้นเปิดที่:
=======
เปิดที่: http://localhost:3000
>>>>>>> parent of 0e4dd31 (Merge branch 'main' of https://github.com/badtime1407/Final-Project-AI)

http://localhost:3000

<<<<<<< HEAD
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
=======
กดปุ่ม Start Camera
ระบบจะเริ่มตรวจจับวัตถุแบบเรียลไทม์
กด Stop Camera เพื่อหยุดการทำงาน

📊 Features

Real-time Object Detection
COCO 80 Classes
Non-Maximum Suppression (NMS)
Bounding Box Visualization
Confidence Score Display
FPS Counter
Start / Stop Camera Control

จำกัดจำนวน Bounding Box สูงสุด 2 รายการ

⚠️ Limitations

ใช้ Pre-trained Model (ไม่ได้เทรนใหม่)
>>>>>>> parent of 0e4dd31 (Merge branch 'main' of https://github.com/badtime1407/Final-Project-AI)

ความแม่นยำขึ้นกับแสงและมุมกล้อง

<<<<<<< HEAD
เพิ่ม Gesture Recognition (เช่น 👍 ✌️ ✋)

เชื่อมต่อกับเกมหรือระบบควบคุมด้วยมือ

เพิ่มระบบควบคุมผ่านท่าทาง (Hand Control Interface)

เพิ่มการบันทึกสถิติการใช้งาน

🎓 Project Information

Final Project – Artificial Intelligence
Developed for educational purposes
=======
YOLOv8n เป็นโมเดลขนาดเล็ก (เน้นความเร็ว)

🔬 Future Improvements

ใช้ YOLOv8s หรือ YOLOv8m เพื่อเพิ่มความแม่นยำ

Train Custom Dataset

เพิ่ม Class Filter

เพิ่ม Dashboard วิเคราะห์สถิติ
>>>>>>> parent of 0e4dd31 (Merge branch 'main' of https://github.com/badtime1407/Final-Project-AI)
