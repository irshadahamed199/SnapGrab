using Microsoft.AspNetCore.Mvc;
using VideoDownloader.NET.Services;

namespace VideoDownloader.NET.Controllers;

[ApiController]
[Route("api/video")]
public class VideoController : ControllerBase
{
    private readonly VideoProcessService _videoProcessService;

    public VideoController(VideoProcessService videoProcessService)
    {
        _videoProcessService = videoProcessService;
    }

    [HttpGet("info")]
    public async Task<IActionResult> GetVideoInfo([FromQuery] string url)
    {
        try
        {
            var info = await _videoProcessService.GetVideoInfoAsync(url);
            return Content(info, "application/json");
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpGet("download")]
    public async Task<IActionResult> DownloadVideo([FromQuery] string url, [FromQuery] string format, [FromQuery] string type = "video")
    {
        try
        {
            var filePath = await _videoProcessService.DownloadVideoAsync(url, format, type);
            var contentType = type == "audio" ? "audio/mp4" : "video/mp4";
            var fileName = type == "audio" ? "audio.m4a" : "video.mp4";
            
            // Delete file after download completes using FileStream
            var fileStream = new FileStream(filePath, FileMode.Open, FileAccess.Read, FileShare.Read, 4096, FileOptions.DeleteOnClose);
            return File(fileStream, contentType, fileName, enableRangeProcessing: true);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = ex.Message });
        }
    }
}
