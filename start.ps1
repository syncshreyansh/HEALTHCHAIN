Write-Host "Installing dependencies..."
Set-Location blockchain; npm install
Set-Location ../backend; npm install

Write-Host "Compiling contracts..."
Set-Location ../blockchain; npm run compile

Write-Host "Starting local blockchain..."
Start-Process powershell -ArgumentList "cd '$PWD/../blockchain'; npx hardhat node"

Write-Host "Waiting for blockchain to start..."
Start-Sleep -Seconds 4

Write-Host "Deploying contracts..."
Set-Location ../blockchain; npx hardhat run scripts/deploy.js --network localhost

Write-Host "Starting backend..."
Set-Location ../backend; npm run dev