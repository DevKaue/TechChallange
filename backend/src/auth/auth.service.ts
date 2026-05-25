import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  async loginAdmin() {
    const payload = { sub: 'admin-123', role: 'admin' };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
