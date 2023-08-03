import {
  applyDecorators,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  SetMetadata,
  UseGuards,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

type IRequirement = (user: { role: string }) => Promise<boolean> | boolean;

export interface User {
  role: string;
  email: string;
}

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  async canActivate(context: ExecutionContext) {
    const user: User = { role: 'user', email: 'sebviaene+1@gmail.com' };

    const requirements =
      this.reflector.get<IRequirement[]>(
        'requirements',
        context.getHandler(),
      ) || [];

    await handleRequirements(requirements, user);
    return true;
  }
}

export function Authorized(
  requirements: (IRequirement | IRequirement[])[] | IRequirement,
) {
  return applyDecorators(
    SetMetadata('requirements', requirements),
    UseGuards(AuthGuard),
  );
}

export const handleRequirements = async (
  requirements: (IRequirement | IRequirement[])[] | IRequirement,
  user: User,
): Promise<boolean> => {
  const list = Array.isArray(requirements) ? requirements : [requirements];

  const functionsToValidate = list.map((item) => async () => {
    const items = Array.isArray(item) ? item : [item];
    await Promise.all(items.map((r) => r(user)));
  });

  if (!functionsToValidate?.length) return false;

  await promiseAny(functionsToValidate);
};

const promiseAny = async (
  functionsToValidate: ((() => Promise<void>) | (() => void))[],
) => {
  const errors = [];
  if (!functionsToValidate?.length) return;
  await new Promise((res, rej) => {
    functionsToValidate.map(async (validationFunc) => {
      try {
        const v = await validationFunc();
        res(v);
      } catch (error) {
        errors.push(error);
        if (errors.length !== functionsToValidate.length) return;
        rej(
          new ForbiddenException(
            'forbidden',
            errors.map((e) => e.message).join(', '),
          ),
        );
      }
    });
  });
};
