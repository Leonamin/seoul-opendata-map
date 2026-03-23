import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema001 implements MigrationInterface {
  name = 'InitialSchema001';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS postgis`);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "users" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "email" varchar NOT NULL UNIQUE,
        "name" varchar,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now()
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "locations" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "name" varchar NOT NULL,
        "district" varchar NOT NULL,
        "latitude" double precision NOT NULL,
        "longitude" double precision NOT NULL,
        "geom" geometry(Point, 4326),
        "createdAt" TIMESTAMP NOT NULL DEFAULT now()
      )
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_locations_geom" ON "locations" USING GIST ("geom")
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "population_data" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "locationId" uuid NOT NULL REFERENCES "locations"("id") ON DELETE CASCADE,
        "timestamp" TIMESTAMP NOT NULL,
        "totalPopulation" integer NOT NULL DEFAULT 0,
        "malePopulation" integer NOT NULL DEFAULT 0,
        "femalePopulation" integer NOT NULL DEFAULT 0,
        "ageGroup0to9" integer NOT NULL DEFAULT 0,
        "ageGroup10to19" integer NOT NULL DEFAULT 0,
        "ageGroup20to29" integer NOT NULL DEFAULT 0,
        "ageGroup30to39" integer NOT NULL DEFAULT 0,
        "ageGroup40to49" integer NOT NULL DEFAULT 0,
        "ageGroup50to59" integer NOT NULL DEFAULT 0,
        "ageGroup60plus" integer NOT NULL DEFAULT 0,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now()
      )
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_population_data_location_timestamp"
        ON "population_data" ("locationId", "timestamp")
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "commercial_data" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "locationId" uuid NOT NULL REFERENCES "locations"("id") ON DELETE CASCADE,
        "timestamp" TIMESTAMP NOT NULL,
        "category" varchar NOT NULL,
        "businessCount" integer NOT NULL DEFAULT 0,
        "salesEstimate" bigint,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now()
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "scenarios" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "userId" uuid NOT NULL,
        "name" varchar NOT NULL,
        "description" text,
        "status" varchar NOT NULL DEFAULT 'draft',
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now()
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "scenario_locations" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "scenarioId" uuid NOT NULL REFERENCES "scenarios"("id") ON DELETE CASCADE,
        "locationId" uuid NOT NULL REFERENCES "locations"("id") ON DELETE CASCADE,
        "order" integer NOT NULL DEFAULT 0
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "scenario_periods" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "scenarioId" uuid NOT NULL REFERENCES "scenarios"("id") ON DELETE CASCADE,
        "label" varchar NOT NULL,
        "startDate" TIMESTAMP NOT NULL,
        "endDate" TIMESTAMP NOT NULL
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "comparison_reports" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "scenarioId" uuid NOT NULL REFERENCES "scenarios"("id") ON DELETE CASCADE,
        "userId" uuid NOT NULL,
        "reportData" jsonb NOT NULL,
        "generatedAt" TIMESTAMP NOT NULL DEFAULT now()
      )
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "comparison_reports"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "scenario_periods"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "scenario_locations"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "scenarios"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "commercial_data"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_population_data_location_timestamp"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "population_data"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_locations_geom"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "locations"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "users"`);
  }
}
