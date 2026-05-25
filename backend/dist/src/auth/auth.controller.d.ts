import { AuthService } from './auth.service';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    loginAdmin(): Promise<{
        access_token: string;
    }>;
}
