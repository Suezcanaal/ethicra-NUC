"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

interface Report {
  id: number;
  video: string;
  converted_video: string;
  total_frames: number;
  face_frames: number;
  analyzed: boolean;
}

export default function DashboardPage() {
  const router = useRouter();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const resumeUploaded = true; // Placeholder (you can fetch from backend later)
  const interviews = [
    { id: 1, date: "2025-04-20", status: "Passed" },
    { id: 2, date: "2025-05-10", status: "Scheduled" },
  ];

  useEffect(() => {
    axios
      .get("http://localhost:8000/api/interview/reports/")
      .then((res) => setReports(res.data))
      .catch((err) => console.error("Failed to fetch reports", err))
      .finally(() => setLoading(false));
  }, []);

  function handleStartInterview() {
    router.push("/dashboard/pre-interview");
  }

  return (
    <main className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Reports / Scores</h2>
        {loading ? (
          <p>Loading reports...</p>
        ) : reports.length === 0 ? (
          <p>No reports available.</p>
        ) : (
          <ul className="list-disc list-inside">
            {reports.map((report, idx) => {
              const passRate = report.face_frames / report.total_frames;
              const status = passRate > 0.8 ? "✅ Passed" : "⚠️ Check Needed";
              return (
                <li key={report.id}>
                  Report {idx + 1}: {status} — Face Frames:{" "}
                  {report.face_frames} / {report.total_frames}
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Resume</h2>
        {resumeUploaded ? (
          <p>Your resume is uploaded.</p>
        ) : (
          <p>No resume uploaded yet.</p>
        )}
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Previous Interviews</h2>
        <ul className="list-disc list-inside">
          {interviews.map((interview) => (
            <li key={interview.id}>
              Date: {interview.date} - Status: {interview.status}
            </li>
          ))}
        </ul>
      </section>

      <button
        onClick={handleStartInterview}
        className="px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
      >
        Start Interview
      </button>
    </main>
  );
}
