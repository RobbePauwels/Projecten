import ServiceError from '../core/serviceError';
import { prisma } from '../data';
import type { Locatie, LocatieCreateInput /*, LocatieUpdateInput*/} from '../types/Locatie';
import Role from '../core/roles';

export const getAll = async():Promise<Locatie[]> => {
  return prisma.locatie.findMany();
};

export const getById = async (LocatieID: number) => {
  const place = await prisma.locatie.findUnique({
    where: {
      LocatieID,
    },
    include: {
      Films: {
        select: {
          Film: {
            select: {
              Naam: true,  
            },
          },
        },
      },
    },
  });

  if (!place) {
    throw ServiceError.notFound('Er bestaat geen locatie met dit ID');
  }

  return place;
};

export const create =async (locatie: LocatieCreateInput): Promise<Locatie> => {
  return prisma.locatie.create({
    data: {
      Straat : locatie.Straat,
      Stad: locatie.Stad, 
      Land: locatie.Land, 
      Foto: '',     
    },
  });
};

export const deleteById = async (LocatieID: number, roles:string[]):Promise<void> => {
  if(!roles.includes(Role.ADMIN)){
    throw ServiceError.forbidden('You are not allowed to do this action');
  }
  await prisma.locatie.delete({
    where: {
      LocatieID,
    },
  });
};
