const { ethers } = require('ethers');

let MedicalRecordABI, InsuranceClaimABI;
try {
  MedicalRecordABI  = require('../../blockchain/artifacts/contracts/MedicalRecord.sol/MedicalRecord.json').abi;
  InsuranceClaimABI = require('../../blockchain/artifacts/contracts/InsuranceClaim.sol/InsuranceClaim.json').abi;
} catch {
  console.warn('⚠️  ABIs not found. Run `npx hardhat compile` in /blockchain first.');
  MedicalRecordABI = InsuranceClaimABI = [];
}

const getProvider = () =>
  new ethers.JsonRpcProvider(process.env.INFURA_SEPOLIA_URL);

const getSigner = () =>
  new ethers.Wallet(process.env.BACKEND_WALLET_PRIVATE_KEY, getProvider());

const medContract   = (s = getSigner()) =>
  new ethers.Contract(process.env.MEDICAL_RECORD_ADDRESS,  MedicalRecordABI,  s);

const claimContract = (s = getSigner()) =>
  new ethers.Contract(process.env.INSURANCE_CLAIM_ADDRESS, InsuranceClaimABI, s);

async function addRecordOnChain(patientAddress, ipfsCid) {
  const tx = await medContract().addRecord(patientAddress, ipfsCid);
  const r  = await tx.wait();
  return { txHash: r.hash, blockNumber: r.blockNumber };
}

async function getRecordsFromChain(patientAddress) {
  const [cids, doctors, timestamps] =
    await medContract(getProvider()).getRecords(patientAddress);
  return cids.map((cid, i) => ({
    ipfsCid:   cid,
    doctor:    doctors[i],
    timestamp: Number(timestamps[i]) * 1000,
  }));
}

async function verifyRecordOnChain(patientAddress, cid) {
  return medContract(getProvider()).verifyRecord(patientAddress, cid);
}

async function submitClaimOnChain(patientAddress, claimId, amount, ipfsCid) {
  const tx = await claimContract().submitClaim(patientAddress, claimId, amount, ipfsCid);
  const r  = await tx.wait();
  return { txHash: r.hash, blockNumber: r.blockNumber };
}

async function approveClaimOnChain(claimId) {
  const tx = await claimContract().approveClaim(claimId);
  const r  = await tx.wait();
  return { txHash: r.hash };
}

async function rejectClaimOnChain(claimId, reasonHash) {
  const tx = await claimContract().rejectClaim(claimId, reasonHash);
  const r  = await tx.wait();
  return { txHash: r.hash };
}

async function getClaimFromChain(claimId) {
  const d = await claimContract(getProvider()).getClaim(claimId);
  return {
    patientAddress: d[0],
    amount:         d[1].toString(),
    status:         ['pending', 'approved', 'rejected', 'under_review'][Number(d[2])],
    ipfsCid:        d[3],
    reasonHash:     d[4],
    submittedAt:    Number(d[5]) * 1000,
    resolvedAt:     Number(d[6]) * 1000,
  };
}

module.exports = {
  addRecordOnChain,
  getRecordsFromChain,
  verifyRecordOnChain,
  submitClaimOnChain,
  approveClaimOnChain,
  rejectClaimOnChain,
  getClaimFromChain,
};