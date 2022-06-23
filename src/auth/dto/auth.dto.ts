import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
export class AuthDTO {
  @IsEmail({ message: '' })
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}
