import { checkFileSize } from "./fileUtils";
import { supabase } from "./supabase";

export const uploadMediaToSupabase = async (
  uri: string,
  type: "image" | "video"
) => {
  try {
    console.log(`Starting upload for ${type}:`, uri);

    // Check final file size before upload
    const fileSize = await checkFileSize(uri);
    const fileSizeMB = fileSize / (1024 * 1024);

    if (fileSizeMB > 50) {
      throw new Error(
        `File size (${fileSizeMB.toFixed(1)}MB) exceeds 50MB limit`
      );
    }

    // Determine file extension based on type and platform
    const timestamp = Date.now();
    let filename: string;
    let contentType: string;

    if (type === "image") {
      filename = `${timestamp}-image.jpg`;
      contentType = "image/jpeg";
    } else {
      // For videos, try to preserve original format or default to mp4
      const extension = uri.split(".").pop()?.toLowerCase() || "mp4";
      filename = `${timestamp}-video.${extension}`;

      // Set appropriate content type based on extension
      switch (extension) {
        case "mov":
        case "quicktime":
          contentType = "video/quicktime";
          break;
        case "mp4":
          contentType = "video/mp4";
          break;
        case "avi":
          contentType = "video/avi";
          break;
        default:
          contentType = "video/mp4";
      }
    }

    const filePath = `pets/${filename}`;

    console.log(`Uploading ${type}: ${fileSizeMB.toFixed(2)}MB as ${filename}`);
    console.log(`Content type: ${contentType}`);

    // Better file handling for React Native
    let fileBlob: Blob;

    if (
      uri.startsWith("file://") ||
      uri.startsWith("content://") ||
      uri.startsWith("ph://")
    ) {
      // For local files (React Native), use FormData approach
      const formData = new FormData();

      // Create file object for React Native
      const file = {
        uri: uri,
        type: contentType,
        name: filename,
      } as any;

      formData.append("file", file);

      // Upload using FormData
      const { data, error } = await supabase.storage
        .from("pet-media")
        .upload(filePath, formData, {
          contentType: contentType,
          upsert: false,
        });

      if (error) {
        throw error;
      }
    } else {
      // For web URLs, use fetch approach
      const response = await fetch(uri);
      if (!response.ok) {
        throw new Error(`Failed to fetch file: ${response.statusText}`);
      }

      fileBlob = await response.blob();
      console.log(`Blob size: ${fileBlob.size} bytes, type: ${fileBlob.type}`);

      if (fileBlob.size === 0) {
        throw new Error("File appears to be empty or corrupted");
      }

      const { data, error } = await supabase.storage
        .from("pet-media")
        .upload(filePath, fileBlob, {
          contentType: contentType,
          upsert: false,
        });

      if (error) {
        throw error;
      }
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from("pet-media").getPublicUrl(filePath);

    console.log("Upload successful:", publicUrl);

    // Verify the upload by checking file info
    const { data: fileInfo, error: infoError } = await supabase.storage
      .from("pet-media")
      .list("pets", {
        search: filename,
      });

    if (!infoError && fileInfo && fileInfo.length > 0) {
      console.log(
        `File uploaded successfully: ${fileInfo[0].name}, Size: ${
          fileInfo[0].metadata?.size || "unknown"
        } bytes`
      );
    }

    return publicUrl;
  } catch (error) {
    console.error("Upload error:", error);
    throw error;
  }
};
