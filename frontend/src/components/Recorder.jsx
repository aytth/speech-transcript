import React, { useState } from 'react';
import { useReactMediaRecorder } from 'react-media-recorder';
import '../style/Recorder.css';

export default function Recorder({ onTranscription }) {
  const { status, startRecording, stopRecording, mediaBlobUrl } =
    useReactMediaRecorder({ audio: true });
  const [saving, setSaving] = useState(false);

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
      onTranscription(transcription);
    } else {
      console.error('Upload failed:', await res.text());
    }
    setSaving(false);
  };

  return (
    <div className="recorder">
      <button
        className={`btn start ${status}`}
        onClick={status === 'recording' ? undefined : startRecording}
        disabled={status === 'recording'}
      >
        {status === 'recording' ? '● Recording' : 'Add Recording'}
      </button>

      <button
        className="btn stop"
        onClick={stopRecording}
        disabled={status !== 'recording'}
      >
        Stop
      </button>

      {mediaBlobUrl && !saving && (
        <button className="btn save" onClick={save}>
          {saving ? 'Uploading…' : 'Save Transcript'}
        </button>
      )}

      {saving && <div className="loader" />}
    </div>
  );
}
