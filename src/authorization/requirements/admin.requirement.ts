import { ForbiddenException } from '@nestjs/common';
import { User } from '../auth.guard';

export const adminRequirement = ({ role }: User) => {
  if (role !== 'admin') throw new ForbiddenException('adminRequirementFail');
  return true;
};
