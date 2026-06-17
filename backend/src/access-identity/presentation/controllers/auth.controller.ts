import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { LoginUseCase } from '../../application/usecases/login.usecase';
import { LoginDto } from '../dto/login.dto';
import {
  AuthenticatedUserDto,
  LoginResponseDto,
} from '../dto/login-response.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import type { RequestWithUser } from '../interfaces/authenticated-user.interface';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly loginUseCase: LoginUseCase) {}

  @Post('login')
  @ApiCreatedResponse({ type: LoginResponseDto })
  login(@Body() loginDto: LoginDto) {
    return this.loginUseCase.execute(loginDto);
  }

  @Post('login-admin')
  @ApiCreatedResponse({ type: LoginResponseDto })
  loginAdmin(@Body() loginDto: LoginDto) {
    return this.loginUseCase.execute(loginDto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ type: AuthenticatedUserDto })
  me(@Req() request: RequestWithUser): AuthenticatedUserDto {
    return {
      id: request.user.userId,
      name: request.user.name,
      email: request.user.email,
      role: request.user.role,
    };
  }
}
