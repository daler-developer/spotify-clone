import * as joi from 'joi';

export default joi.object({
  text: joi.string().required().min(3).max(30),
});
