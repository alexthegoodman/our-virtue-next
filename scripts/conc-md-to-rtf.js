const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

// Check if pandoc is installed
function checkPandocInstalled() {
  try {
    execSync("pandoc --version", { stdio: "ignore" });
    return true;
  } catch (error) {
    return false;
  }
}

// Function to recursively find all markdown files
function findMarkdownFiles(dirPath, arrayOfFiles = []) {
  const files = fs.readdirSync(dirPath);

  files.forEach((file) => {
    const filePath = path.join(dirPath, file);
    if (fs.statSync(filePath).isDirectory()) {
      arrayOfFiles = findMarkdownFiles(filePath, arrayOfFiles);
    } else if (path.extname(file).toLowerCase() === ".mdx") {
      arrayOfFiles.push(filePath);
    }
  });

  return arrayOfFiles;
}

// Function to concatenate markdown files and convert to RTF
function concatAndConvertToRTF(rootDir, outputFile) {
  if (!checkPandocInstalled()) {
    console.error(
      "Error: Pandoc is not installed. Please install pandoc first."
    );
    console.log("You can download it from: https://pandoc.org/installing.html");
    process.exit(1);
  }

  // Find all markdown files
  console.log("Finding markdown files...");
  const markdownFiles = findMarkdownFiles(rootDir);

  if (markdownFiles.length === 0) {
    console.error("No markdown files found in the specified directory.");
    process.exit(1);
  }

  console.log(`Found ${markdownFiles.length} markdown files.`);

  // Create a temporary concatenated markdown file
  const tempFile = path.join(process.cwd(), "temp_concatenated.md");
  let concatenatedContent = "";

  // Sort files to ensure consistent order
  markdownFiles.sort();

  markdownFiles.forEach((file) => {
    console.log(`Processing: ${file}`);
    const content = fs.readFileSync(file, "utf8");
    concatenatedContent += `\n\n## File: ${file}\n\n${content}`;
  });

  // Write concatenated content to temporary file
  fs.writeFileSync(tempFile, concatenatedContent);
  console.log("All files concatenated.");

  // Convert to RTF using pandoc with options for cleaner RTF
  console.log("Converting to RTF...");
  try {
    // Use a simple template and minimal options to create cleaner RTF
    execSync(
      `pandoc "${tempFile}" -o "${outputFile}" --standalone --from markdown --to rtf --wrap=none`
    );
    console.log(`Conversion complete. Output saved to: ${outputFile}`);
  } catch (error) {
    console.error("Error during conversion:", error.message);

    // Fallback method using HTML as intermediate format
    console.log("Trying alternative conversion method...");
    try {
      const tempHtmlFile = path.join(process.cwd(), "temp_concatenated.html");
      execSync(
        `pandoc "${tempFile}" -o "${tempHtmlFile}" --standalone --from markdown --to html`
      );
      execSync(
        `pandoc "${tempHtmlFile}" -o "${outputFile}" --standalone --from html --to rtf`
      );
      fs.unlinkSync(tempHtmlFile);
      console.log(
        `Alternative conversion complete. Output saved to: ${outputFile}`
      );
    } catch (altError) {
      console.error("Alternative conversion also failed:", altError.message);
    }
  }

  // Clean up the temporary file
  fs.unlinkSync(tempFile);
  console.log("Temporary file cleaned up.");
}

// Main execution
function main() {
  const args = process.argv.slice(2);

  if (args.length !== 2) {
    console.log("Usage: node script.js <input_directory> <output_rtf_file>");
    console.log("Example: node script.js ./my_documents output.rtf");
    process.exit(1);
  }

  const inputDir = args[0];
  const outputFile = args[1];

  if (!fs.existsSync(inputDir)) {
    console.error(`Error: Directory "${inputDir}" does not exist.`);
    process.exit(1);
  }

  concatAndConvertToRTF(inputDir, outputFile);
}

main();
