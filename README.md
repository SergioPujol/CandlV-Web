# CandlV-Web

# Automated Cryptocurrency Trading Web Application

## Project Overview

The Automated Cryptocurrency Trading Web Application is a web-based tool that simplifies market analysis and enables automated cryptocurrency trading using technical strategies. The application allows users to perform real-time automated trading and simulations in cryptocurrency markets.

## Key Features

- User authentication
- Creation of customizable charts with symbol and interval options
- Real-time visualization of multiple charts
- Configuration of automated trading bots with customizable strategies and values
- Support for fixed or percentage-based investments in each bot
- Integration with Binance API for trading operations
- Storage of user-specific data such as charts, bots, and strategies
- Cloud-based execution of automated trading
- Technical analysis using predefined strategies

## Methodology

The project follows an Agile Scrum methodology, which allows the software to be developed iteratively and incrementally in short development cycles called sprints. The Scrum methodology emphasizes collaboration, flexibility, and continuous improvement throughout the development process.

## Technologies Used

- JavaScript
- HTML
- CSS
- Bootstrap
- Node.js
- Typescript
- MongoDB
- Mongoose

## Getting Started

To run the web application, follow these steps:

1. Install MongoDB and MongoDB Compass (recommended) to set up a local non-relational database. Once installed, start a new connection with `mongodb://localhost:27017`.
2. Create the following database and collections:
   - Database: `candlv`
     - Collections: `bots`, `charts`, `settings`, `trades`, `users`
3. Add a test user to the `users` collection in the `candlv` database. Use an email and key as shown in the user document example.
4. Clone the web application repository from GitHub: [GitHub Repository](https://github.com/SergioPujol/CandlV-Web)
5. Open a terminal and navigate to the project directory.
6. Run `npm install` to install the required npm packages.
7. Execute the command `npm run start` in the main directory of the project.
8. Access the web application by opening a web browser and entering the address [http://localhost:3000/](http://localhost:3000/).
