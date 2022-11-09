import * as joi from 'joi';

export default joi.object({
  name: joi.string().required().min(3).max(20),
});
