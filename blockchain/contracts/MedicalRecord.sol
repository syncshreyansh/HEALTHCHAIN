// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract MedicalRecord {

    address public owner;

    struct Record {
        string  ipfsCid;
        address doctorAddress;
        uint256 timestamp;
        bool    exists;
    }

    mapping(address => Record[]) private patientRecords;
    mapping(address => bool)     public  authorisedDoctors;

    event RecordAdded(address indexed patient, string ipfsCid, address doctor, uint256 timestamp);
    event DoctorAuthorised(address indexed doctor);
    event DoctorRevoked(address indexed doctor);

    modifier onlyOwner()  { require(msg.sender == owner, "not owner"); _; }
    modifier onlyDoctor() { require(authorisedDoctors[msg.sender], "not authorised doctor"); _; }

    constructor() { owner = msg.sender; }

    function authoriseDoctor(address _doctor) external onlyOwner {
        authorisedDoctors[_doctor] = true;
        emit DoctorAuthorised(_doctor);
    }

    function revokeDoctor(address _doctor) external onlyOwner {
        authorisedDoctors[_doctor] = false;
        emit DoctorRevoked(_doctor);
    }

    function addRecord(address _patient, string calldata _ipfsCid) external onlyDoctor {
        patientRecords[_patient].push(Record({
            ipfsCid:       _ipfsCid,
            doctorAddress: msg.sender,
            timestamp:     block.timestamp,
            exists:        true
        }));
        emit RecordAdded(_patient, _ipfsCid, msg.sender, block.timestamp);
    }

    function getRecords(address _patient)
        external view
        returns (
            string[]  memory cids,
            address[] memory doctors,
            uint256[] memory timestamps
        )
    {
        uint256 len = patientRecords[_patient].length;
        cids       = new string[](len);
        doctors    = new address[](len);
        timestamps = new uint256[](len);

        for (uint256 i = 0; i < len; i++) {
            cids[i]       = patientRecords[_patient][i].ipfsCid;
            doctors[i]    = patientRecords[_patient][i].doctorAddress;
            timestamps[i] = patientRecords[_patient][i].timestamp;
        }
    }

    function verifyRecord(address _patient, string calldata _ipfsCid)
        external view returns (bool)
    {
        for (uint256 i = 0; i < patientRecords[_patient].length; i++) {
            if (keccak256(bytes(patientRecords[_patient][i].ipfsCid))
                == keccak256(bytes(_ipfsCid))) return true;
        }
        return false;
    }

    function getRecordCount(address _patient) external view returns (uint256) {
        return patientRecords[_patient].length;
    }
}