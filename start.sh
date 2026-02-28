#!/bin/bash

echo "🔧 Installing dependencies..."
cd blockchain && npm install
cd ../backend && npm install

echo "⛓️ Compiling contracts..."
cd ../blockchain && npm run compile

echo "🚀 Starting local blockchain..."
npx hardhat node &
HARDHAT_PID=$!

echo "⏳ Waiting for blockchain to start..."
sleep 4

echo "📦 Deploying contracts..."
npx hardhat run scripts/deploy.js --network localhost

echo "🌐 Starting backend + frontend..."
cd ../backend && npm run dev

# Cleanup on exit
trap "kill $HARDHAT_PID" EXIT