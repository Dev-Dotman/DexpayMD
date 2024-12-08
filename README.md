DexPay - Merchant Payment Solution for Solana
DexPay is a decentralized payment solution built on the Solana blockchain, empowering merchants with fast, secure, and low-cost payment processing. While still on the Solana testnet, DexPay is fully functional for baseline features, with additional enhancements coming soon.

🌟 Features
For Merchants:
Payment Requests: Generate and share payment links with customers.
Transaction Dashboard: Track real-time payments and manage earnings.
Wallet Integration: Currently supports Solana wallets with Phantom integration planned.
Secure Payments: Backed by Solana's high-performance blockchain.
For Customers:
Fast Payments: Complete transactions using supported Solana wallets.
Low Fees: Benefit from Solana's low transaction costs.
Simple User Experience: Clean and intuitive payment flows.
🚧 Project Status
DexPay is operational on the Solana testnet, offering essential payment processing features. Deployment to the mainnet will follow once testing is complete and additional functionalities are integrated.

Completed:
Rust Anchor-based smart contracts for payment processing.
Backend API with Node.js and Express.
Interactive React-based frontend.
Basic merchant registration and payment functionality.
In Progress:
Integration with Phantom wallet.
QR code payment system.
🛠 Technologies
Blockchain: Solana (Rust Anchor for smart contracts)
Backend: Node.js, Express.js
Frontend: React.js
Database: MongoDB/PostgreSQL
Wallets: Solana Wallet Adapter (Phantom integration pending)
Deployment: Docker, AWS/GCP
🛠 Getting Started
Prerequisites
Node.js (v14 or later)
Rust and Anchor CLI (for Solana smart contracts)
Solana CLI (configured for the testnet)
Installation
Backend Setup:
Clone the repository:

bash
Copy code
git clone https://github.com/your-username/dexpay.git
cd dexpay
Navigate to the backend folder:

bash
Copy code
cd backend
Install dependencies:

bash
Copy code
npm install
Set up environment variables in a .env file:

env
Copy code
PORT=4000
DATABASE_URL=your_database_url
SOLANA_RPC_URL=https://api.testnet.solana.com
ANCHOR_WALLET=/path/to/your/testnet-keypair.json
Start the backend:

bash
Copy code
npm run dev
Frontend Setup:
Navigate to the frontend folder:

bash
Copy code
cd frontend
Install dependencies:

bash
Copy code
npm install
Start the frontend:

bash
Copy code
npm start
Smart Contracts:
Ensure Rust and Anchor CLI are installed and configured.

Navigate to the Solana program folder:

bash
Copy code
cd solana-program
Build and deploy the program:

bash
Copy code
anchor build
anchor deploy --provider.cluster testnet
💡 Usage
Access the application at http://localhost:3000 (or your deployed testnet URL).
Register as a merchant and set up your wallet.
Create payment requests and share them with customers.
Test transactions using Solana testnet wallets.
📅 Roadmap
 Basic payment processing.
 Phantom wallet integration.
 QR code payment system.
 Deployment to the Solana mainnet.
🤝 Contributing
Contributions are welcome! If you’d like to help, follow these steps:

Fork the repository.
Create a new branch:
bash
Copy code
git checkout -b feature/your-feature
Commit your changes and push:
bash
Copy code
git push origin feature/your-feature
Submit a pull request.
📜 License
DexPay is licensed under the MIT License.

🛠 Support
For questions or feedback, reach out to us at support@dexpay.com.
