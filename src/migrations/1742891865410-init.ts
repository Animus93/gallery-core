import { MigrationInterface, QueryRunner } from 'typeorm';

export class Init1742891865410 implements MigrationInterface {
  name = 'Init1742891865410';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE "post"
                             (
                                 "id"        SERIAL    NOT NULL,
                                 "imgPath"   character varying,
                                 "text"      character varying,
                                 "authorId"  integer   NOT NULL,
                                 "isActive"  boolean            DEFAULT true,
                                 "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                                 CONSTRAINT "PK_be5fda3aac270b134ff9c21cdee" PRIMARY KEY ("id")
                             )`);
    await queryRunner.query(`CREATE TABLE "user"
                             (
                                 "id"           SERIAL            NOT NULL,
                                 "login"        character varying NOT NULL,
                                 "firstName"    character varying NOT NULL,
                                 "imgPath"      character varying,
                                 "lastName"     character varying,
                                 "password"     character varying NOT NULL,
                                 "roles"        text array,
                                 "isActive"     boolean DEFAULT true,
                                 "lastOnlineAt" TIMESTAMP,
                                 CONSTRAINT "UQ_a62473490b3e4578fd683235c5e" UNIQUE ("login"),
                                 CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id")
                             )`);
    await queryRunner.query(`ALTER TABLE "post"
        ADD CONSTRAINT "FK_c6fb082a3114f35d0cc27c518e0" FOREIGN KEY ("authorId") REFERENCES "user" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "post" DROP CONSTRAINT "FK_c6fb082a3114f35d0cc27c518e0"`,
    );
    await queryRunner.query(`DROP TABLE "user"`);
    await queryRunner.query(`DROP TABLE "post"`);
  }
}
