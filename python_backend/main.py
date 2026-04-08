import os
import tempfile
import asyncio
from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
import yt_dlp

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dynamically resolve absolute path to parent directory for tool access
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FFMPEG_LOCATION = os.path.join(BASE_DIR, "backend", "tools")

@app.get("/api/video/info")
async def get_video_info(url: str):
    ydl_opts = {
        'cookiefile': 'cookies.txt', # Bypasses if cookies provided
        'quiet': True,
        'no_warnings': True,
        'extract_flat': False,
    }
    
    # Try using browser cookies for Xiaohongshu and similar bot-protected sites
    if "xhslink" in url or "xiaohongshu" in url:
        ydl_opts['cookiesfrombrowser'] = ('chrome', )

    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=False)
            return info
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/api/video/download")
async def download_video(url: str, format: str):
    temp_dir = tempfile.mkdtemp()
    output_template = os.path.join(temp_dir, 'output.%(ext)s')
    
    ydl_opts = {
        'format': format,
        'outtmpl': output_template,
        'ffmpeg_location': FFMPEG_LOCATION,
        'merge_output_format': 'mp4',
        'concurrent_fragment_downloads': 10,
        'http_chunk_size': 10485760, # 10M
        'quiet': False
    }

    if "xhslink" in url or "xiaohongshu" in url:
        ydl_opts['cookiesfrombrowser'] = ('chrome', )

    try:
        # Run synchronous yt-dlp in a thread to prevent blocking async FastAPI loop
        def download_sync():
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                ydl.download([url])
                
        await asyncio.to_thread(download_sync)
        
        # Output is usually output.mp4 due to merge
        final_file = os.path.join(temp_dir, 'output.mp4')
        if not os.path.exists(final_file):
            # Fallback if merger didn't output mp4
            files = os.listdir(temp_dir)
            if files:
                final_file = os.path.join(temp_dir, files[0])
            else:
                raise Exception("Download failed, no file produced.")

        return FileResponse(
            path=final_file, 
            filename="video.mp4", 
            media_type="video/mp4"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5000)
