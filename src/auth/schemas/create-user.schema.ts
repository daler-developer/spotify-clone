import * as joi from 'joi';
import CreateUserDto from '../dto/create-user.dto';

export default joi.object<CreateUserDto>({
  username: joi.string().required().min(3).max(20),
  password: joi.string().required().min(3).max(20),
});
