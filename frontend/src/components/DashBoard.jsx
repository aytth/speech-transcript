import React from 'react'
import Recorder from './Recorder'
import '../style/DashBoard.css'

export default function Dashboard() {
  return (
    <div className="dashboard">
      <h1>Voice Recorder</h1>
      <div className="actions">
        <Recorder />
        
      </div>
      <div className="transcript">
        
      </div>
    </div>
  )
}
