import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('users')
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    username: string;

    @Column()
    password: string;

    @Column()
    area: string;

    @Column()
    name: string;

    @CreateDateColumn({ type: 'timestamp' })
    date_created: Date;
}
