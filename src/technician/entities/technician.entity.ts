import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Technician {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('varchar', { length: 255 })
  name: string;
}
