import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { jwtDecrypt } from 'jose';
import hkdf from '@panva/hkdf';

export interface AuthUser {
  sub: string;
  email: string;
  name: string;
}

@Injectable()
export class JweStrategy {
  constructor(private readonly configService: ConfigService) {}

  async decrypt(token: string): Promise<AuthUser> {
    const secret = this.configService.get<string>('NEXTAUTH_SECRET') ?? '';
    const encryptionKey = await hkdf(
      'sha256',
      secret,
      '',
      'NextAuth.js Generated Encryption Key',
      32,
    );
    const { payload } = await jwtDecrypt(token, encryptionKey);
    return {
      sub: payload['sub'] as string,
      email: payload['email'] as string,
      name: payload['name'] as string,
    };
  }
}
