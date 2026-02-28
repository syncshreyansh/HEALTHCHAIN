# HealthChain — HTML/CSS/JS + Node.js + Blockchain

> Team: Bits and Gears | HackOverflow 4.0 | PSIT & AITM, Kanpur
> Pure HTML, CSS, Vanilla JS frontend. No React. No framework.

---

## Project Structure

healthchain-html/
├── blockchain/     ← Solidity smart contracts + Hardhat
├── backend/        ← Node.js + Express API
└── frontend/       ← Pure HTML + CSS + Vanilla JS

---

## How the Frontend Works

- All pages live in index.html as <div class="page"> sections
- Only the active page is shown at any time
- Navigation uses URL hash routing (#/dashboard, #/claim/ID)
- The Router object handles hash changes and calls page init functions
- Auth state is stored in localStorage (JWT + user object)
- API calls go through the API object in api.js

---

## Setup (2 terminals only)

### Terminal 1 — Blockchain

cd blockchain
npm install
cp .env.example .env
# Fill in INFURA_SEPOLIA_URL and DEPLOYER_PRIVATE_KEY

npm run compile
npm run test
npm run node         # keep this open

# In a new tab:
npm run deploy:local
# Copy the two contract addresses printed

### Terminal 2 — Backend + Frontend

cd backend
npm install
cp .env.example .env
# Fill in all keys (see below)

npm run dev
# Open http://localhost:5000

The backend serves the frontend folder as static files.
No separate frontend server needed.

---

## Environment Variables (backend/.env)

PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5000

MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/healthchain

JWT_SECRET=64_random_chars
JWT_EXPIRES_IN=24h

INFURA_SEPOLIA_URL=https://sepolia.infura.io/v3/YOUR_KEY
BACKEND_WALLET_PRIVATE_KEY=your_dev_wallet_private_key
MEDICAL_RECORD_ADDRESS=from_deploy_step
INSURANCE_CLAIM_ADDRESS=from_deploy_step

PINATA_API_KEY=your_pinata_api_key
PINATA_API_SECRET=your_pinata_api_secret
PINATA_GATEWAY=https://gateway.pinata.cloud/ipfs

AI_PROVIDER=anthropic
ANTHROPIC_API_KEY=your_anthropic_api_key

ENCRYPTION_MASTER_KEY=run: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

---

## API Keys Needed (All Free)

| Service    | URL                          | Purpose          |
|------------|------------------------------|------------------|
| MongoDB    | mongodb.com/atlas            | Database         |
| Pinata     | pinata.cloud                 | IPFS storage     |
| Infura     | infura.io                    | Ethereum RPC     |
| Anthropic  | console.anthropic.com        | AI               |

---

## Changing Roles for Testing

Open MongoDB Compass → healthchain DB → users collection
→ find your wallet → change role to: doctor / insurer / patient / hospital

---

## Common Errors

| Error                  | Fix                                              |
|------------------------|--------------------------------------------------|
| MetaMask not found     | Install from metamask.io                         |
| CORS error             | Set FRONTEND_URL=http://localhost:5000 in .env   |
| MongoDB refused        | Atlas Network Access → Add 0.0.0.0/0             |
| Contract not found     | npm run compile then npm run deploy:local        |
| Nonce too high         | MetaMask → Settings → Advanced → Reset Account   |
| AI fails               | Check ANTHROPIC_API_KEY in .env                  |

---

## API Endpoints

| Method | Path                      | Role    | Description                    |
|--------|---------------------------|---------|--------------------------------|
| POST   | /api/auth/challenge       | Public  | Get MetaMask signing challenge |
| POST   | /api/auth/verify          | Public  | Verify signature, get JWT      |
| GET    | /api/auth/me              | Any     | Current user info              |
| PUT    | /api/auth/profile         | Any     | Update profile                 |
| POST   | /api/records/upload       | Doctor  | Upload encrypted record        |
| GET    | /api/records/:address     | Any     | Get records from blockchain    |
| POST   | /api/claims/submit        | Patient | Submit new claim               |
| GET    | /api/claims               | Any     | List claims (role-filtered)    |
| GET    | /api/claims/:id           | Any     | Claim details                  |
| POST   | /api/claims/:id/resolve   | Insurer | Approve or reject              |
| GET    | /api/hospitals            | Any     | List compatible hospitals      |
| POST   | /api/ai/prescription-assist | Doctor | AI structures notes           |
| POST   | /api/ai/explain           | Any     | AI explains rejection          |

---