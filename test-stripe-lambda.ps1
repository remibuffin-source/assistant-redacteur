$body = @{
    amount = 10.00
    userEmail = "test@example.com"
} | ConvertTo-Json

Write-Host "Test création PaymentIntent..." -ForegroundColor Yellow

try {
    $response = Invoke-WebRequest -Uri "https://i7owk63g2bogrvvws67nq2f2we0mjkra.lambda-url.eu-west-1.on.aws/api/create-payment-intent" -Method Post -Body $body -ContentType "application/json"
    
    Write-Host "`n✅ Status Code: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "Response:" -ForegroundColor Cyan
    $content = $response.Content | ConvertFrom-Json
    Write-Host "Client Secret: $($content.clientSecret)"
    Write-Host "Payment Intent ID: $($content.paymentIntentId)"
    
} catch {
    Write-Host "`n❌ Erreur:" -ForegroundColor Red
    Write-Host $_.Exception.Message
}
