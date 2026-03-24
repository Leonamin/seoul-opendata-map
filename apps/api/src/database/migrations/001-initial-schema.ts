import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema001 implements MigrationInterface {
  name = 'InitialSchema001';

  async up(queryRunner: QueryRunner): Promise<void> {
    // -- locations (matches LocationEntity) --
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "locations" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "name" varchar(100) NOT NULL,
        "areaCode" varchar(20) UNIQUE,
        "lat" double precision NOT NULL,
        "lng" double precision NOT NULL,
        "category" varchar(50),
        "createdAt" TIMESTAMP NOT NULL DEFAULT now()
      )
    `);

    // -- population_data (matches PopulationDataEntity) --
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "population_data" (
        "id" bigserial PRIMARY KEY,
        "locationId" uuid NOT NULL REFERENCES "locations"("id") ON DELETE CASCADE,
        "timestamp" timestamptz NOT NULL,
        "totalPopulation" integer,
        "malePopulation" integer,
        "femalePopulation" integer,
        "age0to9" integer,
        "age10to19" integer,
        "age20to29" integer,
        "age30to39" integer,
        "age40to49" integer,
        "age50to59" integer,
        "age60plus" integer,
        "residentRatio" double precision,
        "visitorRatio" double precision,
        "congestionLevel" varchar(10),
        "source" varchar(20) NOT NULL DEFAULT 'api',
        "createdAt" TIMESTAMP NOT NULL DEFAULT now()
      )
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_pop_location_time"
        ON "population_data" ("locationId", "timestamp")
    `);

    // -- commercial_data (matches CommercialDataEntity) --
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "commercial_data" (
        "id" bigserial PRIMARY KEY,
        "locationId" uuid NOT NULL REFERENCES "locations"("id") ON DELETE CASCADE,
        "periodDate" date NOT NULL,
        "businessTypeCode" varchar(20),
        "businessTypeName" varchar(50),
        "totalSales" bigint,
        "transactionCount" integer,
        "storeCount" integer,
        "source" varchar(20) NOT NULL DEFAULT 'api',
        "createdAt" TIMESTAMP NOT NULL DEFAULT now()
      )
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_comm_location_date"
        ON "commercial_data" ("locationId", "periodDate")
    `);

    // -- scenarios (matches ScenarioEntity) --
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "scenarios" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "userId" uuid NOT NULL,
        "name" varchar(200) NOT NULL,
        "description" text,
        "status" varchar(20) NOT NULL DEFAULT 'draft',
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now()
      )
    `);

    // -- scenario_locations (matches ScenarioLocationEntity) --
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "scenario_locations" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "scenarioId" uuid NOT NULL REFERENCES "scenarios"("id") ON DELETE CASCADE,
        "locationId" uuid NOT NULL REFERENCES "locations"("id") ON DELETE CASCADE,
        "displayOrder" integer NOT NULL DEFAULT 0
      )
    `);

    // -- scenario_periods (matches ScenarioPeriodEntity) --
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "scenario_periods" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "scenarioId" uuid NOT NULL REFERENCES "scenarios"("id") ON DELETE CASCADE,
        "label" varchar(100) NOT NULL,
        "startDate" date NOT NULL,
        "endDate" date NOT NULL,
        "isBaseline" boolean NOT NULL DEFAULT false
      )
    `);

    // -- comparison_reports (matches ReportEntity) --
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
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_comm_location_date"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "commercial_data"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_pop_location_time"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "population_data"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "locations"`);
  }
}
