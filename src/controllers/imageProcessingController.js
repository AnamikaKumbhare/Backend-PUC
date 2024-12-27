const { performPUCValidation } = require("../services/validationService");
const { VehicleDetails } = require("../models/vehicleDetails.model");
const { mongoDB } = require("../utils/db");
const { processExternalImage, processOCR } = require("../services/imageService");
const fs = require("fs");
const path = require("path");

const processImage = async (req, res) => {
    try {
        console.log("Request received to process image.");

        if (!req.files || !req.files.file) {
            console.log("File not found in the request.");
            throw new Error("File not found");
        }

        const file = req.files.file;
        console.log(`File received: ${file.name}`);

        // Process image with an external API
        const imageDir = path.join(process.cwd(), "image_dir");
        const zipFilePath = await processExternalImage(file, imageDir);

        // Process OCR and parse RC numbers
        const imageProcessedData = await processOCR(zipFilePath, imageDir);

        const resultRTOInfo = [];
        for (const rcNumber of imageProcessedData) {
            console.log(`Checking database for RC number: ${rcNumber}`);
            const vehicleCollection = mongoDB.collection("puc_info");
            const existingVehicle = await vehicleCollection.findOne({ reg_no: rcNumber });

            if (existingVehicle) {
                const vehiclePUCCDetails = existingVehicle.vehicle_pucc_details;
                resultRTOInfo.push({
                    message: vehiclePUCCDetails ? "PUC is Valid!!" : "PUC is Invalid!!",
                    ...existingVehicle,
                });
                continue;
            }

            // Perform PUC validation for new RC numbers
            const validationResponse = await performPUCValidation(rcNumber);

            if (validationResponse.error) {
                return res.status(400).json({
                    status: "failed",
                    message: "Validation Error",
                    error: validationResponse.error,
                });
            }

            const { result } = validationResponse;
            const message = result.vehicle_pucc_details
                ? "PUC is Valid!!"
                : "PUC is Invalid!!";

            const vehicleDetails = new VehicleDetails(result);
            await vehicleDetails.save();

            resultRTOInfo.push({ message, ...result });
        }

        res.status(200).json({
            status: "success",
            message: "Image processing done successfully",
            response: resultRTOInfo,
        });
    } catch (error) {
        console.error(`Error occurred: ${error.message}`);
        res.status(500).json({
            status: "failed",
            message: "Error occurred",
            error: error.message,
        });
    } finally {
        const imageDir = path.join(process.cwd(), "image_dir");
        if (fs.existsSync(imageDir)) {
            fs.rmSync(imageDir, { recursive: true, force: true });
            console.log(`${imageDir} has been removed successfully.`);
        }
    }
};

module.exports = { processImage };
