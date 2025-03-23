# Automated PUC Validation and Pollution Monitoring System Backend

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node.js](https://img.shields.io/badge/Node.js-v18.x-green.svg)
![MongoDB](https://img.shields.io/badge/MongoDB-v6.0-green.svg)
![Express](https://img.shields.io/badge/Express-v4.x-lightgrey.svg)

Backend repository for the Automated PUC Validation and Pollution Monitoring System - an intelligent solution for real-time vehicle pollution compliance enforcement and environmental monitoring.

## 🔗 Links

- [Frontend Repository](https://github.com/Vedarth1/ECOWATCH)
- [Demo Video](https://www.youtube.com/watch?v=LqPl6y-Ln9U)

[![Demo Video](https://img.youtube.com/vi/LqPl6y-Ln9U/0.jpg)](https://www.youtube.com/watch?v=LqPl6y-Ln9U)

## 📋 Overview

This backend system powers the Automated PUC Validation and Pollution Monitoring System, a comprehensive web application designed to streamline vehicle pollution compliance checks and environmental monitoring. The system uses computer vision, OCR technology, and IoT integration to provide real-time insights for pollution control enforcement.

### Key Features

- **Automated Number Plate Recognition**: Processes vehicle images to extract registration numbers
- **OCR Processing**: Converts extracted plate images to standardized alphanumeric format
- **Validation System**: Cross-references vehicle details with PUC compliance database
- **Regional Analytics**: Tracks and analyzes non-compliance patterns by region
- **Real-time Pollution Monitoring**: Integrates with IoT sensors for environmental data collection
- **API Ecosystem**: Provides endpoints for vehicle data, regional statistics, and pollution metrics
- **AWS Integration**: Leverages AWS services for model deployment and ESP32/NodeMCU firmware management

## 🛠️ Technology Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB
- **Authentication**: JWT
- **Computer Vision Processing**: AWS Lambda & Custom Models
- **OCR Engine**: Tesseract.js with custom preprocessing
- **IoT Integration**: Custom APIs for ESP8266/NodeMCU devices
- **Cloud Services**: AWS EC2, S3, Lambda
- **Deployment**: NGINX, PM2

## 💻 Installation and Setup

### Prerequisites

- Node.js (v16.x or higher)
- MongoDB (v5.0 or higher)
- npm or yarn
- AWS CLI (for deployment)

### Environment Variables

Create a `.env` file in the root directory with the following variables:

```
# Server Configuration
MONGO_URI="mongodb+srv://vinayrewatkar257:V72496%23y@cluster0.iyfwvdd.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
SECRET_KEY="PUC_Backend"
JWT_SECRET=f1d7d35f547d1b249b291b9c08398a0db95a9430e5739cdb9c5e53c0e31e3a60
MODEL_URL=http://13.232.255.41:5000/predict
OCR_URL=https://ocr43.p.rapidapi.com/v1/results
OCR_KEY=546e7062c3mshe4bb231c8d771a4p1c723fjsn3ba8d65b188a
AIR_QUALITY_API_KEY=AIzaSyCAe8XCSFqz8mUlKlSot5AfJZwWOlIDi90
```

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/puc-validation-backend.git
   cd puc-validation-backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run start
   ```

The server will be available at `http://localhost:8000`.

## 🚀 API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - User login

### Vehicle Operations

- `POST /api/process-image` - Process vehicle image and extract plate
- `GET /api/vehicle/:plateNumber` - Get vehicle details
- `GET /api/vehicle-count` - Get vehicle counts by category

### Region Analytics

- `GET /api/allregions` - Get statistics for all monitored regions
- `GET /api/regions/:regionId` - Get detailed statistics for specific region
- `GET /api/problem-regions` - Get regions with high non-compliance

### Pollution Monitoring

- `POST /api/pollution/record` - Record pollution reading from IoT device
- `GET /api/pollution/latest` - Get latest pollution readings
- `GET /api/pollution/history/:regionId` - Get historical pollution data

### IoT Device Management

- `POST /api/iot/register` - Register new IoT device
- `GET /api/iot/firmware` - Get firmware binary for IoT device
- `POST /api/iot/configure` - Configure IoT device with WiFi credentials

## 🔍 System Architecture

The backend system consists of several interconnected components:

1. **API Server**: Express.js application providing RESTful endpoints
2. **Image Processing Pipeline**: 
   - Receives images from frontend
   - Communicates with AWS-hosted model for plate extraction
   - Processes extracted plate with OCR
3. **Database Layer**:
   - Stores vehicle information
   - Tracks regional compliance statistics
   - Records pollution data
4. **IoT Interface**:
   - Manages communication with pollution sensors
   - Handles device registration and firmware updates
5. **Authentication & Authorization**:
   - Secures API endpoints
   - Manages user roles and permissions

## 📊 Data Flow

1. Frontend captures vehicle image using device camera
2. Image is sent to backend API
3. Backend forwards image to AWS-hosted model for plate extraction
4. Extracted plate image is processed with OCR
5. Plate number is standardized and validated
6. Vehicle details are fetched and PUC status is determined
7. Results are stored in MongoDB and returned to frontend
8. Regional statistics are updated

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Team

- [Your Name](https://github.com/your-username) - Backend Developer
- [Team Member](https://github.com/team-member) - Frontend Developer
- [Team Member](https://github.com/team-member) - ML Engineer

## 🙏 Acknowledgements

- [Tesseract.js](https://github.com/naptha/tesseract.js) for OCR capabilities
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) for database hosting
- [AWS](https://aws.amazon.com/) for cloud infrastructure
- [Express.js](https://expressjs.com/) for API framework
