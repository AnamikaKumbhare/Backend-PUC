const fs = require("fs");
const path = require("path");
const axios = require("axios");
const unzipper = require("unzipper");
const { Buffer } = require("buffer");
const { Image } = require("image-js");

const processExternalImage = async (file, imageDir) => {
    const URL = "http://3.109.211.248/predict";

    const response = await axios.post(URL, file, {
        headers: { "Content-Type": file.mimetype },
        responseType: "arraybuffer",
    });

    if (!response.headers["content-type"].includes("application/zip")) {
        throw new Error("Expected a ZIP file in the API response.");
    }

    const zipFilePath = path.join(imageDir, "response.zip");
    fs.writeFileSync(zipFilePath, response.data);

    await fs.createReadStream(zipFilePath).pipe(unzipper.Extract({ path: imageDir }));
    return zipFilePath;
};

const processOCR = async (zipFilePath, imageDir) => {
    const headers = {
        "X-RapidAPI-Key": "fe044ef51bmshe41b8b9305ead49p1cd0a3jsn4f877814fa3e",
        "X-RapidAPI-Host": "ocr43.p.rapidapi.com",
    };

    const imageProcessedData = [];
    const files = fs.readdirSync(imageDir);

    for (const fileName of files) {
        const filePath = path.join(imageDir, fileName);
        const image = await Image.load(filePath);
        const buffer = await image.toBuffer();

        const response = await axios.post(
            "https://ocr43.p.rapidapi.com/v1/results",
            { image: buffer },
            { headers }
        );

        if (response.status !== 200) {
            throw new Error(`OCR API failed: ${response.status}`);
        }

        const text = response.data.results[0].entities[0].objects[0].entities[0].text;
        imageProcessedData.push(text);
    }

    return imageProcessedData;
};

module.exports = { processExternalImage, processOCR };
