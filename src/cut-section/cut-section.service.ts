// src/cut-section/cut-section.service.ts
import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CalculatorService } from 'src/calculator/calculator.service';
import { CreateCalculationDto, DetallePorTalla } from 'src/calculator/model/calculation.dto';
import { CorteRecalculation } from './model/corte-recalculation.entity';

@Injectable()
export class CutSectionService {
    constructor(
        @InjectRepository(CorteRecalculation)
        private readonly recalculationRepository: Repository<CorteRecalculation>,
        private readonly calculatorService: CalculatorService,
    ) { }

    async getAllRecalculations(): Promise<CorteRecalculation[]> {
        return this.recalculationRepository.find();
    }

    async validateCut(nroGenerico: string, nroOrden: string, nuevoAncho: number) {
        try {
            const calculations = await this.calculatorService.getCalculationsByGenerico(nroGenerico);

            if (!calculations || calculations.length === 0) {
                throw new NotFoundException('El número de genérico digitado no existe.');
            }

            const filteredCalculations = calculations.filter(calculation =>
                calculation.sentido === 1 || calculation.sentido === 3
            );

            const allAreAlHilo = calculations.every(calculation => calculation.sentido === 2);
            if (allAreAlHilo) {
                return { message: 'Los cálculos para este genérico son "Al Hilo", por lo que no se requiere recalcular el ancho.' };
            }

            const validCalculations = filteredCalculations.filter(calculation => calculation.ancho);

            if (validCalculations.length === 0) {
                throw new NotFoundException('No se encontraron cálculos válidos para este genérico.');
            }

            const allAnchosMatch = validCalculations.every(calculation => calculation.ancho === nuevoAncho);

            if (allAnchosMatch) {
                return { message: 'El ancho corresponde con el calculado por ingeniería.' };
            } else {
                return { recalculate: true, message: 'El ancho no coincide con el calculado por ingeniería. ¿Desea recalcular el consumo?' };
            }
        } catch (error) {
            throw new ConflictException(error.message || 'Error al validar el corte.');
        }
    }

    async recalculateCut(
        nroGenerico: string,
        nroOrden: string,
        nuevoAncho: number,
        user: string
    ): Promise<any> {
        try {
            const calculations = await this.calculatorService.getCalculationsByGenerico(nroGenerico);

            if (!calculations || calculations.length === 0) {
                throw new NotFoundException('No se encontró cálculo para el genérico proporcionado.');
            }

            const recalculationCandidates = calculations.filter(
                (calc) => calc.sentido === 1 || calc.sentido === 3
            );

            const recalculatedResultsPromises = recalculationCandidates.map(async (calculation) => {
                const recalculationData: CreateCalculationDto = {
                    ...calculation,
                    ancho: nuevoAncho,
                    detalles: this.mapDetallesPorTalla(calculation.detalles),
                    createdBy: user,
                };

                const recalculated = await this.calculatorService.calculate(recalculationData);

                return {
                    sentido: this.getSentidoLabel(calculation.sentido),
                    sesgo: calculation.sesgo,
                    detalles: recalculated.resultados.map((resultado) => ({
                        talla: resultado.talla,
                        consumo: parseFloat(resultado.value),
                    })),
                };
            });

            const recalculatedResults = await Promise.all(recalculatedResultsPromises);

            const recalculationRecord = this.recalculationRepository.create({
                nroGenerico,
                nroOrden,
                nuevoAncho,
                resultados: recalculatedResults,
                createdBy: user,
            });

            await this.recalculationRepository.save(recalculationRecord);

            return {
                success: true,
                message: 'Recalculation saved successfully.',
                recalculatedResults,
            };
        } catch (error) {
            throw new ConflictException(error.message || 'Error al recalcular el corte.');
        }
    }


    private mapDetallesPorTalla(detalles: any): DetallePorTalla[] {
        return Object.keys(detalles).map(talla => ({
            consumo: detalles[talla].consumo,
            anchos: detalles[talla].anchos,
            mpAnchos: detalles[talla].mpAnchos,
        }));
    }

    private getSentidoLabel(sentido: number): string {
        switch (sentido) {
            case 1:
                return 'Al Traves';
            case 2:
                return 'Al Hilo';
            case 3:
                return 'Al Sesgo';
            default:
                return 'Desconocido';
        }
    }
}
