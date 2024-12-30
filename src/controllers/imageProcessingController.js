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

        const extractedFiles = await processExternalImage(fileBuffer, fileMimeType);

        if (!Array.isArray(extractedFiles) || extractedFiles.length === 0) {
            const error = "No valid files found in the processed result.";
            websocketService.emitPUCValidationError(error);
            return res.status(400).json({ status: "failed", message: error });
        }

        const extractedTexts = await processOCR(extractedFiles);
        const rcNumbers = parseRcNumber(extractedTexts);

        console.log("Parsed RC Numbers:", rcNumbers);

        if (rcNumbers.length === 0) {
            const error = "No RC numbers detected.";
            websocketService.emitPUCValidationError(error);
            return res.status(400).json({ status: "failed", message: error });
        }

        const resultRTOInfo = [];

        // Modified this section to handle database responses correctly
        for (const rcNumber of rcNumbers) {
            try {
                const mockReq = { body: { rc_number: rcNumber } };
                let responseData = null;

                // Use a custom response handler to capture the response
                const mockRes = {
                    status: (code) => ({
                        json: (response) => {
                            responseData = { statusCode: code, response };
                            return responseData;
                        }
                    })
                };

                // Call checkPucValidation and capture its response
                await checkPucValidation(mockReq, mockRes);

                if (responseData && responseData.statusCode === 200) {
                    resultRTOInfo.push(responseData.response.data);
                } else {
                    const error = `Validation failed for RC Number ${rcNumber}: ${responseData?.response?.message || 'Unknown error'}`;
                    console.warn(error);
                    websocketService.emitPUCValidationError(error);
                }
            } catch (error) {
                const errorMsg = `Error validating RC Number ${rcNumber}: ${error.message}`;
                console.error(errorMsg);
                websocketService.emitPUCValidationError(errorMsg);
            }
        }

        if (resultRTOInfo.length > 0) {
            websocketService.emitPUCValidationResult(resultRTOInfo);
        }

        return res.status(200).json({
            status: "success",
            message: "Image processing completed successfully.",
            response: resultRTOInfo,
        });
    } catch (error) {
        console.error("Error:", error);
        websocketService.emitPUCValidationError(error.message);
        return res.status(500).json({ status: "failed", message: error.message });
    }
};

module.exports = { processImage };