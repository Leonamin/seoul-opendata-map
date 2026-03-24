import { plainToInstance } from 'class-transformer';
import { IsString, IsOptional, validateSync } from 'class-validator';

class EnvironmentVariables {
  @IsString({ message: 'DATABASE_URL is required (e.g. postgresql://dev:dev@localhost:5432/seoul_opendata)' })
  DATABASE_URL: string;

  @IsOptional()
  @IsString()
  SEOUL_API_KEY?: string;

  @IsOptional()
  @IsString()
  CORS_ORIGIN?: string;

  @IsOptional()
  @IsString()
  PORT?: string;

  @IsOptional()
  @IsString()
  NODE_ENV?: string;
}

export function validate(config: Record<string, unknown>) {
  const validated = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validated, { skipMissingProperties: false });

  if (errors.length > 0) {
    const messages = errors
      .flatMap((e) => Object.values(e.constraints ?? {}))
      .join('\n  - ');
    throw new Error(`\nEnvironment validation failed:\n  - ${messages}\n\nCheck your .env file or environment variables.\n`);
  }

  return validated;
}
