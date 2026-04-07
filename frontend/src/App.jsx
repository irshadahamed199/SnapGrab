import { useState } from 'react'
import VideoDetails from './components/VideoDetails'
import './App.css'

function App() {
  const [url, setUrl] = useState('')
  const [videoInfo, setVideoInfo] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchVideoInfo = async (e) => {
    e.preventDefault()
    if (!url) return

    setLoading(true)
    setError(null)
    setVideoInfo(null)

    try {
      const response = await fetch(`/api/video/info?url=${encodeURIComponent(url)}`)
      if (!response.ok) {
        throw new Error('Failed to fetch video details')
      }
      const data = await response.json()
      setVideoInfo(data)
    } catch (err) {
      setError(err.message || 'Error occurred while verifying the video URL.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="app-container">
      <div className="background-shapes"></div>
      <header className="header">
        <h1>SnapGrab</h1>
      </header>

      <main className="main-content">
        <form className="search-box glass-panel" onSubmit={fetchVideoInfo}>
          <input
            type="url"
            placeholder="Paste your video link here (YouTube, Twitter, TikTok, etc)..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            required
          />
          <button type="submit" disabled={loading} className="analyze-btn" aria-label="Search">
            {loading ? <span className="loader"></span> : (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            )}
          </button>
        </form>

        {error && <div className="error-message glass-panel fade-in">{error}</div>}

        {videoInfo && <VideoDetails info={videoInfo} url={url} />}
      </main>
    </div>
  )
}

export default App
