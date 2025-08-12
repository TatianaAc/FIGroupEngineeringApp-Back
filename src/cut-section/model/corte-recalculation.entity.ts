// src/cut-section/model/corte-recalculation.entity.ts
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('corte_recalculation')
export class CorteRecalculation {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    nroGenerico: string;

    @Column()
    nroOrden: string;

    @Column()
    nuevoAncho: number;

    @Column('jsonb')
    resultados: { sentido: string; sesgo: number; detalles: { talla: string; consumo: number }[] }[];

    @Column()
    createdBy: string;

    @CreateDateColumn({ type: 'timestamp' })
    dateCreated: Date;
}
