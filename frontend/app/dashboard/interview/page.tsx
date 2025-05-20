"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import * as tf from "@tensorflow/tfjs";
import * as blazeface from "@tensorflow-models/blazeface";
import "@tensorflow/tfjs-backend-webgl";

export default function InterviewPage() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const [recording, setRecording] = useState(false);
  const [faceCount, setFaceCount] = useState<number | null>(null);
  const [model, setModel] = useState<blazeface.BlazeFaceModel | null>(null);
  const [uploading, setUploading] = useState(false);
  const [recordTime, setRecordTime] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Replace with dynamic user email from auth context or props as needed
  const userEmail = "marlingeshwar@gmail.com";

  // Load BlazeFace model
  useEffect(() => {
    async function loadModel() {
      await tf.setBackend("webgl");
      await tf.ready();
      const loadedModel = await blazeface.load();
      setModel(loadedModel);
    }
    loadModel();
  }, []);

  // Setup camera and media recorder
  useEffect(() => {
    async function setupCamera() {
      if (!videoRef.current) return;

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        videoRef.current.srcObject = stream;
        await videoRef.current.play();

        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            recordedChunksRef.current.push(event.data);
          }
        };

        mediaRecorder.onstop = async () => {
          const blob = new Blob(recordedChunksRef.current, { type: "video/webm" });
          recordedChunksRef.current = [];
          await uploadVideo(blob);
        };
      } catch (error) {
        alert("Could not access camera/microphone.");
        console.error(error);
      }
    }

    setupCamera();

    return () => {
      // Cleanup: stop camera when component unmounts
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
        videoRef.current.srcObject = null;
      }
    };
  }, []);

  // Face detection loop
  useEffect(() => {
    let animationId: number;

    async function detectFaces() {
      if (!model || !videoRef.current || videoRef.current.readyState !== 4) {
        animationId = requestAnimationFrame(detectFaces);
        return;
      }

      const predictions = await model.estimateFaces(videoRef.current, false);
      setFaceCount(predictions.length);

      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext("2d");
        if (!ctx) return;

        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        predictions.forEach((prediction) => {
          if (!prediction.boundingBox) return;
          const [x, y] = prediction.boundingBox.topLeft;
          const [x2, y2] = prediction.boundingBox.bottomRight;
          const width = x2 - x;
          const height = y2 - y;

          ctx.strokeStyle = "red";
          ctx.lineWidth = 2;
          ctx.strokeRect(x, y, width, height);
        });
      }

      animationId = requestAnimationFrame(detectFaces);
    }

    detectFaces();

    return () => cancelAnimationFrame(animationId);
  }, [model]);

  // Start recording handler
  const startRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "inactive") {
      recordedChunksRef.current = [];
      setRecording(true);
      setRecordTime(0);
      mediaRecorderRef.current.start();

      timerRef.current = setInterval(() => {
        setRecordTime((prev) => prev + 1);
      }, 1000);
    }
  };

  // Stop recording handler
  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      const confirmed = window.confirm("Are you sure you want to end the interview?");
      if (confirmed) {
        mediaRecorderRef.current.stop();
        setRecording(false);
        if (timerRef.current) clearInterval(timerRef.current);
      }
    }
  };

  // Upload video blob to backend API
  const uploadVideo = async (blob: Blob) => {
    setUploading(true);
    const formData = new FormData();
    formData.append("video", blob, "interview.webm");
    formData.append("email", userEmail);

    try {
      const res = await fetch("http://127.0.0.1:8000/api/interview/upload/", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        // Stop all camera streams
        if (videoRef.current && videoRef.current.srcObject) {
          const stream = videoRef.current.srcObject as MediaStream;
          stream.getTracks().forEach((track) => track.stop());
          videoRef.current.srcObject = null;
        }

        router.push("/dashboard");
      } else {
        alert("Upload failed");
        setUploading(false);
      }
    } catch (err) {
      console.error("Upload error:", err);
      alert("Error uploading video");
      setUploading(false);
    }
  };

  return (
    <main className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Interview</h1>

      <div className="relative w-full max-w-full aspect-video border border-gray-500 rounded">
        <video
          ref={videoRef}
          className="w-full h-full object-cover rounded"
          muted
          playsInline
        />
        <canvas
          ref={canvasRef}
          className="absolute top-0 left-0 w-full h-full pointer-events-none"
        />
      </div>

      <p className="mt-4 text-lg">
        Faces detected:{" "}
        <span className={`font-semibold ${faceCount === 1 ? "text-green-600" : "text-red-600"}`}>
          {faceCount === null ? "Detecting..." : faceCount}
        </span>
      </p>

      {recording && (
        <div className="mt-2 w-full bg-gray-200 rounded">
          <div
            className="bg-blue-500 text-white text-xs leading-none py-1 text-center rounded transition-all duration-1000 ease-linear"
            style={{
              width: `${Math.min((recordTime % 60) * (100 / 60), 100)}%`,
            }}
          >
            Recording: {recordTime}s
          </div>
        </div>
      )}

      <div className="mt-6 flex gap-4">
        <button
          disabled={recording || faceCount !== 1 || uploading}
          onClick={startRecording}
          className={`px-6 py-2 rounded text-white ${recording || faceCount !== 1 || uploading
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-blue-600 hover:bg-blue-700"
            }`}
        >
          Start Recording
        </button>

        <button
          disabled={!recording || uploading}
          onClick={stopRecording}
          className={`px-6 py-2 rounded text-white ${recording ? "bg-red-600 hover:bg-red-700" : "bg-gray-400 cursor-not-allowed"
            }`}
        >
          End Interview
        </button>
      </div>

      {uploading && (
        <p className="mt-4 text-blue-600 font-medium animate-pulse">
          Uploading interview video, please wait...
        </p>
      )}
    </main>
  );
}
