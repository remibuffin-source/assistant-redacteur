-- Migration : Ajouter la colonne iv à la table api_keys
-- Date : 2025-12-06
-- Description : Ajoute la colonne iv (Initialization Vector) pour le chiffrement AES-256-CBC

-- Vérifier si la colonne existe déjà
SET @dbname = DATABASE();
SET @tablename = 'api_keys';
SET @columnname = 'iv';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (table_name = @tablename)
      AND (table_schema = @dbname)
      AND (column_name = @columnname)
  ) > 0,
  'SELECT 1',
  CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN ', @columnname, ' VARCHAR(255) AFTER encryptedKey')
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Note : Les clés existantes devront être re-saisies car elles n'ont pas d'IV
-- Ou on peut générer un IV par défaut (moins sécurisé mais permet de garder les clés)
