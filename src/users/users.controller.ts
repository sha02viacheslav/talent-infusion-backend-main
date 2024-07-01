import {
  Controller,
  Get,
  Put,
  Delete,
  Body,
  Param,
  BadRequestException,
  UseGuards,
} from "@nestjs/common";
import { UserService } from "./users.service";
import { User } from "./users.entity";
import { ApiBody, ApiParam } from "@nestjs/swagger";
import { UpdateUserDto } from "./users.dto";
import { ApiTags } from "@nestjs/swagger";
import { AuthGuard } from "@nestjs/passport";

@ApiTags("User")
@Controller("user")
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get(":id")
  @UseGuards(AuthGuard("jwt"))
  @ApiParam({ name: "id", required: true, description: "User Id " })
  async getUserById(@Param("id") id: string) {
    try {
      return await this.userService.getById(id);
    } catch (err) {
      throw new BadRequestException(err.message);
    }
  }
  

  @Put(":id")
  @UseGuards(AuthGuard("jwt"))
  @ApiParam({
    name: "id",
    required: true,
    description: "User object Id",
  })
  @ApiBody({ type: UpdateUserDto })
  async update(
    @Body() user: UpdateUserDto,
    @Param("id") id: string
  ) {
    try {
      return await this.userService.updateUser(user, id);
    } catch (err) {
      throw new BadRequestException(err.message);
    }
  }

  @UseGuards(AuthGuard("jwt"))
  @Delete(":id")
  @ApiParam({
    name: "id",
    required: true,
    description: "User object Id",
  })
  async delete(@Param("id") id: string): Promise<User> {
    try {
      return await this.userService.deleteUser(id);
    } catch (err) {
      throw new BadRequestException(err.message);
    }
  }
}
