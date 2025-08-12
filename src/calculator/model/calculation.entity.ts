import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('sesgo_calculation')
export class Calculation {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    nroMuestra: string;

    @Column('float')
    ancho: number;

    @Column()
    sentido: number;

    @Column()
    linea: string;

    @Column()
    tallaBase: number;

    @Column('float')
    sesgo: number;

    @Column('jsonb')
    medidas: { value: number; escala: number }[];

    @Column('jsonb')
    resultados: { label: string; value: string; talla: string }[];

    @Column('jsonb')
    detalles: { [key: string]: { consumo: number; anchos: number[]; mpAnchos: { [key: number]: number[] } } };

    @Column('jsonb')
    tallas: { key: string; value: number }[];

    @CreateDateColumn({ type: 'timestamp' })
    dateCreated: Date;

    @Column()
    createdBy: string;
}
