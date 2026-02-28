const axios    = require('axios');
const FormData = require('form-data');

const BASE    = 'https://api.pinata.cloud';
const gateway = () => process.env.PINATA_GATEWAY || 'https://gateway.pinata.cloud/ipfs';

const headers = () => ({
  pinata_api_key:        process.env.PINATA_API_KEY,
  pinata_secret_api_key: process.env.PINATA_API_SECRET,
});

async function uploadJSON(data, name = 'healthchain-record') {
  const res = await axios.post(
    `${BASE}/pinning/pinJSONToIPFS`,
    { pinataContent: data, pinataMetadata: { name } },
    { headers: headers() }
  );
  return res.data.IpfsHash;
}

async function uploadBuffer(buffer, filename = 'record.bin') {
  const form = new FormData();
  form.append('file', buffer, { filename });
  form.append('pinataMetadata', JSON.stringify({ name: filename }));
  const res = await axios.post(`${BASE}/pinning/pinFileToIPFS`, form, {
    headers: { ...form.getHeaders(), ...headers() },
  });
  return res.data.IpfsHash;
}

async function fetchFromIPFS(cid) {
  const res = await axios.get(`${gateway()}/${cid}`);
  return res.data;
}

module.exports = { uploadJSON, uploadBuffer, fetchFromIPFS };