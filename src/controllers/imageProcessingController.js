const { processExternalImage } = require("../services/PUCcheckServices/modelApiService");
const { processOCR } = require("../services/PUCcheckServices/processOCRService");
const { parseRcNumber } = require("../services/PUCcheckServices/parsingService");
const { checkPucValidation } = require("../controllers/pucValidationController"); // Import the validation service directly

const processImage = async (req, res) => {
    try {
        console.log("Request received to process image.");

        // Check for file in the request
        if (!req.file) {
            return res.status(400).json({ status: "failed", message: "File not found in request" });
        }

        const fileBuffer = req.file.buffer;
        const fileMimeType = req.file.mimetype;

        // Validate file type
        if (!fileMimeType.startsWith("image/")) {
            return res.status(400).json({ status: "failed", message: "Invalid file type." });
        }

        // Process the external image
        const extractedFiles = await processExternalImage(fileBuffer, fileMimeType);

        // Check if files were extracted
        if (!Array.isArray(extractedFiles) || extractedFiles.length === 0) {
            return res.status(400).json({ status: "failed", message: "No valid files found in the processed result." });
        }

        // Perform OCR on the extracted files
        const extractedTexts = await processOCR(extractedFiles);

        // Parse RC numbers using the service
        const rcNumbers = parseRcNumber(extractedTexts);

        // Log parsed RC numbers
        console.log("Parsed RC Numbers:", rcNumbers);

        // Handle no RC numbers detected
        if (rcNumbers.length === 0) {
            return res.status(400).json({ status: "failed", message: "No RC numbers detected." });
        }

        const resultRTOInfo = [];

        // Call the checkPucValidation logic for each RC number
        for (const rcNumber of rcNumbers) {
            try {
                const mockReq = { body: { rc_number: rcNumber } }; // Create a mock request
                const mockRes = {
                    status: (code) => ({
                        json: (response) => ({ statusCode: code, response }),
                    }),
                };

                // Invoke the checkPucValidation function directly
                const response = await checkPucValidation(mockReq, mockRes);

                if (response.statusCode === 200 && response.response.status === "success") {
                    resultRTOInfo.push(response.response.data);
                } else {
                    console.warn(`Validation failed for RC Number ${rcNumber}:, response.response.message`);
                }
            } catch (error) {
                console.error(`Error validating RC Number ${rcNumber}:, error.message`);
            }
        }

        // Return success response
        res.status(200).json({
            status: "success",
            message: "Image processing completed successfully.",
            response: resultRTOInfo,
        });
    } catch (error) {
        // Log error and send failure response
        console.error("Error:", error);
        res.status(500).json({ status: "failed", message: error.message });
    }
};

module.exports = { processImage };