$info = @{
    ComputerName = $env:COMPUTERNAME
    OSVersion = (Get-WmiObject -Class Win32_OperatingSystem).Caption
    LastBoot = (Get-CimInstance -ClassName Win32_OperatingSystem).LastBootUpTime
    LastUpdate = (Get-HotFix | Sort-Object InstalledOn)[-1].InstalledOn
    UserName = $env:USERNAME
}

$json = $info | ConvertTo-Json -Compress

Invoke-RestMethod -Uri "http://192.168.1.6:8010/system-info" `
    -Method POST `
    -Body $json `
    -ContentType "application/json"
