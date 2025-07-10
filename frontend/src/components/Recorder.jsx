import React, { useState } from 'react'
import { useReactMediaRecorder } from 'react-media-recorder'
import '../style/Recorder.css'

export default function Recorder() {
  const { status, startRecording, stopRecording, mediaBlobUrl } =
    useReactMediaRecorder({ audio: true })
  const [saving, setSaving] = useState(false)

  const save = async () => {
    setSaving(true)
    const blob = await fetch(mediaBlobUrl).then(r => r.blob())
    const fd = new FormData()

    fd.append('audio', blob, 'recording.wav')

    const token = localStorage.getItem('token')
    const res = await fetch(
      `${import.meta.env.VITE_API_SOURCE}/api/transcripts/upload`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: fd,
      }
    )

    if (!res.ok) {
      console.error('Upload failed', await res.text())
    } else {
      const { transcription } = await res.json()
      console.log('Transcription result:', transcription)
    }

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
