import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('locations')
export class LocationEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  name: string;

  @Column({ length: 20, unique: true, nullable: true })
  areaCode: string;

  @Column('float')
  lat: number;

  @Column('float')
  lng: number;

  @Column({ length: 50, nullable: true })
  category: string;

  @CreateDateColumn()
  createdAt: Date;
}
