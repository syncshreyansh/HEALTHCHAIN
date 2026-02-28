const { expect } = require('chai');
const { ethers }  = require('hardhat');

describe('MedicalRecord', function () {
  let contract, owner, doctor, patient, stranger;

  beforeEach(async function () {
    [owner, doctor, patient, stranger] = await ethers.getSigners();
    const Factory = await ethers.getContractFactory('MedicalRecord');
    contract = await Factory.deploy();
  });

  it('has correct owner', async function () {
    expect(await contract.owner()).to.equal(owner.address);
  });

  it('authorises a doctor', async function () {
    await contract.authoriseDoctor(doctor.address);
    expect(await contract.authorisedDoctors(doctor.address)).to.be.true;
  });

  it('blocks stranger from adding record', async function () {
    await expect(
      contract.connect(stranger).addRecord(patient.address, 'QmFake')
    ).to.be.reverted;
  });

  it('allows authorised doctor to add record', async function () {
    await contract.authoriseDoctor(doctor.address);
    await contract.connect(doctor).addRecord(patient.address, 'QmReal');
    expect(await contract.getRecordCount(patient.address)).to.equal(1);
  });

  it('verifies an existing record', async function () {
    await contract.authoriseDoctor(doctor.address);
    await contract.connect(doctor).addRecord(patient.address, 'QmTest');
    expect(await contract.verifyRecord(patient.address, 'QmTest')).to.be.true;
  });

  it('does not verify non-existent record', async function () {
    expect(await contract.verifyRecord(patient.address, 'QmFake')).to.be.false;
  });
});

describe('InsuranceClaim', function () {
  let contract, owner, insurer, patient;

  beforeEach(async function () {
    [owner, insurer, patient] = await ethers.getSigners();
    const Factory = await ethers.getContractFactory('InsuranceClaim');
    contract = await Factory.deploy();
    await contract.authoriseInsurer(insurer.address);
  });

  it('submits a claim', async function () {
    await contract.submitClaim(patient.address, 'c001', 1000, 'QmCID');
    const c = await contract.getClaim('c001');
    expect(c[0]).to.equal(patient.address);
    expect(c[2]).to.equal(0); // Pending
  });

  it('blocks duplicate claim IDs', async function () {
    await contract.submitClaim(patient.address, 'c002', 1000, 'CID');
    await expect(
      contract.submitClaim(patient.address, 'c002', 1000, 'CID')
    ).to.be.reverted;
  });

  it('insurer approves claim', async function () {
    await contract.submitClaim(patient.address, 'c003', 2000, 'CID');
    await contract.connect(insurer).approveClaim('c003');
    expect((await contract.getClaim('c003'))[2]).to.equal(1); // Approved
  });

  it('insurer rejects claim with reason', async function () {
    await contract.submitClaim(patient.address, 'c004', 3000, 'CID');
    await contract.connect(insurer).rejectClaim('c004', 'policy_exclusion');
    expect((await contract.getClaim('c004'))[2]).to.equal(2); // Rejected
  });

  it('blocks non-insurer from approving', async function () {
    await contract.submitClaim(patient.address, 'c005', 1000, 'CID');
    await expect(
      contract.connect(patient).approveClaim('c005')
    ).to.be.reverted;
  });
});