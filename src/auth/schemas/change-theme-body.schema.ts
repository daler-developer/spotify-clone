import * as joi from 'joi';

export default joi.object({
  theme: joi.allow('LIGHT', 'DARK').required(),
});
