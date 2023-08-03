import { ForbiddenException } from '@nestjs/common';
import { User } from '../auth.guard';

export const emailRequirement = ({ email }: User) => {
  if (email !== 'sebviaene@gmail.com')
    throw new ForbiddenException('emailRequirementFail');
  return true;
};
