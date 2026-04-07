package com.videodownloader.controller;

import com.videodownloader.service.VideoProcessService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.io.File;

@RestController
@RequestMapping("/api/video")
@CrossOrigin(origins = "*")
public class VideoController {

    @Autowired
    private VideoProcessService videoProcessService;

    @GetMapping(value = "/info", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> getInfo(@RequestParam String url) {
        try {
            String info = videoProcessService.getVideoInfo(url);
            return ResponseEntity.ok(info);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("{\"error\": \"" + e.getMessage() + "\"}");
        }
    }

    @GetMapping("/download")
    public ResponseEntity<Resource> downloadVideo(@RequestParam String url,
            @RequestParam(defaultValue = "bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best") String format) {
        try {
            File downloadedFile = videoProcessService.downloadVideo(url, format);
            Resource resource = new FileSystemResource(downloadedFile);

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"video.mp4\"")
                    .contentType(MediaType.APPLICATION_OCTET_STREAM)
                    .contentLength(downloadedFile.length())
                    .body(resource);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }
}
