import React, { useState } from 'react';
import Recorder from './Recorder';
import '../style/DashBoard.css';

export default function Dashboard() {
  const [transcript, setTranscript] = useState(null);
  const [showNewTranscript, setShowNewTranscript] = useState(false);

  return (
    <div className="dashboard">
      <div className="dashboard-bg" />
      <h1 className="dashboard-title">Speech Transcript</h1>
      <div className="actions">
        <Recorder onTranscription={t => { setTranscript(t); setShowNewTranscript(true); }} />
      </div>
    </div>
  );
}
