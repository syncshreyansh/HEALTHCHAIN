# HealthChain — HTML/CSS/JS + Node.js + Blockchain

> Team: Bits and Gears | HackOverflow 4.0 | PSIT & AITM, Kanpur  
> Pure HTML, CSS, Vanilla JS frontend. No React. No framework.

---

## Project Structure

healthchain-html/  
├── `blockchain/`  ← Solidity smart contracts + Hardhat  
├── `backend/`     ← Node.js + Express API + auth + AI + IPFS integration  
└── `frontend/`    ← Pure HTML + CSS + Vanilla JS (served by backend)

---

## Quick Start — run everything with one script

You can spin up the whole stack (blockchain + contracts + backend + frontend) with **one command**, depending on your OS.

### Windows (PowerShell)

```powershell
cd C:\Users\ASUS\OneDrive\Desktop\Healthchain
.\start.ps1
```

This script will:
- **Install dependencies** for `blockchain/` and `backend/`
- **Compile** the Solidity contracts
- **Start a local Hardhat blockchain node**
- **Deploy** the contracts to that local node  
  - It prints something like:
    - `MEDICAL_RECORD_ADDRESS=0x...`
    - `INSURANCE_CLAIM_ADDRESS=0x...`
  - **Copy these into `backend/.env`** (see env section below)
- **Start the backend** at `http://localhost:5000` (which also serves the frontend)

Then open `http://localhost:5000` in your browser and connect your wallet with MetaMask.

### macOS / Linux (Bash)

```bash
cd /path/to/Healthchain
chmod +x start.sh        # only once
./start.sh
```

This does the same as the PowerShell script: install, compile, start Hardhat, deploy contracts, then start the backend on `http://localhost:5000`.

---

## How the frontend works

- All pages live in `frontend/index.html` as `<div class="page">` sections
- Only the active page is visible at any time
- Navigation uses URL hashes (e.g. `#/dashboard`, `#/claim/ID`)
- A `Router` object in `frontend/js/app.js` listens for hash changes and calls page init functions
- Auth state (current user + JWT) is stored in `localStorage`
- API calls go through the `API` helper in `frontend/js/api.js`
- MetaMask wallet connection + login is handled by `frontend/js/metamask.js`

---

## Setup (local development)

You can either use the **one-command scripts** above, or do it manually in **two terminals**.

### Option A — Scripts (recommended)

See **Quick Start** (`start.ps1` / `start.sh`). This is the easiest way to run everything.

### Option B — Manual 2‑terminal setup

#### Terminal 1 — Blockchain

```bash
cd blockchain
npm install
cp .env.example .env
# Fill in INFURA_SEPOLIA_URL and DEPLOYER_PRIVATE_KEY

npm run compile
npm run test
npm run node         # keep this open

# In a new tab:
npm run deploy:local
# Copy the two contract addresses printed:
# MEDICAL_RECORD_ADDRESS=...
# INSURANCE_CLAIM_ADDRESS=...
```

#### Terminal 2 — Backend + Frontend

```bash
cd backend
npm install
cp .env.example .env
# Fill in all keys (see below)

npm run dev
# Open http://localhost:5000
```

The backend serves the `frontend/` folder as static files.  
No separate frontend dev server is required.

---

## Environment variables (`backend/.env`)

```env
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
OPENAI_API_KEY=your_openai_api_key_optional

ENCRYPTION_MASTER_KEY=run: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### What each variable does

- **PORT**: Port for the Express server (default `5000`).
- **NODE_ENV**: `development` / `production` toggle.
- **FRONTEND_URL**: URL of the frontend (and CORS origin), usually `http://localhost:5000` in dev.

- **MONGODB_URI**: Connection string to your MongoDB (Atlas or local).  
  Example (Atlas): `mongodb+srv://USER:PASS@cluster0.xxxx.mongodb.net/healthchain`

- **JWT_SECRET**: Secret key to sign login tokens (JWT). Generate with:
  ```bash
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```
- **JWT_EXPIRES_IN**: Expiry for JWTs (e.g. `24h`).

- **INFURA_SEPOLIA_URL**: HTTPS RPC URL for Ethereum Sepolia from Infura.  
  Looks like: `https://sepolia.infura.io/v3/YOUR_INFURA_PROJECT_ID`
- **BACKEND_WALLET_PRIVATE_KEY**: Private key of a **test** Metamask wallet used by the backend to sign chain transactions. **Use a dev wallet only.**
- **MEDICAL_RECORD_ADDRESS / INSURANCE_CLAIM_ADDRESS**: Smart contract addresses printed after deploy (via `start.ps1`, `start.sh`, or `npm run deploy:local`). Paste them here so the backend knows where to send transactions.

