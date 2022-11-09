import * as joi from 'joi';

export default joi.object({
  albumId: joi.number().required(),
});
