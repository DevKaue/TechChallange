import { JwtService } from '@nestjs/jwt';
export declare class AuthService {
    private jwtService;
    constructor(jwtService: JwtService);
    loginAdmin(): Promise<{
        access_token: string;
    }>;
}
