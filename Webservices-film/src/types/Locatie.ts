import type { ListResponse } from './common';

export interface Locatie {
  LocatieID: number;
  Straat: string;
  Stad: string;
  Land: string;
  Foto: string | null;
}

export interface LocatieCreateInput{
  Straat: string;
  Stad: string;
  Land: string;
  Foto: string | null;
}

export interface LocatieUpdateInput extends LocatieCreateInput{}

export interface CreateLocatieRequest extends LocatieCreateInput{}
export interface UpdateLocatieRequest extends LocatieUpdateInput{}

export interface GetAllLocatiesResponse extends ListResponse<Locatie> {}
export interface GetLocatieByIdResponse extends Locatie {}
export interface CreateLocatieResponse extends GetLocatieByIdResponse {}
export interface UpdateLocatieResponse extends GetLocatieByIdResponse {}
