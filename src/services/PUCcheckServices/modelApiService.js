require('dotenv').config(); // Load environment variables
const FormData = require('form-data');
const fs = require('fs'); 
const fsp = require('fs').promises;
const path = require('path');
const os = require('os');
const axios = require('axios');
const unzipper = require('unzipper');
const { promisify } = require('util');
const stream = require('stream');
const pipeline = promisify(stream.pipeline);

/**
 * Processes an external image by sending it to an API, extracting a ZIP response, 
 * and returning the extracted files.
 * @param {Buffer} fileBuffer - The buffer of the image to process.
 * @param {string} fileMimeType - The MIME type of the image.
 * @returns {Promise<Array>} - An array of extracted files with their metadata.
 */
const processExternalImage = async (fileBuffer, fileMimeType) => {
    const URL = process.env.MODEL_URL; // Load API URL from .env
    if (!URL) {
        throw new Error("MODEL_URL is not defined in the .env file.");
    }

    let tempDir = null;
    let zipPath = null;

    try {
        console.log("Sending file to external API for processing...");

        // Create a form and append the image file
        const form = new FormData();
        form.append('file', fileBuffer, {
            filename: 'uploaded_image.jpg',
            contentType: fileMimeType,
        });

        // Send the file to the external API
        const response = await axios.post(URL, form, {
            headers: {
                ...form.getHeaders(),
            },
            responseType: 'arraybuffer',
        });

        // Ensure the API response is a ZIP file
        if (!response.headers["content-type"].includes("application/zip")) {
            throw new Error("Expected a ZIP file in the API response.");
        }

        // Create a temporary directory for extraction
        const timestamp = Date.now();
        tempDir = path.join(os.tmpdir(), `extract_${timestamp}`);
        await fsp.mkdir(tempDir, { recursive: true });

        // Write the ZIP file to the temporary directory
        zipPath = path.join(tempDir, 'response.zip');
        await fsp.writeFile(zipPath, response.data);

        // Create a directory for extracting the ZIP contents
        const extractPath = path.join(tempDir, 'extracted');
        await fsp.mkdir(extractPath, { recursive: true });

        // Extract the ZIP file to the extraction directory
        await new Promise((resolve, reject) => {
            fs.createReadStream(zipPath)
                .pipe(unzipper.Extract({ path: extractPath }))
                .on('close', resolve)
                .on('error', reject);
        });

        // Pause briefly to ensure extraction is complete
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Read and process the extracted files
        const extractedFiles = [];
        const files = await fsp.readdir(extractPath);

        for (const file of files) {
            // Skip metadata and hidden files
            if (file.startsWith('._') || file.startsWith('.')) continue;

            const filePath = path.join(extractPath, file);
            const stats = await fsp.stat(filePath);

            // Collect file details if it's a valid file
            if (stats.isFile()) {
                const buffer = await fsp.readFile(filePath);
                const ext = path.extname(file).toLowerCase().slice(1);

                extractedFiles.push({
                    filename: file,
                    buffer: buffer,
                    mimeType: `image/${ext}`,
                });
            }
        }

        // Ensure at least one valid file was extracted
        if (extractedFiles.length === 0) {
            throw new Error('No valid files found in ZIP');
        }

        return extractedFiles;

    } catch (error) {
        // Handle errors and log API error details if available
        if (error.response && error.response.data) {
            const errorData = Buffer.from(error.response.data);
            const errorString = errorData.toString();
            try {
                const errorJson = JSON.parse(errorString);
                console.error("API error message:", errorJson);
            } catch (jsonError) {
                console.error("Raw error response:", errorString);
            }
        }
        throw error;
    } finally {
        // Clean up temporary files and directories
        if (tempDir) {
            try {
                await fsp.rm(tempDir, { recursive: true, force: true });
            } catch (cleanupError) {
                console.error('Error during cleanup');
            }
        }
    }
};

module.exports = { processExternalImage };
