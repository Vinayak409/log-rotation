import * as fs from "fs";
import * as path from "path";
import moment from "moment";
import _ from "lodash";
import cliProgress from "cli-progress";

const PATH_TO_LOG_FOLDER = "/home/vinayak/workspace/test-logs"; // Replace with your log folder path

function deleteLogFilesOlderThanThirtyDays() {
  if (!fs.existsSync(PATH_TO_LOG_FOLDER)) {
    console.error("Directory does not exist:", PATH_TO_LOG_FOLDER);
    return;
  }

  const files = fs.readdirSync(PATH_TO_LOG_FOLDER);
  const totalFiles = files.length;

  if (totalFiles === 0) {
    console.log("No files found in the directory.");
    return;
  }

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

  // Start the progress bar
  progressBar.start(totalFiles, 0);

  // Prepare a list of deleted files
  const deletedFiles = [];

  // Iterate over files
  _.forEach(files, (file, index) => {
    const filePath = path.join(PATH_TO_LOG_FOLDER, file);

    try {
      const stats = fs.statSync(filePath);

      // Check if it's a file and older than 30 days
      if (
        stats.isFile() &&
        moment(stats.mtime).isBefore(moment().subtract(30, "days"))
      ) {
        fs.unlinkSync(filePath);
        deletedFiles.push(file); // Add the deleted file to the list
      }
    } catch (error) {
      console.error(`Error processing file: ${file}`, error);
    }

    // Update the progress bar
    progressBar.update(index + 1);
  });

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
