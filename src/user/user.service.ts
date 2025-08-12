import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './model/user.entity';
import { CreateUserDto } from './model/create-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User)
        private usersRepository: Repository<User>,
    ) { }

    async findOne(username: string): Promise<User | undefined> {
        return this.usersRepository.findOne({ where: { username } });
    }

    async createUser(createUserDto: CreateUserDto): Promise<User> {
        const saltOrRounds = 10;
        const hashedPassword = await bcrypt.hash(createUserDto.password, saltOrRounds);
        const user = this.usersRepository.create({
            ...createUserDto,
            password: hashedPassword,
        });
        return this.usersRepository.save(user);
    }

    async updateUser(username: string, updateUserDto: CreateUserDto): Promise<User> {
        const user = await this.findOne(username);
        if (user) {
            if (updateUserDto.password) {
                const saltOrRounds = 10;
                updateUserDto.password = await bcrypt.hash(updateUserDto.password, saltOrRounds);
            }

            const updatedUserData = { ...user, ...updateUserDto };
            await this.usersRepository.save(updatedUserData);

            const updatedUser = await this.findOne(username);
            const { password, ...result } = updatedUser;
            return result as User;
        }
        return null;
    }

    async findAll(): Promise<User[]> {
        return this.usersRepository.find();
    }
}

