$files = @(
    "src\App.tsx",
    "src\main.tsx",
    "src\contexts\AuthContext.tsx",
    "src\config\navigation\navigation.types.ts",
    "src\config\navigation\platform-admin.navigation.ts",
    "src\components\layout\GlobalHeader.tsx",
    "src\components\layout\PrimaryNavigation.tsx",
    "src\components\layout\ContextualSidebar.tsx",
    "src\components\layout\Workspace.tsx",
    "src\types\auth.ts"
)

foreach ($file in $files) {
    Write-Output "`n`n========== $file =========="
    Get-Content $file
}