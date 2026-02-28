// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract InsuranceClaim {

    address public owner;

    enum ClaimStatus { Pending, Approved, Rejected, UnderReview }

    struct Claim {
        address     patientAddress;
        string      claimId;
        uint256     amount;
        ClaimStatus status;
        string      ipfsCid;
        string      reasonHash;
        uint256     submittedAt;
        uint256     resolvedAt;
        bool        exists;
    }

    mapping(string  => Claim) private claims;
    mapping(address => bool)  public  authorisedInsurers;

    event ClaimSubmitted(string indexed claimId, address patient, uint256 amount, uint256 timestamp);
    event ClaimApproved(string indexed claimId, address insurer, uint256 timestamp);
    event ClaimRejected(string indexed claimId, address insurer, string reasonHash, uint256 timestamp);
    event InsurerAuthorised(address indexed insurer);

    modifier onlyOwner()                        { require(msg.sender == owner, "not owner"); _; }
    modifier onlyInsurer()                       { require(authorisedInsurers[msg.sender], "not authorised insurer"); _; }
    modifier claimExists(string calldata id)     { require(claims[id].exists, "claim not found"); _; }

    constructor() {
        owner = msg.sender;
        authorisedInsurers[msg.sender] = true;
    }

    function authoriseInsurer(address _insurer) external onlyOwner {
        authorisedInsurers[_insurer] = true;
        emit InsurerAuthorised(_insurer);
    }

    function submitClaim(
        address        _patient,
        string calldata _claimId,
        uint256         _amount,
        string calldata _ipfsCid
    ) external {
        require(!claims[_claimId].exists, "claim ID already exists");
        claims[_claimId] = Claim({
            patientAddress: _patient,
            claimId:        _claimId,
            amount:         _amount,
            status:         ClaimStatus.Pending,
            ipfsCid:        _ipfsCid,
            reasonHash:     "",
            submittedAt:    block.timestamp,
            resolvedAt:     0,
            exists:         true
        });
        emit ClaimSubmitted(_claimId, _patient, _amount, block.timestamp);
    }

    function approveClaim(string calldata _claimId)
        external onlyInsurer claimExists(_claimId)
    {
        Claim storage c = claims[_claimId];
        require(c.status != ClaimStatus.Approved, "already approved");
        c.status     = ClaimStatus.Approved;
        c.resolvedAt = block.timestamp;
        emit ClaimApproved(_claimId, msg.sender, block.timestamp);
    }

    function rejectClaim(string calldata _claimId, string calldata _reasonHash)
        external onlyInsurer claimExists(_claimId)
    {
        Claim storage c = claims[_claimId];
        require(c.status != ClaimStatus.Rejected, "already rejected");
        c.status     = ClaimStatus.Rejected;
        c.reasonHash = _reasonHash;
        c.resolvedAt = block.timestamp;
        emit ClaimRejected(_claimId, msg.sender, _reasonHash, block.timestamp);
    }

    function getClaim(string calldata _claimId)
        external view claimExists(_claimId)
        returns (
            address patientAddress,
            uint256 amount,
            uint8   status,
            string memory ipfsCid,
            string memory reasonHash,
            uint256 submittedAt,
            uint256 resolvedAt
        )
    {
        Claim storage c = claims[_claimId];
        return (
            c.patientAddress,
            c.amount,
            uint8(c.status),
            c.ipfsCid,
            c.reasonHash,
            c.submittedAt,
            c.resolvedAt
        );
    }
}