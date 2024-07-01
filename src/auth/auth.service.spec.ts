import { Test, TestingModule } from "@nestjs/testing";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { UserService } from "../users/users.service"; // Import the UserService heres
import { InvitationService } from "../invitations/invitations.service";
import { Model } from "mongoose";
import { User } from "../users/users.entity";
import { Invitation } from "../invitations/invitations.entity";

describe("AuthService", () => {
  let service: AuthService;

  beforeEach(async () => {
    const userModelMock: Model<User> = {} as any;
    const invitationModelMock: Model<Invitation> = {} as any;
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [AuthService, UserService, {
        provide: 'UserModel', // Use the same token as the UserService's dependency
        useValue: userModelMock,
      }, InvitationService, {
        provide: 'InvitationModel', // Use the same token as the UserService's dependency
        useValue: invitationModelMock,
      },],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
