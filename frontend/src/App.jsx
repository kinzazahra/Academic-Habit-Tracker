import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const socket = io('http://localhost:5000');

export default function App() {
  const [logs, setLogs] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [systemRisk, setSystemRisk] = useState('Stable');

  useEffect(() => {
    // Listen for streaming raw logs
    socket.on('raw_log_stream', (newLog) => {
      setLogs((prev) => [newLog, ...prev.slice(0, 49)]);
    });

    // Listen for high-risk security alerts verified by AI
    socket.on('security_alert', (threat) => {
      setAlerts((prev) => [threat, ...prev]);
      if (threat.severity === 'Critical' || threat.severity === 'High') {
        setSystemRisk('Elevated Threat Vector');
      }
    });

    return () => {
      socket.off('raw_log_stream');
      socket.off('security_alert');
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 font-sans">
      <header className="flex justify-between items-center border-b border-slate-800 pb-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-wider text-cyan-400">SENTINEL // AI</h1>
          <p className="text-xs text-slate-400">Autonomous Cloud Security Operations</p>
        </div>
        <div className={`px-4 py-1.5 rounded text-xs font-semibold uppercase tracking-widest ${
          systemRisk === 'Stable' ? 'bg-emerald-950/50 text-emerald-400 border border-emerald-500/30' : 'bg-rose-950/50 text-rose-400 border border-rose-500/30'
        }`}>
          System State: {systemRisk}
        </div>
      </header>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Hand Column: Live Ingestion Feed */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 h-[650px] flex flex-col">
          <h2 className="text-sm font-semibold text-slate-300 tracking-wider mb-3 uppercase flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-cyan-500 animate-ping" />
            Live Ingested Telemetry Logs
          </h2>
          <div className="flex-1 overflow-y-auto font-mono text-[11px] space-y-2 pr-2 scrollbar-thin">
            {logs.length === 0 ? (
              <p className="text-slate-500 italic text-center pt-20">Awaiting stream packets...</p>
            ) : (
              logs.map((log, index) => (
                <div key={index} className="bg-slate-950 p-2.5 rounded border border-slate-800/60 hover:border-slate-700/60 transition">
                  <span className="text-cyan-500">[{new Date(log.timestamp).toLocaleTimeString()}]</span>{' '}
                  <span className="text-purple-400 font-semibold">{log.source}</span> —{' '}
                  <span className="text-amber-400">{log.eventType}</span>
                  <pre className="text-slate-400 mt-1 overflow-x-auto text-[10px]">{JSON.stringify(log.details)}</pre>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Hand Column: AI Security Threat Analytics */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 h-[650px] flex flex-col">
          <h2 className="text-sm font-semibold text-rose-400 tracking-wider mb-3 uppercase">
            Active Real-Time Security Threats & LLM Context
          </h2>
          <div className="flex-1 overflow-y-auto space-y-4 pr-2">
            {alerts.length === 0 ? (
              <div className="text-center pt-20 text-slate-500 text-sm">
                No active operational anomalies discovered by models.
              </div>
            ) : (
              alerts.map((alert, index) => (
                <div key={index} className="bg-slate-950 rounded-lg border border-rose-950 p-4 transition-all animate-fadeIn">
                  <div className="flex justify-between items-start mb-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wide uppercase ${
                      alert.severity === 'Critical' ? 'bg-rose-600 text-white' : 'bg-amber-600 text-white'
                    }`}>
                      {alert.severity} Risk
                    </span>
                    <span className="text-[11px] text-slate-500 font-mono">
                      Conf: {(alert.confidenceScore * 100).toFixed(0)}%
                    </span>
                  </div>
                  
                  <div className="text-xs text-slate-300 font-mono mb-3 bg-slate-900/50 p-2 rounded border border-slate-800">
                    <strong>Event Vector Details:</strong> {JSON.stringify(alert.rawDetails)}
                  </div>

                  <div className="text-xs bg-slate-900 border-l-2 border-cyan-500 p-3 rounded-r mb-2">
                    <div className="text-cyan-400 font-semibold text-[11px] uppercase tracking-wider mb-1">Llama 3 Root Cause Analysis:</div>
                    <p className="text-slate-300 italic leading-relaxed">"{alert.aiExplanation}"</p>
                  </div>

                  <div className="text-xs bg-emerald-950/20 border-l-2 border-emerald-500 p-3 rounded-r">
                    <div className="text-emerald-400 font-semibold text-[11px] uppercase tracking-wider mb-1">Recommended Action Protocol:</div>
                    <p className="text-slate-300 font-mono">{alert.remediationSteps}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}