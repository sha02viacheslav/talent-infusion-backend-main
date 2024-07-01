import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, VerifiedCallback } from "passport-jwt";
import { Strategy } from "passport-jwt";
import { getJWTConfig } from "../config";
import { AuthService } from "./auth.service";
const jwtConfig = getJWTConfig();

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: jwtConfig.secretkey,
    });
  }

  async validate(payload: any, done: VerifiedCallback) {
    const user = await this.authService.validateUser(payload);
    if (!user) {
      return done(
        new HttpException("Unauthorized access", HttpStatus.UNAUTHORIZED),
        false
      );
    }

    return done(null, user, payload.iat);
  }
}
