import * as joi from 'joi';

export default joi.object({
  commentId: joi.number().required(),
});
