"use client";

import { useState, useEffect } from "react";

/**
 * 백엔드 API 직접 테스트 페이지
 * 서버 응답과 SSE 연결을 실시간으로 모니터링
 */
export default function DebugApiPage() {
  const [buildId] = useState(
    "otto-codebuild-project:31af872a-5ee7-43d0-8a9a-54a5b0a6946b"
  );
  const [apiUrl] = useState("http://localhost:4000");
  const [logs, setLogs] = useState<string[]>([]);
  const [sseStatus, setSseStatus] = useState<
    "disconnected" | "connecting" | "connected"
  >("disconnected");
  const [eventSource, setEventSource] = useState<EventSource | null>(null);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs((prev) => [`[${timestamp}] ${message}`, ...prev.slice(0, 49)]);
  };

  // API 테스트 함수들
  const testStatusApi = async () => {
    try {
      addLog("🔍 Testing Status API...");
      const response = await fetch(
        `${apiUrl}/api/v1/logs/builds/${buildId}/status`
      );
      const data = await response.json();
      addLog(`✅ Status API: ${JSON.stringify(data)}`);
    } catch (error) {
      addLog(`❌ Status API Error: ${error}`);
    }
  };

  const testRecentApi = async () => {
    try {
      addLog("🔍 Testing Recent Logs API...");
      const response = await fetch(
        `${apiUrl}/api/v1/logs/builds/${buildId}/recent?limit=5`
      );
      const data = await response.json();
      addLog(`✅ Recent API: Found ${data.data?.length || 0} logs`);
      if (data.data?.length > 0) {
        addLog(
          `📝 Sample log: ${JSON.stringify(data.data[0]).substring(0, 200)}...`
        );
      }
    } catch (error) {
      addLog(`❌ Recent API Error: ${error}`);
    }
  };

  const testStartApi = async () => {
    try {
      addLog("🚀 Testing Start Collection API...");
      const response = await fetch(
        `${apiUrl}/api/v1/logs/builds/${buildId}/start`,
        {
          method: "POST",
        }
      );
      const data = await response.json();
      addLog(`✅ Start API: ${JSON.stringify(data)}`);
    } catch (error) {
      addLog(`❌ Start API Error: ${error}`);
    }
  };

  const startSSE = () => {
    if (eventSource) {
      eventSource.close();
    }

    addLog("🔗 Starting SSE connection...");
    setSseStatus("connecting");

    const sseUrl = `${apiUrl}/api/v1/logs/builds/${buildId}/stream`;
    const es = new EventSource(sseUrl);

    es.onopen = () => {
      addLog("✅ SSE Connected successfully");
      setSseStatus("connected");
    };

    es.onmessage = (event) => {
      addLog("📡 SSE Message received:");
      addLog(`📄 Raw data: ${event.data.substring(0, 500)}...`);

      try {
        const parsed = JSON.parse(event.data);
        addLog(`📊 Parsed events: ${parsed.events?.length || 0} events`);
        if (parsed.events?.length > 0) {
          addLog(
            `📝 First event: ${JSON.stringify(parsed.events[0]).substring(
              0,
              200
            )}...`
          );
        }
      } catch (err) {
        addLog(`❌ JSON Parse Error: ${err}`);
      }
    };

    es.onerror = (error) => {
      addLog(`❌ SSE Error: ${JSON.stringify(error)}`);
      addLog(`🔄 Connection state: ${es.readyState}`); // 0=CONNECTING, 1=OPEN, 2=CLOSED
      setSseStatus("disconnected");
    };

    setEventSource(es);
  };

  const stopSSE = () => {
    if (eventSource) {
      eventSource.close();
      setEventSource(null);
      setSseStatus("disconnected");
      addLog("⏹️ SSE Disconnected");
    }
  };

  const clearLogs = () => {
    setLogs([]);
  };

  useEffect(() => {
    return () => {
      if (eventSource) {
        eventSource.close();
      }
    };
  }, [eventSource]);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          🔧 Backend API Debug Console
        </h1>

        {/* API Info */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">📡 Connection Info</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <strong>API URL:</strong> {apiUrl}
            </div>
            <div>
              <strong>Build ID:</strong> {buildId.substring(0, 50)}...
            </div>
          </div>
        </div>

        {/* Control Panel */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">🎮 Test Controls</h2>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={testStatusApi}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
            >
              Test Status API
            </button>
            <button
              onClick={testRecentApi}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors"
            >
              Test Recent Logs API
            </button>
            <button
              onClick={testStartApi}
              className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition-colors"
            >
              Test Start Collection
            </button>
            <button
              onClick={sseStatus === "connected" ? stopSSE : startSSE}
              className={`px-4 py-2 rounded transition-colors ${
                sseStatus === "connected"
                  ? "bg-red-600 hover:bg-red-700 text-white"
                  : "bg-orange-600 hover:bg-orange-700 text-white"
              }`}
            >
              {sseStatus === "connected" ? "⏹️ Stop SSE" : "🔴 Start SSE"}
            </button>
            <button
              onClick={clearLogs}
              className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition-colors"
            >
              Clear Logs
            </button>
          </div>

          {/* SSE Status */}
          <div className="mt-4 p-3 rounded-lg bg-gray-50">
            <strong>SSE Status: </strong>
            <span
              className={`inline-block w-3 h-3 rounded-full mr-2 ${
                sseStatus === "connected"
                  ? "bg-green-500"
                  : sseStatus === "connecting"
                  ? "bg-yellow-500 animate-pulse"
                  : "bg-red-500"
              }`}
            ></span>
            {sseStatus}
          </div>
        </div>

        {/* Live Logs */}
        <div className="bg-black rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-white">
              📜 Live Debug Logs
            </h2>
            <span className="text-sm text-gray-400">
              Latest {logs.length} entries
            </span>
          </div>

          <div className="bg-gray-900 rounded p-4 h-96 overflow-y-auto font-mono text-sm">
            {logs.length === 0 ? (
              <div className="text-gray-500">
                No logs yet. Click buttons above to start testing...
              </div>
            ) : (
              logs.map((log, index) => (
                <div
                  key={index}
                  className={`mb-1 ${
                    log.includes("✅")
                      ? "text-green-400"
                      : log.includes("❌")
                      ? "text-red-400"
                      : log.includes("📡")
                      ? "text-blue-400"
                      : log.includes("🔍")
                      ? "text-yellow-400"
                      : "text-gray-300"
                  }`}
                >
                  {log}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Expected Responses */}
        <div className="mt-6 bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">
            📋 Expected Server Responses
          </h2>
          <div className="text-sm space-y-3">
            <div>
              <strong>Status API:</strong>{" "}
              <code>{`{"buildId": "...", "isActive": true/false}`}</code>
            </div>
            <div>
              <strong>Recent API:</strong>{" "}
              <code>{`{"success": true, "data": [...logs], "timestamp": ...}`}</code>
            </div>
            <div>
              <strong>SSE Stream:</strong>{" "}
              <code>{`{"buildId": "...", "events": [...], "timestamp": ...}`}</code>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
