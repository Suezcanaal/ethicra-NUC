// File: /app/dashboard/pre-interview/page.tsx

"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function PreInterviewChecks() {
  const router = useRouter();

  const [cameraAvailable, setCameraAvailable] = useState<boolean | null>(null);
  const [micAvailable, setMicAvailable] = useState<boolean | null>(null);
  const [internetAvailable, setInternetAvailable] = useState<boolean | null>(
    null
  );

  const [checking, setChecking] = useState(false);

  // Function to check camera access
  async function checkCamera() {
    try {
      await navigator.mediaDevices.getUserMedia({ video: true });
      setCameraAvailable(true);
    } catch {
      setCameraAvailable(false);
    }
  }

  // Function to check mic access
  async function checkMic() {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      setMicAvailable(true);
    } catch {
      setMicAvailable(false);
    }
  }

  // Check internet connection by using navigator.onLine
  function checkInternet() {
    setInternetAvailable(navigator.onLine);
  }

  async function runAllChecks() {
    setChecking(true);
    await Promise.all([checkCamera(), checkMic()]);
    checkInternet();
    setChecking(false);
  }

  useEffect(() => {
    runAllChecks();

    // Optional: Listen for online/offline events to update internet status live
    function updateOnlineStatus() {
      setInternetAvailable(navigator.onLine);
    }

    window.addEventListener("online", updateOnlineStatus);
    window.addEventListener("offline", updateOnlineStatus);

    return () => {
      window.removeEventListener("online", updateOnlineStatus);
      window.removeEventListener("offline", updateOnlineStatus);
    };
  }, []);

  const allPassed = cameraAvailable && micAvailable && internetAvailable;

  return (
    <main className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Pre-Interview Checks</h1>

      <ul className="space-y-4 text-lg">
        <li>
          Camera:{" "}
          {cameraAvailable === null ? (
            "Checking..."
          ) : cameraAvailable ? (
            <span className="text-green-600 font-semibold">✅ Available</span>
          ) : (
            <span className="text-red-600 font-semibold">❌ Not Available</span>
          )}
        </li>
        <li>
          Microphone:{" "}
          {micAvailable === null ? (
            "Checking..."
          ) : micAvailable ? (
            <span className="text-green-600 font-semibold">✅ Available</span>
          ) : (
            <span className="text-red-600 font-semibold">❌ Not Available</span>
          )}
        </li>
        <li>
          Internet Connection:{" "}
          {internetAvailable === null ? (
            "Checking..."
          ) : internetAvailable ? (
            <span className="text-green-600 font-semibold">✅ Connected</span>
          ) : (
            <span className="text-red-600 font-semibold">❌ Disconnected</span>
          )}
        </li>
      </ul>

      <div className="mt-8 flex gap-4">
        <button
          onClick={runAllChecks}
          disabled={checking}
          className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 disabled:opacity-50"
        >
          {checking ? "Checking..." : "Retry Checks"}
        </button>

        <button
          onClick={() => router.push("/dashboard/interview")}
          disabled={!allPassed}
          className={`px-4 py-2 rounded text-white ${
            allPassed
              ? "bg-green-600 hover:bg-green-700"
              : "bg-gray-400 cursor-not-allowed"
          }`}
        >
          Proceed to Interview
        </button>
      </div>
    </main>
  );
}
