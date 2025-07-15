import React, { useState, useRef } from 'react';
import { useReactMediaRecorder } from 'react-media-recorder';
import '../style/Recorder.css';
import '../style/Recorder.mobile.css';

export default function Recorder({ onTranscription }) {
  const { status, startRecording, stopRecording, mediaBlobUrl } =
    useReactMediaRecorder({ audio: true });
  const [saving, setSaving] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);
  const [transcript, setTranscript] = useState(null);
  const [timer, setTimer] = useState(0);
  const timerRef = useRef();
  const audioRef = useRef();

  // Timer logic
  React.useEffect(() => {
    if (status === 'recording') {
      timerRef.current = setInterval(() => setTimer(t => t + 1), 1000);
    } else {
      clearInterval(timerRef.current);
    }
    if (status === 'idle') setTimer(0);
    return () => clearInterval(timerRef.current);
  }, [status]);

  // Save transcript
  const save = async () => {
    setSaving(true);
    const blob = await fetch(mediaBlobUrl).then(r => r.blob());
    const fd = new FormData();
    fd.append('audio', blob, 'record.wav');
    const token = localStorage.getItem('token');
    const res = await fetch(
      `${import.meta.env.VITE_API_SOURCE}/transcripts/upload`,
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      }
    );
    if (res.ok) {
      const { transcription } = await res.json();
      setTranscript(transcription);
      setShowTranscript(true);
      onTranscription(transcription);
    } else {
      console.error('Upload failed:', await res.text());
    }
    setSaving(false);
  };

  // Format timer mm:ss
  const formatTime = (s) => `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;

  // Simple animated waveform (bars)
  const Waveform = ({ active }) => (
    <div className={`waveform${active ? ' active' : ''}`}>
      {[...Array(24)].map((_, i) => (
        <div key={i} className="bar" style={{ animationDelay: `${i * 0.04}s` }} />
      ))}
    </div>
  );

  return (
    <div className="recorder-card">
      <div className="mic-gradient">
        <svg width="80" height="80" viewBox="0 0 80 80">
          <defs>
            <linearGradient id="micg" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#a259ff" />
              <stop offset="100%" stopColor="#ff5e62" />
            </linearGradient>
          </defs>
          <circle cx="40" cy="40" r="38" fill="url(#micg)" />
          <path d="M40 22a10 10 0 0 1 10 10v12a10 10 0 0 1-20 0V32a10 10 0 0 1 10-10zm-14 20h28m-14 10v6" stroke="#fff" strokeWidth="3" strokeLinecap="round" fill="none" />
        </svg>
      </div>
      <div className="recorder-info">
        <span className="rec-label">Recording 001</span>
        <span className="rec-timer">{status === 'recording' ? formatTime(timer) : ''}</span>
      </div>
      <Waveform active={status === 'recording'} />
      <div className="rec-controls">
        {status === 'recording' ? (
          <button className="rec-btn pause" onClick={stopRecording}>
            <svg width="32" height="32" viewBox="0 0 32 32"><circle cx="16" cy="16" r="16" fill="#2d3cff" /><rect x="10" y="10" width="4" height="12" rx="2" fill="#fff"/><rect x="18" y="10" width="4" height="12" rx="2" fill="#fff"/></svg>
          </button>
        ) : (
          <button className="rec-btn record" onClick={startRecording}>
            <svg width="32" height="32" viewBox="0 0 32 32"><circle cx="16" cy="16" r="16" fill="#a259ff" /><circle cx="16" cy="16" r="8" fill="#fff"/></svg>
          </button>
        )}
      </div>
      {mediaBlobUrl && status !== 'recording' && (
        <div className="rec-playback">
          <audio ref={audioRef} src={mediaBlobUrl} controls style={{ width: '100%' }} />
          <button className="rec-btn save-gradient" onClick={save} disabled={saving}>
            {saving ? 'Generating…' : 'Generate Transcript'}
          </button>
        </div>
      )}
      {showTranscript && transcript && (
        <div className="rec-transcript-fadein">
          <h3>Transcript</h3>
          <div className="rec-transcript-text">{typeof transcript === 'string' ? transcript : transcript.text}</div>
        </div>
      )}
    </div>
  );
}
