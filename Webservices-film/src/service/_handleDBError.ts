import ServiceError from '../core/serviceError'; 

const handleDBError = (error: any) => {

  const { code = '', message } = error;

  if (code === 'P2002') {
    switch (true) {
      case message.includes('idx_film_naam_unique'):
        throw ServiceError.validationFailed(
          'A film with this name already exists',
        );
      case message.includes('idx_persoon_email_unique'): 
        throw ServiceError.validationFailed(
          'There is already a person with this email address',
        );
      case message.includes('idx_locatie_straat_stad_land_unique'): 
        throw ServiceError.validationFailed(
          'A place with this street, city, and country already exists',
        );
      default:
        throw ServiceError.validationFailed('This item already exists');
    }
  }
  
  if (code === 'P2025') {
    switch (true) {
      case message.includes('fk_film_regisseur'): 
        throw ServiceError.notFound('This director does not exist');
      case message.includes('fk_film_acteur'): 
        throw ServiceError.notFound('This actor does not exist in the film');
      case message.includes('fk_film_locatie'): 
        throw ServiceError.notFound('This location does not exist for the film');
      case message.includes('user'):
        throw ServiceError.notFound('No user with this ID exists');
      case message.includes('film'): 
        throw ServiceError.notFound('No film with this ID exists');
      case message.includes('persoon'):
        throw ServiceError.notFound('No person with this ID exists');
      
    }
  }
  
  if (code === 'P2003') {
    switch (true) {
      case message.includes('film_id'): 
        throw ServiceError.conflict(
          'This film does not exist or is still linked to other records',
        );
      case message.includes('persoon_id'): 
        throw ServiceError.conflict(
          'This person does not exist or is still linked to other films',
        );
      case message.includes('locatie_id'): 
        throw ServiceError.conflict(
          'This location does not exist or is still linked to films',
        );
    }
  }
  
  throw error;
};

export default handleDBError; 
