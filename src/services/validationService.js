const axios = require("axios");

const RAPID_API_URL = "https://rto-vehicle-information-verification-india.p.rapidapi.com/api/v1/rc/vehicleinfo";
const RAPID_API_HEADERS = {
    "content-type": "application/json",
    "X-RapidAPI-Key": "139c90d5bdmsh887cd3b63935516p1969a0jsn785beb400347",
    "X-RapidAPI-Host": "rto-vehicle-information-verification-india.p.rapidapi.com"
};

const performPucValidation = async (rcNumber) => {
    try {
        const payload = {
            reg_no: rcNumber,
            consent: "Y",
            consent_text: "I hereby declare my consent agreement for fetching my information via AITAN Labs API"
        };

        const response = await axios.post(RAPID_API_URL, payload, { headers: RAPID_API_HEADERS });

        if (response.status === 200) {
            return response.data; // Return the API response data
        } else {
            return {
                error: response.data // Return the error response from the API
            };
        }
    } catch (error) {
        return {
            error: error.message // Return the error message
        };
    }
};

module.exports = { performPucValidation };
