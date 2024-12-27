const wordSet = new Set([
    "IND",
    " ",
    "-",
    "_",
    "MARUTI SUZUKI",
    "HYUNDAI",
    "TATA MOTORS",
    "MAHINDRA & MAHINDRA",
    "TOYOTA",
    "HONDA",
    "FORD",
    "RENAULT",
    "NISSAN",
    "VOLKSWAGEN",
    "MERCEDES-BENZ",
    "BMW",
    "AUDI",
    "SKODA",
    "VOLVO",
    "JEEP",
    "KIA",
    "MG MOTOR",
    "JAGUAR LAND ROVER",
    "FIAT",
    "LAMBORGHINI",
    "PORSCHE",
    "ROLLS-ROYCE",
    "BENTLEY",
    "ASTON MARTIN",
    "FERRARI",
    "MASERATI",
    "ISUZU",
    "FORCE MOTORS",
    "PREMIER",
    "BAJAJ AUTO",
    "TVS MOTORS",
    "HERO MOTOCORP",
    "ROYAL ENFIELD",
    "MAHINDRA TWO WHEELERS",
    "YAMAHA",
    "SUZUKI MOTORCYCLE",
    "KAWASAKI",
    "TRIUMPH MOTORCYCLES",
    "HARLEY-DAVIDSON",
    "HYOSUNG",
    "INDIAN MOTORCYCLE",
    "PIAGGIO",
    "DUCATI",
    "APRILIA",
    "BENELLI",
    "MV AGUSTA",
    "NORTON",
    "HUSQVARNA",
    "BMW MOTORRAD",
    "KTM",
    "JAWA",
    "TRIUMPH MOTORCYCLES",
    "KYMCO",
    "KAUN",
    "OLA ELECTRIC"
]);

const parseRcNumber = (extractedText) => {
    const resultArr = [];

    extractedText.forEach((textBlock) => {
        const textLines = textBlock.split("\n");
        let result = "";

        textLines.forEach((text) => {
            if (!wordSet.has(text) && text.length >= 2 && text.length <= 10) {
                result += text;
            }
        });

        result = result.replace(/ /g, "").replace(/\./g, "").replace(/-/g, "");

        if (result) {
            resultArr.push(result);
        }
    });

    return resultArr;
};

module.exports = { parseRcNumber };
