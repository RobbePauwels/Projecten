import type { ListResponse } from './common';

export interface Persoon {
  PersoonID: number;
  Voornaam: string;
  Achternaam: string;
  GeboorteDatum: string;
  Land: string;
}

export interface PersoonCreateInput{
  Voornaam: string;
  Achternaam: string;
  GeboorteDatum: string;
  Land: string;
}

export interface PersoonUpdateInput extends PersoonCreateInput{}

export interface CreatePersoonRequest extends PersoonCreateInput{}
export interface UpdatePersoonRequest extends PersoonUpdateInput{}

export interface GetAllPersonenResponse extends ListResponse<Persoon> {}
export interface GetPersoonByIdResponse extends Persoon {}
export interface CreatePersoonResponse extends GetPersoonByIdResponse {}
export interface UpdatePersoonResponse extends GetPersoonByIdResponse {}
