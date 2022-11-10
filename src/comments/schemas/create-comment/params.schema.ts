import * as joi from 'joi';

export default joi.object({
  songId: joi.number().required(),
});
