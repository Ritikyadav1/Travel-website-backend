/* eslint-disable prettier/prettier */
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const { name, email, mobileno, password } = createUserDto;

    const existingUserByEmail = await this.usersRepository.findOne({
      where: { email },
    });
    if (existingUserByEmail) {
      throw new ConflictException('Email already exists');
    }

    const existingUserByMobileNumber = await this.usersRepository.findOne({
      where: { mobileno },
    });
    if (existingUserByMobileNumber) {
      throw new ConflictException('Mobile number already exists');
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const user = this.usersRepository.create({
      name,
      email,
      mobileno,
      passwordHash,
    });
    const created_user = await this.usersRepository.save(user);
    console.log('created_user: ', created_user);
    return created_user;
  }

  async findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  async findOne(id: number): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);

    if (updateUserDto.email) {
      const existingUserByEmail = await this.usersRepository.findOne({
        where: { email: updateUserDto.email },
      });
      if (existingUserByEmail && existingUserByEmail.id !== id) {
        throw new ConflictException('Email already exists');
      }
      user.email = updateUserDto.email;
    }

    if (updateUserDto.mobileno) {
      const existingUserByMobileNumber = await this.usersRepository.findOne({
        where: { mobileno: updateUserDto.mobileno },
      });
      if (existingUserByMobileNumber && existingUserByMobileNumber.id !== id) {
        throw new ConflictException('Mobile number already exists');
      }
      user.mobileno = updateUserDto.mobileno;
    }

    if (updateUserDto.name) {
      user.name = updateUserDto.name;
    }
    if (updateUserDto.password) {
      const saltRounds = 10;
      user.passwordHash = await bcrypt.hash(updateUserDto.password, saltRounds);
    }

    const updated_user = await this.usersRepository.save(user);
    console.log('updated_user', updated_user);

    return updated_user;
  }

  async remove(id: number): Promise<void> {
    const result = await this.usersRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
  }

  async findOneByEmail(email: string): Promise<User | undefined> {
    const user = await this.usersRepository.findOne({ where: { email } });
    return user || undefined;
  }

  async findOneByMobileNumber(mobileno: string): Promise<User | undefined> {
    const user = await this.usersRepository.findOne({
      where: { mobileno },
    });
    return user || undefined;
  }

  async validatePassword(
    user: User,
    passwordAttempt: string,
  ): Promise<boolean> {
    if (!user || !user.passwordHash) {
      return false;
    }
    const valid = await bcrypt.compare(passwordAttempt, user.passwordHash);
    return valid;
  }

}
