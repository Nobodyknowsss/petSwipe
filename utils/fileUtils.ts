import * as ImageManipulator from "expo-image-manipulator";

export const checkFileSize = async (uri: string): Promise<number> => {
  try {
    const response = await fetch(uri);
    const blob = await response.blob();
    return blob.size;
  } catch (error) {
    console.error("Error checking file size:", error);
    return 0;
  }
};

export const compressImage = async (uri: string) => {
  try {
    // First check file size
    const fileSize = await checkFileSize(uri);
    const fileSizeMB = fileSize / (1024 * 1024);

    console.log(`Original image size: ${fileSizeMB.toFixed(2)}MB`);

    // Adjust compression based on file size
    let compressionQuality = 0.8;
    let maxWidth = 1080;

    if (fileSizeMB > 30) {
      compressionQuality = 0.6;
      maxWidth = 800;
    } else if (fileSizeMB > 20) {
      compressionQuality = 0.7;
      maxWidth = 900;
    }

    const manipulatedImage = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: maxWidth } }], // Dynamic resize based on file size
      {
        compress: compressionQuality,
        format: ImageManipulator.SaveFormat.JPEG,
      }
    );

    // Check compressed size
    const compressedSize = await checkFileSize(manipulatedImage.uri);
    const compressedSizeMB = compressedSize / (1024 * 1024);
    console.log(`Compressed image size: ${compressedSizeMB.toFixed(2)}MB`);

    return manipulatedImage.uri;
  } catch (error) {
    console.error("Error compressing image:", error);
    return uri; // Return original if compression fails
  }
};
