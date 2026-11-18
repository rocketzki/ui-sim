# Simple alias script for Python logs
# Usage: .\logs.ps1 [-Follow|-f]

param(
    [switch]$Follow,
    [switch]$f
)

if ($Follow -or $f) {
    .\view-python-logs.ps1 -Follow
} else {
    .\view-python-logs.ps1
}
