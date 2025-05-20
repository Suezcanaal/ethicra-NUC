# backend/interview/models.py
import os
import cv2
import subprocess
from django.db import models
from django.conf import settings
from django.core.mail import send_mail

class InterviewVideo(models.Model):
    video = models.FileField(upload_to='interviews/')
    converted_video = models.FileField(upload_to='converted/', null=True, blank=True)

    total_frames = models.IntegerField(default=0)
    face_frames = models.IntegerField(default=0)
    score = models.FloatField(default=0.0)
    analyzed = models.BooleanField(default=False)
    email = models.EmailField(null=True, blank=True)  # Optional user email

    def convert_webm_to_mp4(self):
        if not self.video.name.endswith('.webm'):
            return None

        input_path = os.path.join(settings.MEDIA_ROOT, self.video.name)
        output_filename = os.path.splitext(os.path.basename(self.video.name))[0] + '.mp4'
        output_path = os.path.join(settings.MEDIA_ROOT, 'converted', output_filename)

        os.makedirs(os.path.dirname(output_path), exist_ok=True)

        cmd = [
            'ffmpeg',
            '-i', input_path,
            '-c:v', 'libx264',
            '-preset', 'fast',
            '-c:a', 'aac',
            output_path
        ]

        subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)

        self.converted_video.name = f'converted/{output_filename}'
        self.save()

        return output_path

    def analyze_video(self):
        video_path = os.path.join(settings.MEDIA_ROOT, self.converted_video.name)

        face_cascade = cv2.CascadeClassifier(
            cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
        )

        cap = cv2.VideoCapture(video_path)
        if not cap.isOpened():
            return

        total_frames = 0
        face_frames = 0

        while True:
            ret, frame = cap.read()
            if not ret:
                break

            total_frames += 1
            gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            faces = face_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=3)

            if len(faces) > 0:
                face_frames += 1

        cap.release()

        self.total_frames = total_frames
        self.face_frames = face_frames
        self.analyzed = True

        if total_frames > 0:
            self.score = round((face_frames / total_frames) * 100, 2)
        else:
            self.score = 0.0

        self.save()

        if self.email:
            self.send_result_email()

    def send_result_email(self):
        subject = "Interview Analysis Completed"
        message = f"""Hi,
Your interview analysis is complete.

Total Frames: {self.total_frames}
Face Frames: {self.face_frames}
Score: {self.score}%

Thank you,
Ethicra Team
"""
        send_mail(subject, message, "no-reply@ethicra.com", [self.email])
