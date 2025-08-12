import { Injectable, ConflictException, NotFoundException, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Normalization } from './model/normalization.entity';
import { Calculation } from 'src/calculator/model/calculation.entity';
import { CalculatorService } from 'src/calculator/calculator.service';

@Injectable()
export class NormalizationService {
    constructor(
        @InjectRepository(Normalization)
        private readonly normalizationRepository: Repository<Normalization>,
        @Inject(forwardRef(() => CalculatorService))  // Inyectar con forwardRef
        private readonly calculatorService: CalculatorService,
    ) { }

    async createNormalization(
        data: { nroMuestra: string, nroGenerico: string, overwrite?: boolean },
        username: string
    ): Promise<Normalization> {
        const { nroMuestra, nroGenerico, overwrite = false } = data;

        // Verificar si la muestra existe en la tabla de 'calculations'
        const sampleExists = await this.calculatorService.getCalculationByMuestra(nroMuestra);
        if (!sampleExists) {
            throw new NotFoundException(`El Nro. de Muestra ${nroMuestra} no existe.`);
        }

        // Verificar si ya existe una normalización con el nroMuestra dado
        const existingSample = await this.normalizationRepository.findOne({ where: { nroMuestra } });
        // Verificar si ya existe una normalización con el nroGenerico dado
        const existingGeneric = await this.normalizationRepository.findOne({ where: { nroGenerico } });

        // Caso 1: Si la muestra ya está relacionada con el mismo genérico
        if (existingSample && existingSample.nroGenerico === nroGenerico) {
            return existingSample;
        }

        // Caso 2: Si la muestra está relacionada con un genérico diferente
        if (existingSample && existingSample.nroGenerico !== nroGenerico) {
            if (overwrite) {
                existingSample.nroGenerico = nroGenerico;
                existingSample.createdBy = username;
                return this.normalizationRepository.save(existingSample);
            } else {
                throw new ConflictException(`El Nro. de Muestra ${nroMuestra} está relacionado con el Nro. Genérico ${existingSample.nroGenerico}. ¿Desea sobreescribirlo?`);
            }
        }

        // Caso 3: Si el genérico ya está relacionado con una muestra diferente
        if (existingGeneric && existingGeneric.nroMuestra !== nroMuestra) {
            if (overwrite) {
                // Sobrescribir la relación existente
                existingGeneric.nroMuestra = nroMuestra;
                existingGeneric.createdBy = username;
                return this.normalizationRepository.save(existingGeneric);
            } else {
                throw new ConflictException(`El Nro. Genérico ${nroGenerico} ya está relacionado con la muestra ${existingGeneric.nroMuestra}. ¿Desea sobreescribirlo?`);
            }
        }

        // Caso 4: Crear nueva relación si no existen conflictos
        const newNormalization = this.normalizationRepository.create({
            nroMuestra,
            nroGenerico,
            createdBy: username
        });

        return this.normalizationRepository.save(newNormalization);
    }

    async getAllNormalizations(): Promise<Normalization[]> {
        return this.normalizationRepository.find();
    }

    async getNormalizationById(id: number): Promise<Normalization> {
        return this.normalizationRepository.findOne({ where: { id } });
    }

    async findMuestraByGenerico(nroGenerico: string): Promise<string> {
        const normalization = await this.normalizationRepository.findOne({ where: { nroGenerico } });

        if (!normalization) {
            throw new NotFoundException('El Nro. Genérico no existe.');
        }

        return normalization.nroMuestra;
    }

    async getNormalizationsByMuestras(nroMuestras: string[]): Promise<Normalization[]> {
        return this.normalizationRepository.find({
            where: {
                nroMuestra: In(nroMuestras),
            },
        });
    }
}
