/*
  Warnings:

  - A unique constraint covering the columns `[Naam,Jaar]` on the table `Awards` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[Naam]` on the table `Films` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[Straat,Stad,Land]` on the table `Locatie` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[Voornaam,Achternaam]` on the table `Persoon` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateTable
CREATE TABLE `users` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `Naam` VARCHAR(255) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `Awards_Naam_Jaar_key` ON `Awards`(`Naam`, `Jaar`);

-- CreateIndex
CREATE UNIQUE INDEX `Films_Naam_key` ON `Films`(`Naam`);

-- CreateIndex
CREATE UNIQUE INDEX `Locatie_Straat_Stad_Land_key` ON `Locatie`(`Straat`, `Stad`, `Land`);

-- CreateIndex
CREATE UNIQUE INDEX `Persoon_Voornaam_Achternaam_key` ON `Persoon`(`Voornaam`, `Achternaam`);
