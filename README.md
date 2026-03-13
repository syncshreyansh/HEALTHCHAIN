Here's your README content — just copy and paste this directly into your `README.md` file on GitHub:

---

````markdown
<div align="center">

<img src="https://img.shields.io/badge/Ethereum-Sepolia-3B82F6?style=for-the-badge&logo=ethereum&logoColor=white"/>
<img src="https://img.shields.io/badge/IPFS-Pinata-6366F1?style=for-the-badge&logo=ipfs&logoColor=white"/>
<img src="https://img.shields.io/badge/MongoDB-Atlas-10B981?style=for-the-badge&logo=mongodb&logoColor=white"/>
<img src="https://img.shields.io/badge/Cloudflare-Workers-F59E0B?style=for-the-badge&logo=cloudflare&logoColor=white"/>
<img src="https://img.shields.io/badge/AI-Fraud%20Detection-EF4444?style=for-the-badge&logo=openai&logoColor=white"/>

<br/>
**A decentralized medical records platform built on Ethereum — where hospitals can't lie, patients can't be ignored, and insurers can't be fooled.**

<br/>

[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)
[![Status](https://img.shields.io/badge/Status-Live%20on%20Sepolia-3B82F6?style=for-the-badge)](https://github.com/simranjitkaur-2007/HEALTHCHAIN)

</div>

---

## ⚡ The Problem

Healthcare in India runs on paperwork — and paperwork can be faked.

A diagnosis can be changed. A bill can be inflated. A patient can be denied a claim they genuinely deserve. All because there was **no single source of truth** that anyone could trust.

HealthChain was built to fix that.

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        HealthChain Platform                      │
├───────────────┬──────────────────┬──────────────────────────────┤
│   🧑 Patient  │   🏥 Hospital    │   🛡️ Insurance Company       │
│   Portal      │   Portal         │   Portal                     │
│  PAT-XXXXXX   │  HSP-XXXXXX      │  INS-XXXXXX                  │
└───────┬───────┴────────┬─────────┴──────────────┬───────────────┘
        │                │                         │
        ▼                ▼                         ▼
┌───────────────────────────────────────────────────────────────┐
│                     Node.js Backend API                        │
│              JWT Auth  ·  Role Middleware  ·  REST             │
└───────────────┬───────────────────────────────────────────────┘
        ┌───────┴──────────────────────────────┐
        ▼                                      ▼
┌──────────────────┐                 ┌──────────────────────────┐
│   MongoDB Atlas   │                 │   Ethereum (Sepolia)      │
│   Cloudflare R2   │                 │   Smart Contracts         │
│   Pinata IPFS     │                 │   Immutable Audit Trail   │
└──────────────────┘                 └──────────────────────────┘
        │                                      │
        ▼                                      ▼
┌──────────────────┐                 ┌──────────────────────────┐
│  AES-256-GCM      │                 │   AI Fraud Engine         │
│  Encrypted Files  │                 │   Self-Trained LLM        │
│  Before Upload    │                 │   0–100 Risk Scoring      │
└──────────────────┘                 └──────────────────────────┘
```

---

## 🌟 What Makes This Different

| Feature | Traditional Systems | HealthChain |
|---|---|---|
| Record tampering | Possible anytime | **Impossible — on-chain** |
| File privacy | Server can read your files | **AES-256-GCM encrypted before upload** |
| Fraud detection | Manual review | **AI-scored at submission** |
| Identity verification | Self-declared documents | **DigiLocker OAuth 2.0** |
| Scheme eligibility | Manual verification | **Ayushman Bharat API** |
| Audit trail | Internal logs (editable) | **Public blockchain transactions** |

---

## 👥 Three Portals, One Truth

### 🧑 Patient Portal — `PAT-XXXXXX`
- Complete medical history accessible anytime — no hospital dependency
- Submit insurance claims directly from treatment records
- Identity verified instantly via **DigiLocker OAuth 2.0** — no physical documents
- Plain-English AI explanation on every claim decision
- Every record linked to an immutable blockchain transaction

### 🏥 Hospital Portal — `HSP-XXXXXX`
- Upload treatment records directly to the blockchain — permanently immutable
- **Ayushman Bharat (NHA) API** for real-time PM-JAY scheme eligibility verification
- Upload prescriptions, invoices, lab reports, and photos — all AES-256 encrypted to IPFS
- Register and manage patients from a single dashboard

### 🛡️ Insurance Portal — `INS-XXXXXX`
- Every claim arrives pre-scored with a **0–100 AI fraud risk rating**
- Treatment records are on-chain — unchanged since the moment of upload
- One-click approve/reject — AI auto-generates the patient notification
- Full claim history with live blockchain verification links

---

## 🔐 Security Stack

```
File Upload Flow
────────────────────────────────────────────────────
Hospital uploads file
        │
        ▼
AES-256-GCM Encryption  (key stored server-side only)
        │
        ▼
Encrypted blob → Pinata IPFS → CID stored in MongoDB
        │
        ▼
Transaction hash → Ethereum Sepolia → Permanent record
────────────────────────────────────────────────────
Even Pinata cannot read your files.
Even if the DB is breached, files are unreadable.
```

- 🔑 JWT Authentication with role-based access control
- 🚫 Zero-trust middleware — a patient token cannot hit a hospital route, ever
- 🔒 AES-256-GCM encryption on all files before leaving the server
- ⛓️ Immutable on-chain records — no retroactive edits possible
- 🪪 DigiLocker OAuth 2.0 for government-verified patient identity

---

## 🤖 AI Fraud Detection

```
Claim Submitted
      │
      ▼
Model analyzes: diagnosis · cost · ICD codes · patient history
      │
      ▼
Risk Score:  0 ──────────────────── 100
             ✅ Low Risk        🚨 High Risk
      │
      ▼
Insurer sees score + reasoning
      │
      ▼
AI generates plain-English notification for patient
```

Built on a **self-trained fraud detection model** — the scoring logic, training pipeline, and model weights are fully owned by the project. No third-party API dependency.

---

## 🏛️ Government Integrations

| Integration | Portal | Purpose |
|---|---|---|
| **DigiLocker OAuth 2.0** | Patient | Government-verified identity — eliminates document fraud at source |
| **Ayushman Bharat (NHA) API** | Hospital | Real-time PM-JAY scheme eligibility verification |

> Integration designed and sandbox-ready — pending NHA developer portal approval.

---

## ⛓️ Smart Contracts

```
contracts/
├── MedicalRecord.sol       // Stores treatment record hashes on-chain
└── InsuranceClaim.sol      // Records claim submissions and resolutions
```

Deployed on **Ethereum Sepolia testnet** — every upload emits a verifiable on-chain transaction. View any record live on Etherscan.

---

## 🗂️ Project Structure

```
HEALTHCHAIN/
├── 📁 contracts/
│   ├── MedicalRecord.sol
│   └── InsuranceClaim.sol
├── 📁 controllers/
│   ├── authController.js
│   ├── hospitalController.js
│   ├── patientController.js
│   └── insurerController.js
├── 📁 middlewares/
│   ├── auth.js               # JWT verification
│   └── role.js               # Role-based access enforcement
├── 📁 services/
│   ├── aiService.js          # Fraud scoring + explanation generation
│   ├── blockchainService.js  # Ethereum interaction + mock fallback
│   └── encryptionService.js  # AES-256-GCM file encryption
├── 📁 frontend/
│   ├── index.html
│   ├── styles.css
│   └── app.js
├── supabase-setup.sql        # Database schema
├── deploy.js                 # Smart contract deployment
└── server.js
```

---

## 🚀 Getting Started

```bash
# Clone the repository
git clone https://github.com/simranjitkaur-2007/HEALTHCHAIN.git
cd HEALTHCHAIN

# Install dependencies
npm install

# Configure environment
cp .env.example .env

# Deploy smart contracts to Sepolia
node deploy.js

# Start the server
npm start
```

### Environment Variables

```env
MONGODB_URI=your_mongodb_atlas_uri
JWT_SECRET=your_jwt_secret
ETHEREUM_RPC_URL=your_sepolia_rpc_url
PRIVATE_KEY=your_wallet_private_key
CONTRACT_ADDRESS_MEDICAL=deployed_contract_address
CONTRACT_ADDRESS_CLAIM=deployed_contract_address
PINATA_API_KEY=your_pinata_key
PINATA_SECRET=your_pinata_secret
ENCRYPTION_KEY=your_aes_256_key
CLOUDFLARE_ACCOUNT_ID=your_cf_account_id
```

---

## 💰 Infrastructure Cost

| Stage | Monthly Cost | Stack |
|---|---|---|
| **Dev / Demo** | ~$0 | MongoDB Free · Cloudflare Free · Pinata Free |
| **MVP Production** | ~$80–120 | MongoDB M10 · Cloudflare Workers · Self-hosted LLM |
| **At Scale · 50 hospitals** | ~$1,500–1,800 | MongoDB M30+ · Cloudflare Enterprise · GPU Inference |

---

## 🗓️ Built In 5 Weeks

| Phase | Days | Focus |
|---|---|---|
| 01 | 1–7 | Smart Contracts & Auth |
| 02 | 8–14 | IPFS + Encryption Layer |
| 03 | 15–21 | AI Fraud Scoring Engine |
| 04 | 22–24 | DigiLocker + Ayushman Bharat Integration |
| 05 | 25–28 | Frontend & End-to-End QA |

---

## 🧑‍💻 Built By

**Simranjit Kaur** — [@simranjitkaur-2007](https://github.com/simranjitkaur-2007)

---

<div align="center">

**HealthChain doesn't ask anyone to trust each other.**
**It makes trust unnecessary.**

<br/>

⭐ Star this repo if you believe health data should belong to patients — not hospitals.

</div>
````
