import { prisma } from '../data';
import type { Persoon, PersoonCreateInput /*,PersoonUpdateInput*/} from '../types/persoon';
import handleDBError from './_handleDBError';
import ServiceError from '../core/serviceError';
import Role from '../core/roles';

const PERSOON_SELECT = {
  PersoonID: true,
  Voornaam: true, 
  Achternaam: true, 
  GeboorteDatum: true, 
  Land: true,

};
export const getAll = async (): Promise<Persoon[]> => {
  return prisma.persoon.findMany();
};

export const getById = async (PersoonID: number) => {
  const persoon = await prisma.persoon.findUnique({
    where: {
      PersoonID,
    },
    include: {
      Rollen: {
        select: {
          Rol:true, 
          Film: {
            select: {
              Naam: true,  // Only select the 'Naam' of the Film
            },
          },
        },
      },
    },
  });

  if (!persoon) {
    throw ServiceError.notFound('No person with this id exists');
  }
  return persoon ;
};

export const create = async(persoon: PersoonCreateInput): Promise<Persoon> => {
  try{
    return await prisma.persoon.create({
      data: {
        Voornaam: persoon.Voornaam,      
        Achternaam: persoon.Achternaam,       
        GeboorteDatum: persoon.GeboorteDatum,      
        Land: persoon.Land,     
      },
      select: PERSOON_SELECT,
    });
  } catch(error:any){
    throw handleDBError(error);
  }
};
const deletePersonRelations = async (persoonID: number) => {
  await prisma.film_Acteur.deleteMany({
    where: {
      PersoonID: persoonID,
    },
  });

};
export const deleteById = async (PersoonID: number, roles:string[]): Promise<void>  => {
  if(!roles.includes(Role.ADMIN)){
    throw ServiceError.forbidden('You are not allowed to do this action');
  }

  await deletePersonRelations(PersoonID);
  await prisma.persoon.delete({
    where: {
      PersoonID,
    },
  });
};
