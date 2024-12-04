import * as fs from "fs";
import * as path from "path";
import moment from "moment";
import _ from "lodash";
import cliProgress from "cli-progress";

// Define an array of directories where log folders are located
const LOG_FOLDERS = [
  "/home/vinayak/workspace/test-logs",
  "/home/vinayak/workspace/other-logs", // Add additional directories here
  "/home/vinayak/workspace/more-logs", // Add additional directories here
];

// Helper function to get all files in a directory recursively
async function getFilesInDirectory(dir) {
  let files = [];
  try {
    const items = await fs.promises.readdir(dir, { withFileTypes: true });
    for (const item of items) {
      const fullPath = path.join(dir, item.name);
      if (item.isDirectory()) {
        const subFiles = await getFilesInDirectory(fullPath); // Recurse into subdirectories
        files = files.concat(subFiles);
      } else {
        files.push(fullPath);
      }
    }
  } catch (err) {
    console.error(`Error reading directory: ${dir}`, err);
  }
  return files;
}

// Helper function to delete old files asynchronously
async function deleteOldFiles(files, progressBar) {
  const deletedFiles = [];
  let filesProcessed = 0;

  for (const filePath of files) {
    try {
      const stats = await fs.promises.stat(filePath);

      // Check if the file is older than 30 days
      if (
        stats.isFile() &&
        moment(stats.mtime).isBefore(moment().subtract(30, "days"))
      ) {
        await fs.promises.unlink(filePath); // Delete the file asynchronously
        deletedFiles.push(filePath); // Add the deleted file to the list
      }
    } catch (error) {
      console.error(`Error processing file: ${filePath}`, error);
    }

    // Update the progress bar asynchronously
    filesProcessed++;
    progressBar.update(filesProcessed);
  }

  return deletedFiles;
}

// Main function to delete log files older than 30 days
async function deleteLogFilesOlderThanThirtyDays() {
  // Create a progress bar
  const progressBar = new cliProgress.SingleBar(
    {
      format:
        "Progress |{bar}| {percentage}% | {value}/{total} files processed",
      barCompleteChar: "\u2588",
      barIncompleteChar: "\u2591",
      hideCursor: true,
    },
    cliProgress.Presets.shades_classic
  );

  // Prepare a list to store deleted files
  const deletedFiles = [];
  let totalFiles = 0;

  // Collect all files from all directories
  for (const folder of LOG_FOLDERS) {
    if (fs.existsSync(folder)) {
      const files = await getFilesInDirectory(folder);
      totalFiles += files.length;
    }
  }

  if (totalFiles === 0) {
    console.log("No files found in the log directories.");
    return;
  }

  // Start the progress bar
  progressBar.start(totalFiles, 0);

  // Iterate over each log folder and delete old files
  for (const folder of LOG_FOLDERS) {
    if (fs.existsSync(folder)) {
      const files = await getFilesInDirectory(folder);
      const deleted = await deleteOldFiles(files, progressBar);
      deletedFiles.push(...deleted); // Add deleted files from each folder
    }
  }

  // Stop the progress bar
  progressBar.stop();

  // Log deleted files after the progress bar is complete
  if (deletedFiles.length > 0) {
    console.log("\nDeleted files:");
    deletedFiles.forEach((file) => {
      console.log(`Deleted: ${file}`);
    });
  } else {
    console.log("No files were deleted.");
  }

  console.log("File deletion process completed.");
}

deleteLogFilesOlderThanThirtyDays();
