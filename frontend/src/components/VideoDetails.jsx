import { useState, useMemo, useEffect } from 'react'
import DownloadButton from './DownloadButton'

export default function VideoDetails({ info, url }) {
    const [selectedVideoId, setSelectedVideoId] = useState('')
    const [downloadType, setDownloadType] = useState('video_audio') // 'video_audio', 'video_only', 'audio_only'

    const { videoFormats, bestAudioSize } = useMemo(() => {
        if (!info.formats) return { videoFormats: [], bestAudioSize: 0 }

        // Find the approx size of the best audio stream
        const audioFormats = info.formats.filter(f => f.acodec !== 'none' && f.vcodec === 'none' && f.ext === 'm4a')
        let audioSize = 0
        if (audioFormats.length > 0) {
            const bestAudio = audioFormats.sort((a, b) => (b.abr || 0) - (a.abr || 0))[0]
            audioSize = (bestAudio.filesize || bestAudio.filesize_approx || 0) / (1024 * 1024)
        }

        const uniqueResolutions = new Map()
        const validFormats = info.formats.filter(f => f.vcodec !== 'none' && f.ext === 'mp4' && f.height)

        validFormats.forEach(f => {
            if (!uniqueResolutions.has(f.height) || uniqueResolutions.get(f.height).tbr < f.tbr) {
                uniqueResolutions.set(f.height, f)
            }
        })

        const sorted = Array.from(uniqueResolutions.values()).sort((a, b) => b.height - a.height)

        const formats = sorted.map(f => {
            const vidSize = (f.filesize || f.filesize_approx || 0) / (1024 * 1024)
            return {
                id: f.format_id,
                height: f.height,
                videoSize: vidSize > 0 ? vidSize.toFixed(1) : 'Unknown',
                totalSize: vidSize > 0 ? (vidSize + audioSize).toFixed(1) : 'Unknown'
            }
        })

        return { videoFormats: formats, bestAudioSize: audioSize }
    }, [info.formats])

    // Auto-select the first (highest quality) format
    useEffect(() => {
        if (videoFormats.length > 0 && !selectedVideoId) {
            setSelectedVideoId(videoFormats[0].id)
        }
    }, [videoFormats, selectedVideoId])

    // Construct the yt-dlp format parameter securely
    const formatString = downloadType === 'audio_only' 
        ? 'bestaudio[ext=m4a]/bestaudio/best'
        : selectedVideoId
            ? (downloadType === 'video_only' ? selectedVideoId : `${selectedVideoId}+bestaudio[ext=m4a]`)
            : 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best'

    return (
        <div className="video-details glass-panel fade-in">
            <div className="video-thumbnail-wrapper">
                <img src={info.thumbnail} alt={info.title} className="thumbnail" />
                <div className="duration-badge">{new Date(info.duration * 1000).toISOString().substring(11, 19)}</div>
            </div>
            <div className="video-info">
                <h2 className="video-title">{info.title}</h2>
                <p className="video-uploader">By {info.uploader}</p>

                <div className="format-selection">
                    <label>Download Mode:</label>
                    <div className="mode-toggle-group">
                        <button type="button" className={`mode-btn ${downloadType === 'video_audio' ? 'active' : ''}`} onClick={() => setDownloadType('video_audio')}>🎥 Video + Audio</button>
                        <button type="button" className={`mode-btn ${downloadType === 'video_only' ? 'active' : ''}`} onClick={() => setDownloadType('video_only')}>🔇 Video (Mute)</button>
                        <button type="button" className={`mode-btn ${downloadType === 'audio_only' ? 'active' : ''}`} onClick={() => setDownloadType('audio_only')}>🎵 Audio Only</button>
                    </div>

                    {downloadType !== 'audio_only' && (
                        <>
                            <label htmlFor="format-select">Select Quality:</label>
                            <select
                                id="format-select"
                                value={selectedVideoId}
                                onChange={(e) => setSelectedVideoId(e.target.value)}
                                className="format-dropdown"
                            >
                                {videoFormats.map((f) => {
                                    const sizeLabel = downloadType === 'video_only' ? f.videoSize : f.totalSize
                                    return (
                                        <option key={f.id} value={f.id}>
                                            {f.height}p — {sizeLabel} MB
                                        </option>
                                    )
                                })}
                            </select>
                        </>
                    )}

                    {downloadType === 'audio_only' && (
                         <div className="audio-info panel-info">
                             <p>High Quality Audio Extraction (M4A)</p>
                             <p>Approx Size: {bestAudioSize > 0 ? bestAudioSize.toFixed(1) : 'Unknown'} MB</p>
                         </div>
                    )}
                </div>

                <DownloadButton url={url} format={formatString} type={downloadType === 'audio_only' ? 'audio' : 'video'} />
            </div>
        </div>
    )
}
