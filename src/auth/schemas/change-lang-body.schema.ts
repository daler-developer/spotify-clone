import * as joi from 'joi';

export default joi.object({
  lang: joi.allow('RU', 'EN').required(),
});
