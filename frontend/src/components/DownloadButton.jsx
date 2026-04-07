import { useState } from 'react'

export default function DownloadButton({ url, format, type = 'video' }) {
    const [downloading, setDownloading] = useState(false)
    const [progress, setProgress] = useState(0)

    const handleDownload = () => {
        setDownloading(true)
        setProgress(0)

        // Simulate progress while backend downloads and processes (actual streaming takes long)
        const interval = setInterval(() => {
            setProgress(p => {
                if (p >= 90) {
                    clearInterval(interval)
                    return 90
                }
                return p + 5
            })
        }, 1000)

        // Direct browser navigation for streaming the download
        window.location.href = `/api/video/download?url=${encodeURIComponent(url)}&format=${encodeURIComponent(format)}&type=${encodeURIComponent(type)}`

        // Reset after some time assumed for download start
        setTimeout(() => {
            clearInterval(interval)
            setDownloading(false)
            setProgress(0)
        }, 8000)
    }

    return (
        <div className="download-action">
            <button
                className={`download-btn ${downloading ? 'downloading' : ''}`}
                onClick={handleDownload}
                disabled={downloading}
            >
                {downloading ? `Processing... ${progress}%` : 'Download File'}
                {!downloading && <svg className="download-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 16L7 11L8.4 9.55L11 12.15V4H13V12.15L15.6 9.55L17 11L12 16ZM6 20C5.45 20 4.97917 19.8042 4.5875 19.4125C4.19583 19.0208 4 18.55 4 18V15H6V18H18V15H20V18C20 18.55 19.8042 19.0208 19.4125 19.4125C19.0208 19.8042 18.55 20 18 20H6Z" fill="white" /></svg>}
            </button>
        </div>
    )
}
