import * as fs from "fs";
import * as path from "path";
import moment from "moment";
import _ from "lodash";

const PATH_TO_LOG_FOLDER = "/home/vinayak/workspace/test-logs"; // Replace with your log folder path

function deleteLogFilesOlderThanThirtyDays() {
  if (!fs.existsSync(PATH_TO_LOG_FOLDER)) {
    console.error("Directory does not exist:", PATH_TO_LOG_FOLDER);
    return;
  }

  const files = fs.readdirSync(PATH_TO_LOG_FOLDER);

  // Process files using lodash
  _.forEach(files, (file) => {
    const filePath = path.join(PATH_TO_LOG_FOLDER, file);

    try {
      const stats = fs.statSync(filePath);

      // Check if it's a file and older than 30 days
      if (
        stats.isFile() &&
        moment(stats.mtime).isBefore(moment().subtract(30, "days"))
      ) {
        fs.unlinkSync(filePath);
        console.log(`Deleted: ${file}`);
      }
    } catch (error) {
      console.error(`Error processing file: ${file}`, error);
    }
  });
}

deleteLogFilesOlderThanThirtyDays();
