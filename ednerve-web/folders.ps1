$directories = @(
    "src\app",
    "src\layouts",
    "src\layouts\workspaces",
    "src\modules\platform\dashboard",
    "src\modules\platform\tenants\pages",
    "src\authorization"
)

foreach ($directory in $directories) {
    New-Item -ItemType Directory -Force -Path $directory | Out-Null
    Write-Host "Created/verified: $directory"
}