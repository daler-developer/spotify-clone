import * as joi from 'joi';

export default joi.object({
  artist: joi.string().required().min(1).max(20),
  name: joi.string().required().min(1).max(20),
});
