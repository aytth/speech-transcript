import { useState } from 'react';
import Recorder from './Recorder';

export default function Dashboard() {
  const [transcript, setTranscript] = useState(null);

  return (
    <div>
      <h1>Your Dashboard</h1>
      <Recorder onSave={setTranscript} />
      {transcript && (
        <pre style={{ whiteSpace: 'pre-wrap' }}>
          {/* e.g. word-level with timestamps */}
          {JSON.stringify(transcript, null, 2)}
        </pre>
      )}
    </div>
  );
}
