# Tauri Image Converter to WebP (macOS)

A lightweight Tauri application designed to convert PNG, JPG, and other supported image formats into WebP format using the `cwebp` tool.

---

## Features

- Converts PNG, JPG, and supported formats to WebP.
- Minimalist, fast, and optimized for macOS.
- Built with [Tauri](https://tauri.app/), ensuring a small application size and high performance.

---
## Prerequisites
* Install cwebp Tool

 cwebp is required for WebP conversion. Install it using Homebrew:
```bash
brew install webp
```
## Setup and Run

1. Clone the Repository:
```bash
https://github.com/VihangaN/webpGui.git
```
2. Install Dependencies:
```bash
npm install
```
3. Run the Development Server:
```bash
npm run tauri dev
```
4. Build the Application: To create a standalone macOS application:
```bash
npm run tauri build
```
The app will be available in the **src-tauri/target/release/bundle/macos** directory.

## Notes
* Ensure cwebp is accessible via the command line by verifying its installation
```bash
cwebp -version
```