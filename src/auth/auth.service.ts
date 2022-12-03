import {HttpException, HttpStatus, Injectable} from '@nestjs/common';
import {CreateUserDto} from "../user/dtos/create-user.dto";
import {UserService} from "../user/user.service";
// @ts-ignore
import {JwtService} from "@nestjs/jwt";
import * as bcrypt from 'bcryptjs';
import {FilesService} from "../files/files.service";

@Injectable()
export class AuthService {
    constructor(
        private userService: UserService,
        private jwtService: JwtService,
        private filesService: FilesService
    ) {}

    async login(dto: CreateUserDto) {
        const userData = await this.validateUser(dto);


        const {password, ...user} = userData


        const roles = await Promise.all(user.roles.map(role => this.userService.getRoles(role)));
        // @ts-ignore
        const token = await this.generateToken({...user, roles});
        //@ts-ignore
        return {...token, user: {...user, roles}};
    }

    async registration(dto: CreateUserDto, image: any) {

        const candidate = await this.userService.getUserByUsername(dto.username);
        if(candidate) {
            throw new HttpException({message: 'User with this username already exists'}, HttpStatus.BAD_REQUEST);
        }

        const hashPassword = await bcrypt.hash(dto.password, 5);
        const imageUrl = image
            ? await this.filesService.createAvatar(image)
            : await this.filesService.createAvatarByUsername(dto.username);



        const user = await this.userService.create({...dto, password: hashPassword, imageUrl});
        const roles = await Promise.all(user.roles.map(role => this.userService.getRoles(role)));

        // @ts-ignore
        const token = await this.generateToken({...user._doc, roles});
        // @ts-ignore
        return {...token, user: {...user._doc, roles}};
    }

    private async generateToken(user) {
        const payload = {username: user.username, _id: user._id, imageUrl: user.imageUrl, roles: user.roles};
        return {
            token: this.jwtService.sign(payload)
        }
    }

    private async validateUser(userDto: CreateUserDto) {
        const user = await this.userService.getUserByUsername(userDto.username);
        if(!user) {
            throw new HttpException({message: 'User not found'}, HttpStatus.NOT_FOUND);
        }
        const passwordEquals = await bcrypt.compare(userDto.password, user.password);
        if (user && passwordEquals) {
            return user;
        }
        throw new HttpException('Password is incorrect', HttpStatus.BAD_REQUEST);
    }

    async getUserByToken(token: string) {
        return this.jwtService.verify(token);
    }
}
