# SnapGrab: Full-Stack Media Processing Engine 🚀

![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![Java](https://img.shields.io/badge/java-%23ED8B00.svg?style=for-the-badge&logo=openjdk&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-6DB33F?style=for-the-badge&logo=spring-boot&logoColor=white)
![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)
![Python](https://img.shields.io/badge/python-3670A0?style=for-the-badge&logo=python&logoColor=ffdd54)
![C#](https://img.shields.io/badge/c%23-%23239120.svg?style=for-the-badge&logo=c-sharp&logoColor=white)

SnapGrab is an enterprise-grade, asynchronous video processing and extraction application. It features a decoupled React (Vite) Single Page Application (SPA) frontend that interfaces with a robust backend API to safely execute, multiplex, and stream native OS binaries (`yt-dlp` and `ffmpeg`).

This project was built to demonstrate architectural understanding, native binary integration, and cross-language benchmarking.

---

## 🏗️ System Architecture

*   **Frontend (React + Vite):** A responsive, minimalistic UI that proxies API requests. It handles dynamic state management for format selection, audio toggling, and file size calculation (MB).
*   **Backend (Java Spring Boot Core):** The primary REST API engine. It utilizes asynchronous Java `ProcessBuilder` classes to securely execute shell commands, read standardized `stdout/stderr` streams, and safely pipe heavy multiplexed video chunks back to the client.
*   **Microservice Benchmarking:** The backend processing logic was migrated and benchmarked against two alternative architectures:
    *   **Python (FastAPI):** Leveraging native `asyncio.to_thread` for non-blocking extraction.
    *   **C# (.NET 8 Web API):** Highly optimized `System.Diagnostics.Process` multiplexing for reduced memory consumption overhead.
*   **Native OS Integration:** Integrates directly with `yt-dlp` for metadata extraction and `ffmpeg` for high-resolution video/audio merging. Includes custom bot-bypassing mechanisms via automated browser cookie injection.
*   **Progressive Web App (PWA) Routing:** Includes a custom Node.js network utility script (`generate-qr.js`) that dynamically resolves active IPv4 addresses and generates terminal-based QR codes for rapid mobile testing over local LAN.

## ⚙️ Prerequisites

To run this project locally, ensure you have the following installed:

*   **Node.js** (v18+)
*   **Java Development Kit (JDK)** (v17+) / Maven
*   *Optional benchmarking tools:* Python 3.11+, .NET 8.0 SDK
*   **Native Binaries:** `yt-dlp.exe` and `ffmpeg.exe` (must be placed in `backend/tools/`)

## 🚀 Quick Start (Java Edition)

### 1. Start the Java Spring Boot API
Navigate to the backend directory and run the Maven wrapper:
```bash
cd backend
./mvnw spring-boot:run
```
*The API will start listening on `http://localhost:8081`*

### 2. Start the React Frontend
Open a new terminal, navigate to the frontend directory, install dependencies, and start the Vite server:
```bash
cd frontend
npm install
npm run dev -- --host
```
*The UI will be accessible at `http://localhost:5173`*

### 3. Rapid Mobile Testing
To instantly load the app on your physical mobile device over your local Wi-Fi, run the custom routing script:
```bash
cd frontend
npm run qr
```
*Scan the generated QR code in your terminal with your phone's camera.*

---
*Built with ❤️ to demonstrate modern full-stack engineering and multi-language system design.*
