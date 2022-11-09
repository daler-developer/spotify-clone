import * as joi from 'joi';

export default joi.object<{ username: string; password: string }>({
  username: joi.string().required().min(3).max(20),
});
