export interface ForgotPasswordDto {
    email: string;
}

export interface ResetPasswordDto {
    email: string;
    token: string;
    password: string;
}

export interface VerificationCodeDto {
    email: string;
    code: string;
}