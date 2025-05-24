import { prisma } from '../data';
import type { Awards, AwardsCreateInput } from '../types/award';
import handleDBError from './_handleDBError';
import ServiceError from '../core/serviceError';
import Role from '../core/roles';

const AWARD_SELECT = {
  AwardID: true,
  Naam: true,
  Jaar: true,
  FilmID: true,
};

export const getAll = async (): Promise<Awards[]> => {
  return prisma.awards.findMany();
};

export const getById = async (AwardID: number) => {
  const award = await prisma.awards.findUnique({
    where: {
      AwardID,
    },
  });

  if (!award) {
    throw  ServiceError.notFound('Er bestaat geen award met dit ID');
  }

  return award;
};

export const create = async (award: AwardsCreateInput): Promise<Awards> => {
  try {
    return await prisma.awards.create({
      data: {
        Naam: award.Naam,
        Jaar: award.Jaar,
        FilmID: award.FilmID,
      },
      select: AWARD_SELECT,
    });
  } catch (error: any) {
    throw handleDBError(error);
  }
};

export const deleteById = async (AwardID: number, roles:string[]): Promise<void> => {
  if(!roles.includes(Role.ADMIN)){
    throw ServiceError.forbidden('You are not allowed to do this action');
  }
  await prisma.awards.delete({
    where: {
      AwardID,
    },
  });
};
