import * as joi from 'joi';

export default joi.object({
  offset: joi.number().default(0),
});
