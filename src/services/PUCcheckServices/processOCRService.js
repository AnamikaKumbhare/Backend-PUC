const axios = require('axios');
const FormData = require('form-data');

const processOCR = async (extractedFiles) => {
    const headers = {
        "X-RapidAPI-Key": "546e7062c3mshe4bb231c8d771a4p1c723fjsn3ba8d65b188a",
        "X-RapidAPI-Host": "ocr43.p.rapidapi.com",
    };

    const imageProcessedData = [];

    for (const file of extractedFiles) {
        const { filename, buffer, mimeType } = file;

        if (!filename || !buffer) {
            console.error(`Invalid file format: Missing 'filename' or 'buffer' for file.`);
            continue;
        }

        console.log(`Processing OCR for file: ${filename} (${mimeType})`);

        try {
            const formData = new FormData();
            formData.append('image', buffer, {
                filename: filename,
                contentType: mimeType,
            });

            console.log('Sending request to OCR API with headers:', {
                ...headers,
                ...formData.getHeaders(),
            });

            const response = await axios({
                method: 'post',
                url: "https://ocr43.p.rapidapi.com/v1/results",
                headers: {
                    ...headers,
                    ...formData.getHeaders(),
                },
                data: formData,
                maxContentLength: Infinity,
                maxBodyLength: Infinity,
            });

            console.log('OCR API Response Status:', response.status);
            console.log('OCR API Response Data:', JSON.stringify(response.data, null, 2));

            // Extract text field from the OCR API response
            if (response.data.results && Array.isArray(response.data.results)) {
                for (const result of response.data.results) {
                    if (result.entities) {
                        for (const entity of result.entities) {
                            if (entity.objects) {
                                for (const obj of entity.objects) {
                                    if (obj.entities) {
                                        for (const subEntity of obj.entities) {
                                            if (subEntity.kind === "text" && subEntity.text) {
                                                imageProcessedData.push(subEntity.text);
                                                console.log(`Extracted text: ${subEntity.text}`);
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            } else {
                console.warn(`No valid entities found in OCR response for ${filename}`);
            }
        } catch (err) {
            console.error(`Error in OCR processing for file ${filename}:, err.message`);
            if (err.response) {
                console.error('OCR API Error Response:', err.response.data);
                console.error('OCR API Error Status:', err.response.status);
            }
        }
    }

    if (imageProcessedData.length === 0) {
        console.warn('No text was successfully extracted from any of the images.');
    } else {
        console.log('Successfully extracted texts:', imageProcessedData);
    }

    return imageProcessedData;
};

module.exports = { processOCR };