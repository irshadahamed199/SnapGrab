using System.Diagnostics;
using System.Text;

namespace VideoDownloader.NET.Services;

public class VideoProcessService
{
    private readonly string _ytDlpPath;
    private readonly string _ffmpegPath;

    public VideoProcessService()
    {
        // Dynamically resolve the absolute path to the parent directory for tool access
        var projectDir = Directory.GetCurrentDirectory();
        var rootDir = Directory.GetParent(projectDir)?.FullName ?? projectDir;
        
        _ffmpegPath = Path.Combine(rootDir, "backend", "tools");
        _ytDlpPath = Path.Combine(_ffmpegPath, "yt-dlp.exe");
    }

    public async Task<string> GetVideoInfoAsync(string url)
    {
        var runArgs = new List<string> { "-j", "--no-playlist", "--no-warnings", "--quiet" };
        if (url.Contains("xhslink") || url.Contains("xiaohongshu"))
        {
            runArgs.Add("--cookies-from-browser");
            runArgs.Add("chrome");
        }
        runArgs.Add(url);

        var processInfo = new ProcessStartInfo
        {
            FileName = _ytDlpPath,
            Arguments = string.Join(" ", runArgs),
            RedirectStandardOutput = true,
            RedirectStandardError = true,
            UseShellExecute = false,
            CreateNoWindow = true
        };

        using var process = Process.Start(processInfo);
        if (process == null) throw new Exception("Failed to start yt-dlp process.");

        var output = await process.StandardOutput.ReadToEndAsync();
        var error = await process.StandardError.ReadToEndAsync();
        await process.WaitForExitAsync();

        if (process.ExitCode != 0)
        {
            throw new Exception($"Failed to extract video info: {error}");
        }

        return output;
    }

    public async Task<string> DownloadVideoAsync(string url, string formatId, string type = "video")
    {
        var tempDir = Path.Combine(Path.GetTempPath(), "video-dl-" + Guid.NewGuid());
        Directory.CreateDirectory(tempDir);
        var outputFile = Path.Combine(tempDir, type == "audio" ? "output.m4a" : "output.mp4");

        var runArgs = new List<string>
        {
            "-f", formatId,
            "--ffmpeg-location", _ffmpegPath,
            "--concurrent-fragments", "10",
            "--http-chunk-size", "10M"
        };

        if (type != "audio")
        {
            runArgs.Add("--merge-output-format");
            runArgs.Add("mp4");
        }
        
        if (url.Contains("xhslink") || url.Contains("xiaohongshu"))
        {
            runArgs.Add("--cookies-from-browser");
            runArgs.Add("chrome");
        }
        
        runArgs.Add("-o");
        runArgs.Add(outputFile);
        runArgs.Add(url);

        var processInfo = new ProcessStartInfo
        {
            FileName = _ytDlpPath,
            Arguments = string.Join(" ", runArgs),
            RedirectStandardOutput = true,
            RedirectStandardError = true,
            UseShellExecute = false,
            CreateNoWindow = true
        };

        using var process = Process.Start(processInfo);
        if (process == null) throw new Exception("Failed to start yt-dlp process.");

        process.OutputDataReceived += (s, e) => { if (e.Data != null) Console.WriteLine($"yt-dlp: {e.Data}"); };
        process.ErrorDataReceived += (s, e) => { if (e.Data != null) Console.WriteLine($"yt-dlp err: {e.Data}"); };
        
        process.BeginOutputReadLine();
        process.BeginErrorReadLine();

        await process.WaitForExitAsync();

        if (process.ExitCode != 0)
        {
            throw new Exception("Download process failed.");
        }

        return outputFile;
    }
}
