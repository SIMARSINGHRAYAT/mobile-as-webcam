$CertName = "CN=Development"
$CertPath = ".\cert.pfx"
$CerPath = ".\cert.cer"
$Password = ConvertTo-SecureString -String "password" -Force -AsPlainText

# Generate self-signed certificate
$Cert = New-SelfSignedCertificate -Type Custom -Subject $CertName -KeyUsage DigitalSignature -FriendlyName "MobileAsWebcamDev" -CertStoreLocation "Cert:\CurrentUser\My" -TextExtension @("2.5.29.37={text}1.3.6.1.5.5.7.3.3", "2.5.29.19={text}")

# Export PFX (for electron-builder signing)
Export-PfxCertificate -Cert $Cert -FilePath $CertPath -Password $Password

# Export CER (for user to install as Trusted Root)
Export-Certificate -Cert $Cert -FilePath $CerPath

Write-Host "Certificate generated!"
