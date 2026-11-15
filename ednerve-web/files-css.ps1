$files = @(
    "src\pages\auth\LoginPage.tsx",
    "src\App.css",
    "src\index.css"
)

foreach ($file in $files) {
    Write-Output "`n`n========== $file =========="
    Get-Content $file
}