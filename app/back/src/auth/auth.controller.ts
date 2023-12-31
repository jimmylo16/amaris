import { Controller, Post, Body, Patch, Delete, Get } from '@nestjs/common';
import { Param } from '@nestjs/common/decorators/http/route-params.decorator';
import { ParseUUIDPipe } from '@nestjs/common/pipes/parse-uuid.pipe';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
// import { UpdateClientDto } from './dto/update-user.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  create(@Body() createClientDto: CreateUserDto) {
    return this.authService.create(createClientDto);
  }
  @Post('login')
  loginClient(@Body() createClientDto: LoginUserDto) {
    return this.authService.login(createClientDto);
  }
  // @Patch('update/:id')
  // updateClient(
  //   @Param('id', new ParseUUIDPipe()) id: string,
  //   @Body() updateClientDto: UpdateClientDto,
  // ) {
  //   return this.authService.update(id, updateClientDto);
  // }
  @Delete('delete/:id')
  delete(@Param('id') id: string) {
    return this.authService.delete(id);
  }
  @Get('getUser')
  findAll() {
    return this.authService.findAll();
  }
  @Get('getUser/:id')
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.authService.findOne(id);
  }
}
