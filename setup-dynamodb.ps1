# Script de création de la table DynamoDB pour l'authentification
# Nécessite AWS CLI configuré

$TABLE_NAME = "assistant-redacteur-users"
$REGION = "eu-west-1"

Write-Host "🗄️ Configuration DynamoDB..." -ForegroundColor Cyan
Write-Host ""

# Désactiver le pager AWS
$env:AWS_PAGER = ""

# Vérifier si la table existe
Write-Host "Vérification de l'existence de la table..." -ForegroundColor Yellow
$tables = aws dynamodb list-tables --region $REGION --output json 2>&1 | ConvertFrom-Json

if ($tables.TableNames -contains $TABLE_NAME) {
    Write-Host "✅ La table '$TABLE_NAME' existe déjà!" -ForegroundColor Green
    
    # Afficher les détails de la table
    Write-Host ""
    Write-Host "Détails de la table:" -ForegroundColor Cyan
    aws dynamodb describe-table --table-name $TABLE_NAME --region $REGION --output json | ConvertFrom-Json | Select-Object -ExpandProperty Table | Select-Object TableName, TableStatus, ItemCount
} else {
    Write-Host "❌ La table '$TABLE_NAME' n'existe pas" -ForegroundColor Red
    Write-Host ""
    Write-Host "Création de la table..." -ForegroundColor Yellow
    
    # Créer la table
    aws dynamodb create-table `
        --table-name $TABLE_NAME `
        --attribute-definitions `
            AttributeName=email,AttributeType=S `
        --key-schema `
            AttributeName=email,KeyType=HASH `
        --billing-mode PAY_PER_REQUEST `
        --region $REGION
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Table créée avec succès!" -ForegroundColor Green
        Write-Host ""
        Write-Host "Attente de l'activation de la table..." -ForegroundColor Yellow
        
        # Attendre que la table soit active
        aws dynamodb wait table-exists --table-name $TABLE_NAME --region $REGION
        
        Write-Host "✅ Table active et prête à l'emploi!" -ForegroundColor Green
    } else {
        Write-Host "❌ Erreur lors de la création de la table" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "📋 Prochaine étape: Créer un utilisateur admin" -ForegroundColor Cyan
Write-Host "Exécutez: .\create-admin-user.ps1" -ForegroundColor Yellow
