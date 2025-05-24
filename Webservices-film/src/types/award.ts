import type { ListResponse } from './common';

export interface Awards {
  AwardID: number;
  Naam: string;
  Jaar: string;
  FilmID: number;
}

export interface AwardsCreateInput {
  Naam: string;
  Jaar: string;
  FilmID: number;
}

export interface CreateAwardRequest extends AwardsCreateInput {}

export interface GetAllAwardsResponse extends ListResponse<Awards> {}
export interface GetAwardByIdResponse extends Awards {}
export interface CreateAwardResponse extends GetAwardByIdResponse {}
