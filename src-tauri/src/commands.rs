use std::io::{BufRead, BufReader};
use std::process::{Command, Stdio};
use tauri::async_runtime::spawn;
use tauri::Emitter;
use tauri::Window;

#[tauri::command]
pub fn convert_to_webp_with_progress(
    input_path: String,
    output_path: String,
    quality: u8,
    lossless: bool,
    window: Window,
) -> Result<(), String> {
    spawn(async move {
        let mut args = vec![
            "-q".to_string(),
            quality.to_string(),
            input_path.clone(),
            "-o".to_string(),
            output_path.clone(),
            "-progress".to_string(),
        ];

        if lossless {
            args.push("-lossless".to_string());
        }

        let mut process = Command::new("cwebp")
            .args(&args)
            .stdout(Stdio::piped())
            .stderr(Stdio::piped())
            .spawn()
            .map_err(|e| format!("Failed to start cwebp: {}", e))
            .unwrap();

        if let Some(stderr) = process.stderr.take() {
            let reader = BufReader::new(stderr);

            for line in reader.lines() {
                if let Ok(line) = line {
                    if line.contains('%') {
                        // Extract progress percentage from the line
                        if let Some(progress) = line.trim().split_whitespace().last() {
                            if let Ok(progress) = progress.trim_end_matches('%').parse::<u8>() {
                                // Emit progress to the frontend
                                window
                                    .emit("convert-progress", progress)
                                    .unwrap_or_else(|err| {
                                        eprintln!("Failed to emit progress: {}", err)
                                    });
                            }
                        }
                    }
                }
            }
        }

        let status = process
            .wait()
            .map_err(|e| format!("Failed to wait for cwebp: {}", e))
            .unwrap();

        if status.success() {
            window
                .emit("convert-complete", "Conversion complete")
                .unwrap();
        } else {
            window.emit("convert-error", "Conversion failed").unwrap();
        }
    });

    Ok(())
}
