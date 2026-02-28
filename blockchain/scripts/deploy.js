const { ethers } = require('hardhat');
const fs   = require('fs');
const path = require('path');

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log('Deploying with account:', deployer.address);

  // Deploy MedicalRecord
  console.log('\n📄 Deploying MedicalRecord...');
  const MedicalRecord = await ethers.getContractFactory('MedicalRecord');
  const mr = await MedicalRecord.deploy();
  await mr.waitForDeployment();
  const mrAddr = await mr.getAddress();
  console.log('✅ MedicalRecord deployed to:', mrAddr);

  // Deploy InsuranceClaim
  console.log('\n📋 Deploying InsuranceClaim...');
  const InsuranceClaim = await ethers.getContractFactory('InsuranceClaim');
  const ic = await InsuranceClaim.deploy();
  await ic.waitForDeployment();
  const icAddr = await ic.getAddress();
  console.log('✅ InsuranceClaim deployed to:', icAddr);

  // Save addresses
  const out = {
    MedicalRecord:  mrAddr,
    InsuranceClaim: icAddr,
    network:        hre.network.name,
    deployedAt:     new Date().toISOString(),
  };
  fs.writeFileSync(
    path.join(__dirname, '../deployedAddresses.json'),
    JSON.stringify(out, null, 2)
  );

  console.log('\n─────────────────────────────────────────');
  console.log('Add these to backend/.env:');
  console.log(`MEDICAL_RECORD_ADDRESS=${mrAddr}`);
  console.log(`INSURANCE_CLAIM_ADDRESS=${icAddr}`);
  console.log('─────────────────────────────────────────');
}

main().catch(e => { console.error(e); process.exitCode = 1; });