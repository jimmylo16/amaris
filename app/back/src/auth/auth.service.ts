import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';
import { LoginUserDto } from './dto/login-user.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { JwtService } from '@nestjs/jwt';
import { UpdateUserDto } from './dto/update-client.dto';
import { NotFoundException } from '@nestjs/common/exceptions/not-found.exception';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}
  async create(createClientDto: CreateUserDto) {
    const alreadyCreated = await this.userRepository.find({
      where: { email: createClientDto.email },
    });
    if (alreadyCreated.length === 1) {
      return {
        msg: `The user with the ${createClientDto.email} was already created`,
      };
    }
    const { password, ...clientData } = createClientDto;
    // try {
    const client = this.userRepository.create({
      ...clientData,
      password: bcrypt.hashSync(password, 10),
    });

    await this.userRepository.save(client);

    delete client.password;
    return {
      ...client,
      token: this.getJwtToken({ email: client.email }),
    };
  }

  getJwtToken(payload: JwtPayload) {
    const token = this.jwtService.sign(payload);
    return token;
  }
  async login(loginClientDto: LoginUserDto) {
    const { password, email } = loginClientDto;
    const client = await this.userRepository.findOne({
      where: { email },
      select: { email: true, password: true, id: true },
    });
    if (!client) {
      throw new UnauthorizedException('Credentials are not valid (Email)');
    }
    if (!bcrypt.compareSync(password, client.password)) {
      throw new UnauthorizedException('Credentials are not valid (Password)');
    }

    return {
      ...client,
      token: this.getJwtToken({ email: client.email }),
    };
  }

  private handleDBErrors(error: any) {
    if (error.code === '23505') {
      throw new BadRequestException(error.detail);
    }

    throw new InternalServerErrorException('Please check logs');
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.userRepository.preload({
      id,
      ...updateUserDto,
    });
    if (!user) {
      throw new NotFoundException(`The user with the id=${id} was not found`);
    }
    return this.userRepository.save(user);
  }

  async delete(id: string) {
    const user = await this.findOne(id);
    if (!user) {
      throw new NotFoundException(`The user with the id=${id} was not found`);
    }
    await this.userRepository.remove(user);
    return { isDeleted: true };
  }
  async findOne(id: string) {
    const user = await this.userRepository.findOneBy({ id });

    if (!user)
      throw new NotFoundException(`The user with the id=${id} was not found`);
    return user;
  }
  async findAll() {
    const user = await this.userRepository.find({
      take: 10,
      skip: 0,
    });
    if (!user) throw new NotFoundException(`users Does not exists`);
    return user;
  }
}
