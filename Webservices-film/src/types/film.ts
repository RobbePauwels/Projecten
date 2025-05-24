import type { ListResponse } from './common';

export interface Film {
  FilmID: number;
  Naam: string;
  Jaar: string;
  Duur: string;
  Genre: string;
  Rating: string;
  RegisseurID: number | null;
}

export interface Films{
  FilmID: number;
  Naam: string;
  Jaar: string;
  Duur: string;
  Genre: string;
  Rating: string;
  RegisseurID: number | null;
}
  
export interface Award {
  AwardID: number;
  Naam: string;
  Jaar: string;
  FilmID: number;
}
  
export interface FilmActeur {
  FilmID: number;
  PersoonID: number;
  Rol: string;
  Persoon: Persoon;
}
  
export interface FilmLocatie {
  FilmID: number;
  LocatieID: number;
  Locatie: Locatie;
}
  
export interface Persoon {
  PersoonID: number;
  Voornaam: string;
  Achternaam: string;
  GeboorteDatum: string;
  Land: string;
}
  
export interface Locatie {
  LocatieID: number;
  Straat: string;
  Stad: string;
  Land: string;
  Foto: string | null;
}

export interface FilmCreateInput {
  Naam: string;
  Jaar: string;
  Duur: string;
  Genre: string;
  Rating: string;
  RegisseurID: number;
}

export interface FilmUpdateInput {
  Naam: string;
  Jaar: string;
  Duur: string;
  Genre: string;
  Rating: string;
  RegisseurID: number;
  Acteurs?: {
    PersoonID?: number; // Optioneel, voor bestaande acteurs
    Voornaam?: string; // Vereist voor nieuwe acteurs
    Achternaam?: string; // Vereist voor nieuwe acteurs
    GeboorteDatum?: string; // Vereist voor nieuwe acteurs
    Land?: string; // Vereist voor nieuwe acteurs
    Rol: string; // Rol is altijd verplicht
  }[];
  Awards?: { Naam: string; Jaar: string }[];
  Locaties?: { Straat: string; Stad: string; Land: string }[];
}

export interface CreateFilmRequest extends FilmCreateInput{}
export interface UpdateFilmRequest extends FilmUpdateInput{}

export interface GetAllFilmsResponse extends ListResponse<Films> {}
export interface GetFilmByIdResponse extends Films {}
export interface CreateFilmResponse extends GetFilmByIdResponse {}
export interface UpdateFilmResponse extends GetFilmByIdResponse {}
