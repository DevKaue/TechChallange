import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
import { JwtAuthGuard } from '@/access-identity/infra/guards/jwt-auth.guard';
import LoginController from '@/access-identity/presentation/controllers/login.controller';
import LoginAdminController from '@/access-identity/presentation/controllers/login-admin.controller';
import GetAuthenticatedUserController, {
  AuthenticatedUserResponse,
} from '@/access-identity/presentation/controllers/get-authenticated-user.controller';
import type { RequestWithUser } from '@/access-identity/presentation/interfaces/authenticated-user.interface';
import { adaptNestRoute } from '@/common/presentation/adapters/nest-route.adapter';
import { DomainExceptionFilter } from '@/common/infra/filters/domain-exception.filter';
import { LoginDto } from '@/access-identity/presentation/dto/login.dto';
import {
  AuthApiControllerDocs,
  AuthApiLoginAdminDocs,
  AuthApiLoginDocs,
  AuthApiMeDocs,
} from '@/access-identity/infra/swaggers/auth-routes.swagger';
import type { LoginUseCaseOutput } from '@/access-identity/application/usecases/login.usecase';

@AuthApiControllerDocs()
@Controller('auth')
@UseFilters(DomainExceptionFilter)
export class AuthInfraController {
  constructor(
    private readonly loginController: LoginController,
    private readonly loginAdminController: LoginAdminController,
    private readonly getAuthenticatedUserController: GetAuthenticatedUserController,
  ) {}

  @Post('login')
  @AuthApiLoginDocs()
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<LoginUseCaseOutput> {
    const httpResponse = await adaptNestRoute(this.loginController, {
      body: loginDto,
      params: undefined,
      query: undefined,
    });

    res.status(httpResponse.statusCode);

    return httpResponse.body;
  }

  @Post('login-admin')
  @AuthApiLoginAdminDocs()
  async loginAdmin(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<LoginUseCaseOutput> {
    const httpResponse = await adaptNestRoute(this.loginAdminController, {
      body: loginDto,
      params: undefined,
      query: undefined,
    });

    res.status(httpResponse.statusCode);

    return httpResponse.body;
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @AuthApiMeDocs()
  async me(
    @Req() request: RequestWithUser,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthenticatedUserResponse> {
    const httpResponse = await adaptNestRoute(this.getAuthenticatedUserController, {
      body: request.user,
      params: undefined,
      query: undefined,
    });

    res.status(httpResponse.statusCode);

    return httpResponse.body;
  }
}
