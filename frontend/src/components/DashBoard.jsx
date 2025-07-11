import React, { useState } from 'react';
import Recorder from './Recorder';
import '../style/DashBoard.css';

export default function Dashboard() {
  const [transcript, setTranscript] = useState(null);

  return (
    <div className="dashboard">
      <h1 className="dashboard-title">Voice Recorder</h1>

      <div className="actions">
        <Recorder onTranscription={setTranscript} />
      </div>

      <div className="transcript">
        {transcript ? (
          transcript.segments ? (
            transcript.segments.map((s, i) => (
              <span
                key={i}
                className="word"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                {s.text + ' '}
              </span>
            ))
          ) : (
            <p className="full-text">{transcript.text}</p>
          )
        ) : (
          <p className="placeholder">Your transcript will appear here.</p>
        )}
      </div>
    </div>
  );
}
