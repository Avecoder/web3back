import {Module} from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
// @ts-ignore
import {ConfigModule} from "@nestjs/config";
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { FilesModule } from './files/files.module';
import * as path from 'path';
// @ts-ignore
import {ServeStaticModule} from "@nestjs/serve-static";
import { RolesModule } from './roles/roles.module';
import { PostsModule } from './posts/posts.module';
import { TagsModule } from './tags/tags.module';
import { ChaptersModule } from './chapters/chapters.module';
import { GeneralModule } from './general/general.module';
import { PagesModule } from './pages/pages.module';
import {JwtModule} from "@nestjs/jwt";


@Module({
    controllers: [],
    providers: [],
    imports: [
        ConfigModule.forRoot({
            envFilePath: `.env`
        }),
        ServeStaticModule.forRoot({
            rootPath: path.resolve(__dirname, 'static')
        }),
        JwtModule.register({
            secret: process.env.SECRET_KEY || 'secretKey',
            signOptions: {expiresIn: '12d'}
        }),
        MongooseModule.forRoot(`mongodb+srv://${process.env.MONGODB_USER}:${process.env.MONGODB_PASSWORD}@cluster0.2jrebig.mongodb.net/web3?retryWrites=true&w=majority`),
        UserModule,
        AuthModule,
        FilesModule,
        RolesModule,
        PostsModule,
        TagsModule,
        ChaptersModule,
        GeneralModule,
        PagesModule,

    ],
})
export class AppModule {}
