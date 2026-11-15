
Write-Host "`n========== PHP =========="
php -v

Write-Host "`n========== XAMPP PHP =========="
if (Test-Path "C:\xampp\php\php.exe") {
    & "C:\xampp\php\php.exe" -v
} else {
    Write-Host "XAMPP PHP not found"
}

Write-Host "`n========== PHP LOCATION =========="
where.exe php

Write-Host "`n========== COMPOSER =========="
composer --version

Write-Host "`n========== MYSQL =========="
if (Test-Path "C:\xampp\mysql\bin\mysql.exe") {
    & "C:\xampp\mysql\bin\mysql.exe" --version
} else {
    Write-Host "XAMPP MySQL executable not found"
}

Write-Host "`n========== NODE.JS =========="
node --version

Write-Host "`n========== NPM =========="
npm --version

Write-Host "`n========== GIT =========="
git --version

Write-Host "`n========== PROJECT DIRECTORY =========="
Test-Path "C:\xampp\htdocs\EdNerve"

Write-Host "`n========== XAMPP =========="
Test-Path "C:\xampp"
