package com.videodownloader.service;

import org.springframework.stereotype.Service;
import java.io.*;
import java.nio.file.*;

@Service
public class VideoProcessService {

    // Dynamically resolve tools directory relative to the Java execution root
    private final String TOOLS_DIR = Paths.get(System.getProperty("user.dir"), "tools").toAbsolutePath().toString();
    private final String YT_DLP_PATH = Paths.get(TOOLS_DIR, "yt-dlp.exe").toString();

    public String getVideoInfo(String url) throws Exception {
        ProcessBuilder pb = new ProcessBuilder(
                YT_DLP_PATH,
                "-j",
                "--cookies-from-browser", "chrome",
                "--no-playlist",
                "--no-warnings",
                "--quiet",
                url);
        Process p = pb.start();

        StringBuilder output = new StringBuilder();
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(p.getInputStream()))) {
            String line;
            while ((line = reader.readLine()) != null) {
                output.append(line).append("\n");
            }
        }
        int exitCode = p.waitFor();
        if (exitCode != 0) {
            throw new RuntimeException("Failed to extract video info: " + output);
        }
        return output.toString();
    }

    public File downloadVideo(String url, String formatId) throws Exception {
        File tempDir = Files.createTempDirectory("video-dl").toFile();
        File outputFile = new File(tempDir, "output.mp4");

        ProcessBuilder pb = new ProcessBuilder(
                YT_DLP_PATH,
                "-f", formatId,
                "--cookies-from-browser", "chrome",
                "--ffmpeg-location", TOOLS_DIR,
                "--merge-output-format", "mp4",
                "--concurrent-fragments", "10",
                "--http-chunk-size", "10M",
                "-o", outputFile.getAbsolutePath(),
                url);
        pb.redirectErrorStream(true);
        Process p = pb.start();

        try (BufferedReader reader = new BufferedReader(new InputStreamReader(p.getInputStream()))) {
            String line;
            while ((line = reader.readLine()) != null) {
                System.out.println("yt-dlp: " + line);
            }
        }

        int exitCode = p.waitFor();
        if (exitCode != 0) {
            throw new RuntimeException("Download process failed.");
        }

        return outputFile;
    }
}
