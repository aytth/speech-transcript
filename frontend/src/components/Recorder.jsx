import React, { useState } from 'react'
import { useReactMediaRecorder } from 'react-media-recorder'
import '../style/Recorder.css'

export default function Recorder() {
  const { status, startRecording, stopRecording, mediaBlobUrl } = useReactMediaRecorder({ audio: true })
  const [saving, setSaving] = useState(false)

  const save = async () => {
    setSaving(true)
    setSaving(false)
  }

  return (
    <div className="recorder">
      <button
        className={status === 'recording' ? 'recording' : 'start'}
        onClick={status === 'recording' ? undefined : startRecording}
        disabled={status === 'recording'}
      >
        {status === 'recording' ? '● Recording' : 'Add Recording'}
      </button>
      <button
        className="stop"
        onClick={stopRecording}
        disabled={status !== 'recording'}
      >
        Stop Recording
      </button>
      {mediaBlobUrl && !saving && (
        <button className="start" onClick={save}>
          Save Transcript
        </button>
      )}
      {saving && <span>Uploading…</span>}
    </div>
  )
}
