const FormData = require('form-data');
const fs = require('fs'); // Regular fs for streams
const fsp = require('fs').promises; // Promise-based fs
const path = require('path');
const os = require('os');
const axios = require('axios');
const unzipper = require('unzipper');
const { promisify } = require('util');
const stream = require('stream');
const pipeline = promisify(stream.pipeline);

const processExternalImage = async (fileBuffer, fileMimeType) => {
    const URL = "http://3.109.211.248/predict";
    let tempDir = null;
    let zipPath = null;

    try {
        console.log("Sending file to external API for processing...");

        // Create FormData and send request
        const form = new FormData();
        form.append('file', fileBuffer, {
            filename: 'uploaded_image.jpg',
            contentType: fileMimeType,
        });

        const response = await axios.post(URL, form, {
            headers: {
                ...form.getHeaders(),
            },
            responseType: 'arraybuffer',
        });

        if (!response.headers["content-type"].includes("application/zip")) {
            throw new Error("Expected a ZIP file in the API response.");
        }

        // Create unique temporary directory
        const timestamp = Date.now();
        tempDir = path.join(os.tmpdir(), `extract_${timestamp}`);
        await fsp.mkdir(tempDir, { recursive: true });

        // Write ZIP file
        zipPath = path.join(tempDir, 'response.zip');
        await fsp.writeFile(zipPath, response.data);

        console.log(`ZIP file written to ${zipPath}`);

        // Create extraction directory
        const extractPath = path.join(tempDir, 'extracted');
        await fsp.mkdir(extractPath, { recursive: true });

        // Extract ZIP file using regular fs for createReadStream
        await new Promise((resolve, reject) => {
            fs.createReadStream(zipPath)
                .pipe(unzipper.Extract({ path: extractPath }))
                .on('close', resolve)
                .on('error', reject);
        });

        // Wait a moment for extraction to complete
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Read extracted files
        const extractedFiles = [];
        const files = await fsp.readdir(extractPath);

        console.log('Files found in extracted directory:', files);

        for (const file of files) {
            // Skip macOS metadata
            if (file.startsWith('._') || file.startsWith('.')) continue;

            const filePath = path.join(extractPath, file);
            const stats = await fsp.stat(filePath);

            if (stats.isFile()) {
                const buffer = await fsp.readFile(filePath);
                const ext = path.extname(file).toLowerCase().slice(1);

                extractedFiles.push({
                    filename: file,
                    buffer: buffer,
                    mimeType: `image/${ext}`,
                });

                console.log(`Processed file: ${file}`);
            }
        }

        if (extractedFiles.length === 0) {
            throw new Error('No valid files found in ZIP');
        }

        console.log(`Successfully extracted ${extractedFiles.length} files`);
        return extractedFiles;

    } catch (error) {
        console.error("Error in processExternalImage:", error.message);
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
        // Cleanup temporary files
        if (tempDir) {
            try {
                await fsp.rm(tempDir, { recursive: true, force: true });
                console.log(`Cleaned up temporary directory: ${tempDir}`);
            } catch (cleanupError) {
                console.error('Error during cleanup:', cleanupError);
            }
        }
    }
};

module.exports = { processExternalImage };
