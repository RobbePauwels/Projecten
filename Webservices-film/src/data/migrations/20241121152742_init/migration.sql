-- AlterTable
ALTER TABLE `Films` ADD COLUMN `RegisseurID` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `Films` ADD CONSTRAINT `Films_RegisseurID_fkey` FOREIGN KEY (`RegisseurID`) REFERENCES `Persoon`(`PersoonID`) ON DELETE SET NULL ON UPDATE CASCADE;