- **PINATA_API_KEY / PINATA_API_SECRET / PINATA_GATEWAY**: Credentials for Pinata (IPFS). Used by `backend/services/ipfsService.js` to:
  - Upload encrypted JSON / binary to IPFS
  - Fetch medical records from IPFS when needed

- **AI_PROVIDER**: Either `anthropic` or `openai`.
- **ANTHROPIC_API_KEY**: API key for Anthropic (used when `AI_PROVIDER=anthropic`).
- **OPENAI_API_KEY**: API key for OpenAI (used when `AI_PROVIDER` is not `anthropic`).

- **ENCRYPTION_MASTER_KEY**: 32‑byte hex key for encrypting medical records before sending them to IPFS. Keep this secret and stable.

---

## API keys needed (all free tiers)

| Service    | URL                           | Purpose          |
|-----------|-------------------------------|------------------|
| MongoDB   | `https://www.mongodb.com/atlas` | Database         |
| Pinata    | `https://pinata.cloud`        | IPFS storage     |
| Infura    | `https://infura.io`           | Ethereum RPC     |
| Anthropic | `https://console.anthropic.com` | AI (default)  |
| OpenAI    | `https://platform.openai.com` | AI (optional)    |

### Where to get them

- **MongoDB Atlas (`MONGODB_URI`)**
  - Create a free cluster on MongoDB Atlas.
  - Create a DB user and allow your IP or `0.0.0.0/0` for dev.
  - Copy the connection string and paste into `MONGODB_URI`.

- **Pinata (`PINATA_API_KEY`, `PINATA_API_SECRET`, `PINATA_GATEWAY`)**
  - Sign up at Pinata, create an API key + secret.
  - Use `https://gateway.pinata.cloud/ipfs` as a default gateway.

- **Infura (`INFURA_SEPOLIA_URL`)**
  - Sign up at Infura, create a project.
  - Enable Ethereum Sepolia and copy the HTTPS URL into `INFURA_SEPOLIA_URL`.

- **Anthropic / OpenAI (AI keys)**
  - Get an API key from Anthropic (`ANTHROPIC_API_KEY`) or OpenAI (`OPENAI_API_KEY`).
  - In `.env`, set `AI_PROVIDER=anthropic` or `AI_PROVIDER=openai`.

---

## How login works (MetaMask + backend)

1. **Connect wallet (frontend)**  
   - On the landing page, the user clicks **“Connect Wallet”**.  
   - `frontend/js/metamask.js` calls `window.ethereum.request({ method: 'eth_requestAccounts' })` to get the wallet address.

2. **Get a challenge from backend**  
   - Frontend calls `POST /api/auth/challenge` with `{ walletAddress }`.  
   - Backend (`backend/routes/auth.js`) finds or creates a `User` with that wallet, generates a random `nonce`, and returns a message like `HealthChain-123456`.

3. **User signs challenge with MetaMask**  
   - The frontend uses `personal_sign` to sign the message with the user’s wallet.

4. **Verify signature on backend**  
   - Frontend sends `{ walletAddress, signature }` to `POST /api/auth/verify`.  
   - Backend verifies with `ethers.verifyMessage`, clears the nonce, and issues a **JWT** token with user id, wallet and role.

5. **Store auth state on frontend**  
   - Frontend saves `{ user, token }` via `Auth.set(...)` (localStorage).  
   - All subsequent API calls go through `API` helpers and send the JWT in headers.

6. **Fetch profile when needed**  
   - Frontend can call `GET /api/auth/me` to get the full user object.

There are **no passwords** – wallet + signature is the authentication method.

---

## Roles and access — patients, doctors, hospitals, insurers

The `User` model (`backend/models/User.js`) has a `role` field:

- `patient`
- `doctor`
- `hospital`
- `insurer`

For local testing you usually:

1. Login once with your wallet (it auto‑creates a `User` with default role `patient`).  
2. Open MongoDB Compass → `healthchain` DB → `users` collection.  
3. Find your wallet record and change the `role` field to `doctor`, `hospital`, or `insurer` as needed.

### Patients

- **What they see**
  - Dashboard focused on **their own claims**.
  - Status of each claim (pending / approved / rejected / under_review).
  - If claim is rejected, they see a **plain‑English explanation** from the AI.
  - Hospital search (`#/hospitals`) that shows which hospitals are covered by their insurer.
- **What they can do**
  - Submit new claims from `#/submit-claim` (which calls `POST /api/claims/submit`).
  - Browse compatible hospitals (`GET /api/hospitals`) filtered by their `insurancePolicyId`.

### Doctors

- **What they see**
  - A dashboard plus a **Prescription** screen (`#/prescribe`).  
