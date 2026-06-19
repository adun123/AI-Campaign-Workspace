/**
 * Download an image/asset to the user's device.
 * Handles both same-origin and cross-origin URLs by fetching as blob first.
 */
export async function downloadFile(url: string, filename: string): Promise<void> {
  try {
    // Fetch the file as a blob (works for cross-origin URLs too)
    const response = await fetch(url);
    const blob = await response.blob();

    // Create a temporary object URL (same-origin, so download attribute works)
    const objectUrl = URL.createObjectURL(blob);

    // Create and trigger the download
    const a = document.createElement("a");
    a.href = objectUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    // Clean up the object URL
    URL.revokeObjectURL(objectUrl);
  } catch (error) {
    console.error("Download failed:", error);
    throw new Error("Failed to download file");
  }
}
