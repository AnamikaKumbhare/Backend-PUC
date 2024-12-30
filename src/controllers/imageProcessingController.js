const { processExternalImage } = require("../services/PUCcheckServices/modelApiService");
const { processOCR } = require("../services/PUCcheckServices/processOCRService");
const { parseRcNumber } = require("../services/PUCcheckServices/parsingService");
const { checkPucValidation } = require("../controllers/pucValidationController");
const websocketService = require("../services/webSockets/webSocketService");

const processImage = async (req, res) => {
    try {
        console.log("Request received to process image.");

        // Check for file in the request
        if (!req.file) {
            const error = "File not found in request";
            websocketService.emitPUCValidationError(error);
            return res.status(400).json({ status: "failed", message: error });
        }

        const fileBuffer = req.file.buffer;
        const fileMimeType = req.file.mimetype;

        // Validate file type
        if (!fileMimeType.startsWith("image/")) {
            const error = "Invalid file type.";
            websocketService.emitPUCValidationError(error);
            return res.status(400).json({ status: "failed", message: error });
        }

        // Process the external image
        const extractedFiles = await processExternalImage(fileBuffer, fileMimeType);

        // Check if files were extracted
        if (!Array.isArray(extractedFiles) || extractedFiles.length === 0) {
            const error = "No valid files found in the processed result.";
            websocketService.emitPUCValidationError(error);
            return res.status(400).json({ status: "failed", message: error });
        }

        // Perform OCR on the extracted files
        const extractedTexts = await processOCR(extractedFiles);

        // Parse RC numbers using the service
        const rcNumbers = parseRcNumber(extractedTexts);

        // Log parsed RC numbers
        console.log("Parsed RC Numbers:", rcNumbers);

        // Handle no RC numbers detected
        if (rcNumbers.length === 0) {
            const error = "No RC numbers detected.";
            websocketService.emitPUCValidationError(error);
            return res.status(400).json({ status: "failed", message: error });
        }

        const resultRTOInfo = [];

        // Call the checkPucValidation logic for each RC number
        for (const rcNumber of rcNumbers) {
            try {
                const mockReq = { body: { rc_number: rcNumber } };
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
                    const error = `Validation failed for RC Number ${rcNumber}: ${response.response.message}`;
                    console.warn(error);
                    websocketService.emitPUCValidationError(error);
                }
            } catch (error) {
                const errorMsg = `Error validating RC Number ${rcNumber}: ${error.message}`;
                console.error(errorMsg);
                websocketService.emitPUCValidationError(errorMsg);
            }
        }

        // If we have results, emit them via WebSocket
        if (resultRTOInfo.length > 0) {
            websocketService.emitPUCValidationResult(resultRTOInfo);
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
        websocketService.emitPUCValidationError(error.message);
        res.status(500).json({ status: "failed", message: error.message });
    }
};

module.exports = { processImage };