- **What they can do**
  - Enter free‑text clinical notes and let the AI structure them using `POST /api/ai/prescription-assist`.  
  - Save structured prescriptions as encrypted records:  
    - Backend encrypts data, uploads it to IPFS (`ipfsService`), and records the CID on the MedicalRecord smart contract.

### Hospitals

- **What they see**
  - Claims associated with their hospital.
  - Hospital search views (for patients) use `Hospital` metadata such as `supportedInsurers` to show coverage.
- **What they can do**
  - View claim details, including IPFS CID, blockchain transaction, patient + policy info, and AI insights.

### Insurers

- **What they see**
  - A dashboard of **all incoming claims** (filtered by role `insurer`).  
  - Each claim shows fraud risk, amounts, hospital, patient policy, and chain/IPFS proofs.
- **What they can do**
  - Use the AI fraud analysis fields (from `analyzeClaim`) to see potential issues.
  - Approve or reject claims via `POST /api/claims/:id/resolve`.  
  - When rejecting, they enter a technical reason; backend calls `POST /api/ai/explain` to turn it into a friendly explanation for the patient.

---

## End‑to‑end data flow

1. **Doctor creates record**
   - Doctor logs in, opens `#/prescribe`, writes notes.  
   - Clicks AI button → backend structures notes into JSON (`structurePrescription` in `aiService`).  
   - Doctor saves → backend encrypts data, uploads to IPFS (`uploadJSON` / `uploadBuffer`), and writes hash/CID to the MedicalRecord contract.

2. **Patient submits claim**
   - Patient logs in, obtains the IPFS CID for a record, and opens `#/submit-claim`.  
   - Fills in hospital, diagnosis, amount, admission/discharge dates, and provides the CID.  
   - Frontend calls `POST /api/claims/submit`. Backend:
     - Stores claim in MongoDB (`Claim` model).
     - Optionally writes a hash to the InsuranceClaim contract.
     - Runs AI fraud check (`analyzeClaim`) to compute `fraudScore`, `fraudConcerns`, and summary.

3. **Insurer reviews**
   - Insurer logs in and sees all claims (`GET /api/claims`).  
   - Opens a claim detail page, which shows:
     - Human‑readable fields (diagnosis, amount, hospital, patient, policy, dates).
     - IPFS CID + Ethereum transaction link.  
     - AI fraud score and bullet‑point concerns.
   - Insurer approves or rejects (with a technical reason if rejecting).

4. **AI explains decision to patient**
   - When rejected, backend calls `generateExplanation` to turn the technical reason into a friendly explanation stored as `aiExplanation`.  
   - Patient opens the claim again and sees a clear, empathetic explanation of why it was rejected.

---

## Changing roles for testing

Open MongoDB Compass → `healthchain` DB → `users` collection → find your wallet → change `role` to: `doctor` / `insurer` / `patient` / `hospital`.

---

## Common errors

| Error                  | Fix                                                         |
|------------------------|-------------------------------------------------------------|
| MetaMask not found     | Install MetaMask from `https://metamask.io`                |
| CORS error             | Set `FRONTEND_URL=http://localhost:5000` in `.env`         |
| MongoDB refused        | Atlas Network Access → allow your IP / `0.0.0.0/0`         |
| Contract not found     | `npm run compile` then `npm run deploy:local` (or scripts) |
| Nonce too high         | MetaMask → Settings → Advanced → Reset Account             |
| AI fails               | Check `AI_PROVIDER` + API key(s) in `.env`                 |

---

## API endpoints

| Method | Path                        | Role    | Description                      |
|--------|-----------------------------|---------|----------------------------------|
| POST   | `/api/auth/challenge`       | Public  | Get MetaMask signing challenge   |
| POST   | `/api/auth/verify`          | Public  | Verify signature, get JWT        |
| GET    | `/api/auth/me`              | Any     | Current user info                |
| PUT    | `/api/auth/profile`         | Any     | Update profile                   |
| POST   | `/api/records/upload`       | Doctor  | Upload encrypted record          |
| GET    | `/api/records/:address`     | Any     | Get records from blockchain      |
| POST   | `/api/claims/submit`        | Patient | Submit new claim                 |
| GET    | `/api/claims`               | Any     | List claims (role‑filtered)      |
| GET    | `/api/claims/:id`           | Any     | Claim details                    |
| POST   | `/api/claims/:id/resolve`   | Insurer | Approve or reject                |
| GET    | `/api/hospitals`            | Any     | List compatible hospitals        |
| POST   | `/api/ai/prescription-assist` | Doctor | AI structures prescription notes |
| POST   | `/api/ai/explain`           | Any     | AI explains rejection            |

---