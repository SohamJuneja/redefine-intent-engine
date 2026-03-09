Stop-Process -Name node -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2
Write-Host "All node processes killed"
$conn = Get-NetTCPConnection -LocalPort 3001 -ErrorAction SilentlyContinue
if ($conn) { Write-Host "WARNING: Port 3001 still in use by PID $($conn.OwningProcess)" }
else { Write-Host "Port 3001 is free" }
