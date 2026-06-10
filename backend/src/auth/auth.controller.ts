import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import {
  AuthenticatedUserDto,
  LoginResponseDto,
} from './dto/login-response.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import type { RequestWithUser } from './authenticated-user.interface';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiCreatedResponse({ type: LoginResponseDto })
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('login-admin')
  @ApiCreatedResponse({ type: LoginResponseDto })
  loginAdmin(@Body() loginDto: LoginDto) {
    return this.authService.loginAdmin(loginDto);
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
