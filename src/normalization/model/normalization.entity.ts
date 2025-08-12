import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('normalization')
export class Normalization {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    nroMuestra: string;

    @Column()
    nroGenerico: string;

    @CreateDateColumn({ type: 'timestamp' })
    dateCreated: Date;

    @Column()
    createdBy: string;
}
