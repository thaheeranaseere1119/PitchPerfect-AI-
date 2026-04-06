import { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'

const MAX_DURATION = 180 // 3 minutes in seconds
const API_URL = 'http://localhost:5001/analyze'
const ACCEPTED_FORMATS = ['audio/wav', 'audio/ogg', 'audio/mpeg', 'audio/mp3', 'audio/x-wav', 'audio/vnd.wav']
const ACCEPTED_EXTENSIONS = ['.wav', '.ogg', '.mp3']

function formatTime(seconds) {
  const m = String(Math.floor(seconds / 60)).padStart(2, '0')
  const s = String(seconds % 60).padStart(2, '0')
  return `${m}:${s}`
}

function formatFileSize(bytes) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

// ─── Upload Panel ────────────────────────────────────────────────────────────

function UploadPanel({ onSubmit }) {
  const [file, setFile] = useState(null)
  const [dragOver, setDragOver] = useState(false)
  const [error, setError] = useState(null)
  const inputRef = useRef(null)

  const validateFile = (f) => {
    if (!f) return false
    const ext = f.name.slice(f.name.lastIndexOf('.')).toLowerCase()
    if (!ACCEPTED_EXTENSIONS.includes(ext)) {
      setError(`Unsupported format. Please upload a WAV, OGG, or MP3 file.`)
      return false
    }
    if (f.size > 50 * 1024 * 1024) {
      setError('File is too large. Maximum size is 50 MB.')
      return false
    }
    setError(null)
    return true
  }

  const handleFile = (f) => {
    if (validateFile(f)) setFile(f)
  }

  const onDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    const f = e.dataTransfer.files[0]
    if (f) handleFile(f)
  }

  const onInputChange = (e) => {
    const f = e.target.files[0]
    if (f) handleFile(f)
  }

  const ext = file ? file.name.slice(file.name.lastIndexOf('.') + 1).toUpperCase() : null
  const extColors = { WAV: 'bg-brand-500/20 text-brand-300 border-brand-500/30', OGG: 'bg-purple-500/20 text-purple-300 border-purple-500/30', MP3: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' }
  const extColor = extColors[ext] || 'bg-white/10 text-slate-300 border-white/20'

  return (
    <div className="flex flex-col items-center gap-6 w-full">
      {/* Drop zone */}
      <div
        id="drop-zone"
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        onClick={() => !file && inputRef.current?.click()}
        className={`w-full rounded-2xl border-2 border-dashed transition-all duration-200 cursor-pointer
          ${file
            ? 'border-brand-500/50 bg-brand-500/5 cursor-default'
            : dragOver
              ? 'border-accent-400 bg-accent-500/10 scale-[1.01]'
              : 'border-white/15 bg-white/3 hover:border-white/30 hover:bg-white/5'
          }
        `}
      >
        {!file ? (
          <div className="flex flex-col items-center gap-4 py-12 px-6 text-center">
            {/* Upload icon */}
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-colors
              ${dragOver ? 'bg-accent-500/20 text-accent-300' : 'bg-white/5 text-slate-400'}`}
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"/>
              </svg>
            </div>

            <div>
              <p className="text-slate-200 font-semibold">
                {dragOver ? 'Drop your audio file here' : 'Drop your audio file here'}
              </p>
              <p className="text-slate-500 text-sm mt-1">or click to browse</p>
            </div>

            {/* Format badges */}
            <div className="flex gap-2">
              {[['WAV', 'bg-brand-500/20 text-brand-300 border-brand-500/30'],
                ['OGG', 'bg-purple-500/20 text-purple-300 border-purple-500/30'],
                ['MP3', 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30']
              ].map(([fmt, cls]) => (
                <span key={fmt} className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${cls}`}>{fmt}</span>
              ))}
            </div>

            <p className="text-slate-600 text-xs">Max file size: 50 MB</p>
          </div>
        ) : (
          /* File selected state */
          <div className="flex items-center gap-4 p-5">
            {/* File type badge */}
            <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-xs font-black border shrink-0 ${extColor}`}>
              {ext}
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-slate-200 font-medium text-sm truncate">{file.name}</p>
              <p className="text-slate-500 text-xs mt-0.5">{formatFileSize(file.size)}</p>
            </div>

            <button
              onClick={(e) => { e.stopPropagation(); setFile(null) }}
              className="shrink-0 w-8 h-8 rounded-lg bg-white/5 hover:bg-red-500/20 hover:text-red-400 text-slate-400 flex items-center justify-center transition-colors"
              id="remove-file-btn"
              title="Remove file"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept=".wav,.ogg,.mp3,audio/wav,audio/ogg,audio/mpeg"
        className="hidden"
        onChange={onInputChange}
        id="audio-file-input"
      />

      {error && (
        <div className="w-full p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm text-center">
          {error}
        </div>
      )}

      {/* Analyze button */}
      <button
        id="analyze-upload-btn"
        disabled={!file}
        onClick={() => file && onSubmit(file, file.name)}
        className={`w-full py-4 rounded-xl font-semibold text-base transition-all duration-200 flex items-center justify-center gap-2
          ${file
            ? 'bg-gradient-to-r from-brand-600 to-accent-600 hover:from-brand-500 hover:to-accent-500 text-white shadow-lg shadow-brand-900/40 active:scale-95'
            : 'bg-white/5 text-slate-600 cursor-not-allowed border border-white/5'
          }
        `}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round"
            d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"/>
        </svg>
        {file ? 'Analyze Audio' : 'Select a file first'}
      </button>
    </div>
  )
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function RecordingPage({ setResult }) {
  const [tab, setTab] = useState('record')   // 'record' | 'upload'
  const [status, setStatus] = useState('idle')
  const [elapsed, setElapsed] = useState(0)
  const [error, setError] = useState(null)
  const [submitError, setSubmitError] = useState(null)
  const [backendOnline, setBackendOnline] = useState(null) // null (checking) | true | false

  const mediaRecorderRef = useRef(null)
  const chunksRef = useRef([])
  const timerRef = useRef(null)
  const streamRef = useRef(null)

  const navigate = useNavigate()

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const res = await fetch('http://localhost:5001/health', { method: 'GET' })
        setBackendOnline(res.ok)
      } catch {
        setBackendOnline(false)
      }
    }

    checkHealth()
    const interval = setInterval(checkHealth, 5000)

    return () => {
      clearInterval(interval)
      clearInterval(timerRef.current)
      streamRef.current?.getTracks().forEach(t => t.stop())
    }
  }, [])

  // Switch tab → stop any active recording
  const switchTab = (t) => {
    if (status === 'recording' || status === 'paused') {
      streamRef.current?.getTracks().forEach(tr => tr.stop())
      mediaRecorderRef.current?.stop()
      clearInterval(timerRef.current)
      setStatus('idle')
      setElapsed(0)
    }
    setError(null)
    setTab(t)
  }

  const startTimer = () => {
    timerRef.current = setInterval(() => {
      setElapsed(prev => {
        if (prev >= MAX_DURATION - 1) { stopRecording(); return MAX_DURATION }
        return prev + 1
      })
    }, 1000)
  }

  const stopTimer = () => clearInterval(timerRef.current)

  const startRecording = async () => {
    setError(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      const mr = new MediaRecorder(stream)
      mediaRecorderRef.current = mr
      chunksRef.current = []
      mr.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data) }
      mr.start(200)
      setStatus('recording')
      startTimer()
    } catch {
      setError('Microphone access denied. Please allow microphone access and try again.')
    }
  }

  const pauseRecording = () => { mediaRecorderRef.current?.pause(); setStatus('paused'); stopTimer() }
  const resumeRecording = () => { mediaRecorderRef.current?.resume(); setStatus('recording'); startTimer() }

  const stopRecording = useCallback(() => {
    stopTimer()
    const mr = mediaRecorderRef.current
    if (!mr) return
    
    mr.onstop = async () => {
      streamRef.current?.getTracks().forEach(t => t.stop())
      
      // Convert blobs to an AudioBuffer, then to a WAV
      try {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        const arrayBuffer = await blob.arrayBuffer()
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)()
        const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer)
        
        // Simple WAV encoder
        const wavBlob = audioBufferToWav(audioBuffer)
        await submitAudio(wavBlob, 'recording.wav')
      } catch (err) {
        console.error('WAV conversion failed:', err)
        // Fallback to original blob if conversion fails
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        await submitAudio(blob, 'recording.webm')
      }
    }
    mr.stop()
    setStatus('done')
  }, [])

  // ─── WAV Encoder Helper ──────────────────────────────────────────────────
  function audioBufferToWav(buffer) {
    const numChannels = buffer.numberOfChannels
    const sampleRate = buffer.sampleRate
    const format = 1 // PCM
    const bitDepth = 16
    
    const bytesPerSample = bitDepth / 8
    const blockAlign = numChannels * bytesPerSample
    
    const bufferLength = buffer.length
    const dataSize = bufferLength * blockAlign
    const headerSize = 44
    const totalSize = headerSize + dataSize
    
    const arrayBuffer = new ArrayBuffer(totalSize)
    const view = new DataView(arrayBuffer)
    
    const writeString = (offset, string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i))
      }
    }
    
    writeString(0, 'RIFF')
    view.setUint32(4, totalSize - 8, true)
    writeString(8, 'WAVE')
    writeString(12, 'fmt ')
    view.setUint32(16, 16, true) // fmt chunk size
    view.setUint16(20, format, true)
    view.setUint16(22, numChannels, true)
    view.setUint32(24, sampleRate, true)
    view.setUint32(28, sampleRate * blockAlign, true)
    view.setUint16(32, blockAlign, true)
    view.setUint16(34, bitDepth, true)
    writeString(36, 'data')
    view.setUint32(40, dataSize, true)
    
    const offset = 44
    const channelData = []
    for (let i = 0; i < numChannels; i++) {
      channelData.push(buffer.getChannelData(i))
    }
    
    let index = 0
    for (let i = 0; i < bufferLength; i++) {
      for (let channel = 0; channel < numChannels; channel++) {
        const sample = Math.max(-1, Math.min(1, channelData[channel][i]))
        view.setInt16(offset + index, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true)
        index += bytesPerSample
      }
    }
    
    return new Blob([arrayBuffer], { type: 'audio/wav' })
  }

  const submitAudio = async (blob, filename) => {
    setSubmitError(null)
    navigate('/processing')
    const formData = new FormData()
    formData.append('audio', blob, filename)

    try {
      const res = await fetch(API_URL, { method: 'POST', body: formData })
      if (!res.ok) {
        const errText = await res.text()
        throw new Error(`Server error ${res.status}: ${errText}`)
      }
      const data = await res.json()

      try {
        const existing = JSON.parse(localStorage.getItem('pitchperfect_sessions') || '[]')
        const newSession = {
          ...data,
          date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
        }
        localStorage.setItem('pitchperfect_sessions', JSON.stringify([newSession, ...existing].slice(0, 10)))
      } catch {}

      setResult(data)
      navigate('/results')
    } catch (err) {
      console.error('Submit error:', err)
      const msg = err.message?.includes('ERR_CONNECTION_REFUSED') || err.message?.includes('Failed to fetch')
        ? 'Cannot connect to the backend. Please start the Flask server: python3 backend/app.py'
        : `Analysis failed: ${err.message}`
      navigate('/record')
      setSubmitError(msg)
      setStatus('idle')
    }
  }

  const isRecording = status === 'recording'
  const isPaused = status === 'paused'

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 pt-20 pb-12">
      <div className="fixed top-1/3 left-1/3 w-80 h-80 bg-brand-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-1/3 right-1/3 w-64 h-64 bg-accent-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center gap-8 w-full max-w-md">

        {/* Header */}
        <div className="text-center relative">
          <div className="flex items-center justify-center gap-2">
            <h1 className="text-3xl font-black gradient-text">Analyze Your Speech</h1>
            {/* Status Indicator */}
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/5 border border-white/10 ml-2">
              <div className={`w-2 h-2 rounded-full ${
                backendOnline === true ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)] animate-pulse' :
                backendOnline === false ? 'bg-red-500' : 'bg-slate-500'
              }`} />
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {backendOnline === true ? 'Server Online' : backendOnline === false ? 'Server Offline' : 'Connecting...'}
              </span>
            </div>
          </div>
          <p className="text-slate-400 mt-2 text-sm">Record live or upload an existing audio file</p>
        </div>

        {/* Tab Switcher */}
        <div className="w-full flex rounded-xl bg-white/5 border border-white/8 p-1 gap-1">
          <button
            id="tab-record"
            onClick={() => switchTab('record')}
            className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2
              ${tab === 'record'
                ? 'bg-gradient-to-r from-brand-600 to-accent-600 text-white shadow-lg'
                : 'text-slate-400 hover:text-slate-200'
              }`}
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 1a5 5 0 015 5v6a5 5 0 01-10 0V6a5 5 0 015-5z"/>
              <path d="M3.5 11a1 1 0 012 0 6.5 6.5 0 0013 0 1 1 0 012 0 8.5 8.5 0 01-8 8.47V22h3a1 1 0 010 2H8a1 1 0 010-2h3v-2.53A8.5 8.5 0 013.5 11z"/>
            </svg>
            Record
          </button>
          <button
            id="tab-upload"
            onClick={() => switchTab('upload')}
            className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2
              ${tab === 'upload'
                ? 'bg-gradient-to-r from-brand-600 to-accent-600 text-white shadow-lg'
                : 'text-slate-400 hover:text-slate-200'
              }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"/>
            </svg>
            Upload File
          </button>
        </div>

        {/* ── RECORD TAB ── */}
        {tab === 'record' && (
          <div className="flex flex-col items-center gap-8 w-full">
            {/* Mic visual */}
            <div className="relative flex items-center justify-center">
              {isRecording && [1, 2, 3].map(i => (
                <div key={i} className="absolute rounded-full border border-red-500/50 mic-ring"
                  style={{ width: `${120 + i * 40}px`, height: `${120 + i * 40}px`, animationDelay: `${i * 0.3}s`, color: 'rgb(239 68 68)' }} />
              ))}

              <button
                id="mic-button"
                onClick={status === 'idle' ? startRecording : isRecording ? pauseRecording : isPaused ? resumeRecording : undefined}
                className={`relative w-28 h-28 rounded-full flex items-center justify-center transition-all duration-300 shadow-2xl z-10
                  ${status === 'idle'
                    ? 'bg-gradient-to-br from-brand-500 to-accent-600 hover:scale-105 shadow-brand-900/50'
                    : isRecording
                      ? 'bg-gradient-to-br from-red-500 to-rose-600 scale-105 shadow-red-900/50'
                      : 'bg-gradient-to-br from-amber-500 to-orange-500 shadow-amber-900/50'
                  }`}
              >
                {status === 'idle' ? (
                  <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 1a5 5 0 015 5v6a5 5 0 01-10 0V6a5 5 0 015-5z"/>
                    <path d="M3.5 11a1 1 0 012 0 6.5 6.5 0 0013 0 1 1 0 012 0 8.5 8.5 0 01-8 8.47V22h3a1 1 0 010 2H8a1 1 0 010-2h3v-2.53A8.5 8.5 0 013.5 11z"/>
                  </svg>
                ) : isRecording ? (
                  <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6 4h4a1 1 0 011 1v14a1 1 0 01-1 1H6a1 1 0 01-1-1V5a1 1 0 011-1zm8 0h4a1 1 0 011 1v14a1 1 0 01-1 1h-4a1 1 0 01-1-1V5a1 1 0 011-1z"/>
                  </svg>
                ) : (
                  <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                )}
              </button>
            </div>

            {/* Waveform */}
            {isRecording && (
              <div className="flex items-center gap-1 h-10">
                {Array.from({ length: 9 }).map((_, i) => (
                  <div key={i} className="wave-bar bg-gradient-to-t from-brand-600 to-accent-400"
                    style={{ animationDelay: `${i * 0.12}s` }} />
                ))}
              </div>
            )}

            {/* Timer */}
            <div className="text-center">
              <div className={`text-6xl font-mono font-black tabular-nums transition-colors ${
                elapsed > 150 ? 'text-red-400' : elapsed > 90 ? 'text-amber-400' : 'text-white'
              }`}>
                {formatTime(elapsed)}
              </div>
              <div className="text-slate-500 text-sm mt-1">
                {status === 'idle' ? 'Press the mic to begin' :
                 isRecording ? 'Recording... press to pause' :
                 isPaused ? 'Paused — press mic to resume' : 'Processing...'}
              </div>
              <div className="w-64 h-1.5 bg-white/5 rounded-full mt-3 overflow-hidden mx-auto">
                <div className="h-full rounded-full bg-gradient-to-r from-brand-500 to-accent-500 transition-all duration-1000"
                  style={{ width: `${(elapsed / MAX_DURATION) * 100}%` }} />
              </div>
            </div>

            {/* Stop button */}
            {status !== 'idle' && (
              <button id="stop-btn" onClick={stopRecording} className="btn-danger flex items-center gap-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 6h12v12H6z"/>
                </svg>
                Stop & Analyze
              </button>
            )}

            {error && (
              <div className="w-full p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm text-center">
                {error}
              </div>
            )}
          </div>
        )}

        {/* ── UPLOAD TAB ── */}
        {tab === 'upload' && (
          <div className="w-full animate-fade-in">
            <UploadPanel onSubmit={submitAudio} />
          </div>
        )}

        {/* Submit error banner — shown after returning from /processing on failure */}
        {submitError && (
          <div className="w-full p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm text-center space-y-2">
            <div className="font-semibold">⚠️ Connection Error</div>
            <div className="text-red-400/90">{submitError}</div>
            <div className="text-slate-500 text-xs mt-1">
              Run: <code className="bg-black/30 px-1.5 py-0.5 rounded font-mono">python3 backend/app.py</code> in your terminal
            </div>
          </div>
        )}

      </div>
    </main>
  )
}
