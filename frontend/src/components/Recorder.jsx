import { useReactMediaRecorder } from 'react-media-recorder';
import { useState } from 'react';

export default function Recorder({ onSave }) {
  const { status, startRecording, stopRecording, mediaBlobUrl } = useReactMediaRecorder({ audio: true });
  const [uploading, setUploading] = useState(false);

  const save = async () => {
    setUploading(true);
    const blob = await fetch(mediaBlobUrl).then(r => r.blob());
    const fd = new FormData();
    fd.append('audio', blob, 'rec.wav');
    const token = localStorage.getItem('token');
    const res = await fetch('http://localhost:4000/api/transcripts/upload', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: fd
    });
    const data = await res.json();
    onSave(data.transcription);
    setUploading(false);
  };

  return (
    <div>
      <button onClick={startRecording} disabled={status === 'recording'}>{status==='recording'?'Recording…':'Start'}</button>
      <button onClick={stopRecording} disabled={status !== 'recording'}>Stop</button>
      {mediaBlobUrl && !uploading && <button onClick={save}>Save Transcript</button>}
      {uploading && <span>Uploading…</span>}
    </div>
  );
}
