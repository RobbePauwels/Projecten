-- CreateTable
CREATE TABLE `Films` (
    `FilmID` INTEGER NOT NULL AUTO_INCREMENT,
    `Naam` VARCHAR(191) NOT NULL,
    `Jaar` VARCHAR(191) NOT NULL,
    `Duur` VARCHAR(191) NOT NULL,
    `Genre` VARCHAR(191) NOT NULL,
    `Rating` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`FilmID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Awards` (
    `AwardID` INTEGER NOT NULL AUTO_INCREMENT,
    `Naam` VARCHAR(191) NOT NULL,
    `Jaar` VARCHAR(191) NOT NULL,
    `FilmID` INTEGER NOT NULL,

    PRIMARY KEY (`AwardID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Persoon` (
    `PersoonID` INTEGER NOT NULL AUTO_INCREMENT,
    `Voornaam` VARCHAR(191) NOT NULL,
    `Achternaam` VARCHAR(191) NOT NULL,
    `GeboorteDatum` VARCHAR(191) NOT NULL,
    `Land` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`PersoonID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Locatie` (
    `LocatieID` INTEGER NOT NULL AUTO_INCREMENT,
    `Straat` VARCHAR(191) NOT NULL,
    `Stad` VARCHAR(191) NOT NULL,
    `Land` VARCHAR(191) NOT NULL,
    `Foto` VARCHAR(191) NULL,

    PRIMARY KEY (`LocatieID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Film_Acteur` (
    `FilmID` INTEGER NOT NULL,
    `PersoonID` INTEGER NOT NULL,
    `Rol` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`FilmID`, `PersoonID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Film_Locatie` (
    `FilmID` INTEGER NOT NULL,
    `LocatieID` INTEGER NOT NULL,

    PRIMARY KEY (`FilmID`, `LocatieID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Awards` ADD CONSTRAINT `Awards_FilmID_fkey` FOREIGN KEY (`FilmID`) REFERENCES `Films`(`FilmID`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Film_Acteur` ADD CONSTRAINT `Film_Acteur_FilmID_fkey` FOREIGN KEY (`FilmID`) REFERENCES `Films`(`FilmID`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Film_Acteur` ADD CONSTRAINT `Film_Acteur_PersoonID_fkey` FOREIGN KEY (`PersoonID`) REFERENCES `Persoon`(`PersoonID`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Film_Locatie` ADD CONSTRAINT `Film_Locatie_FilmID_fkey` FOREIGN KEY (`FilmID`) REFERENCES `Films`(`FilmID`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Film_Locatie` ADD CONSTRAINT `Film_Locatie_LocatieID_fkey` FOREIGN KEY (`LocatieID`) REFERENCES `Locatie`(`LocatieID`) ON DELETE RESTRICT ON UPDATE CASCADE;
