import { Controller, Post, Get, Put, Param, Body } from '@nestjs/common';
import { UserService } from './user.service';
import { User } from './model/user.entity';
import { CreateUserDto } from './model/create-user.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Usuario')
@Controller('users')
export class UserController {
    constructor(private readonly usersService: UserService) { }

    @Get()
    async getAllUsers(): Promise<User[]> {
        return await this.usersService.findAll();
    }

    @Post('register')
    async register(@Body() createUserDto: CreateUserDto): Promise<User> {
        return await this.usersService.createUser(createUserDto);
    }

    @Get(':username')
    async getUser(@Param('username') username: string): Promise<User | undefined> {
        return await this.usersService.findOne(username);
    }

    @Put(':username')
    async updateUser(@Param('username') username: string, @Body() updateUserDto: CreateUserDto): Promise<User> {
        return await this.usersService.updateUser(username, updateUserDto);
    }
}
