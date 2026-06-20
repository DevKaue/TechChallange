import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import camelcaseKeys from 'camelcase-keys';

export const BodyCamelCase = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    // Pega o body em snake_case e converte as chaves para camelCase na memória
    return camelcaseKeys(request.body, { deep: true });
  },
);