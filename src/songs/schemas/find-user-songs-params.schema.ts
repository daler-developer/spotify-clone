import * as joi from 'joi';

export default joi.object({
  userId: joi.number().required(),
});
