import { ConflictException, GoneException, Inject, Injectable, Logger, NotFoundException, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Calculation } from './model/calculation.entity';
import { NormalizationService } from 'src/normalization/normalization.service';
import { CreateCalculationDto } from './model/calculation.dto';
import { CalculationWithGeneric } from './model/calculation-generic.dto';

@Injectable()
export class CalculatorService {
    private readonly logger = new Logger(CalculatorService.name);
    constructor(
        @InjectRepository(Calculation)
        private readonly calculationRepository: Repository<Calculation>,
        @Inject(forwardRef(() => NormalizationService))
        private readonly normalizationService: NormalizationService,
    ) { }

    async calculate(data: CreateCalculationDto): Promise<any> {
        try {
            var { ancho, sentido: optSesgo, tallaBase: tallaBase, medidas, tallas } = data;

            let resultados = [];
            let detallesPorTalla = {};
            let infoMessage = '';


            // Si el sentido es "Al Sesgo", incrementamos el ancho en un 50%
            if (optSesgo == 3) {
                ancho += 0.5 * ancho;
            }
            const factorInicial = tallaBase;

            if (optSesgo == 2) {
                tallas.forEach((talla) => {
                    const factor = talla.value - factorInicial;
                    const sumaMedidas = medidas.reduce((acumulado, medida) => {
                        return acumulado + medida.value + (factor * medida.escala);
                    }, 0);

                    if (sumaMedidas <= 0) {
                        infoMessage = `Los resultados para las tallas que no se muestran son iguales o menores a 0.`;
                        return;
                    }

                    resultados.push({
                        label: `Consumo Talla ${talla.key}:`,
                        value: (sumaMedidas + sumaMedidas * 0.05).toFixed(2),
                        talla: talla.key,
                    });
                });

            } else {
                tallas.forEach((talla) => {
                    const factor = talla.value - factorInicial;
                    const medidasTalla = medidas.map(
                        (medida) => medida.value + (factor * medida.escala)
                    );

                    const medidaMaxima = Math.max(...medidasTalla);

                    if (medidaMaxima > ancho) {
                        infoMessage = `Los resultados para las tallas que no se muestran superan el ancho disponible.`;
                        return;
                    }

                    const medidaMinima = Math.min(...medidasTalla);

                    if (medidaMinima <= 0) {
                        infoMessage = `Las medidas para la talla ${talla.key} no pueden ser inferiores a 1.`;
                        return;
                    }
                    const consumoPorTalla = this.calculateConsumption(ancho, medidasTalla);
                    detallesPorTalla[talla.key] = consumoPorTalla;

                    resultados.push({
                        label: `Consumo Talla ${talla.key}:`,
                        value: consumoPorTalla.consumo.toFixed(2),
                        talla: talla.key,
                    });
                });
            }

            return { resultados, detallesPorTalla, infoMessage };

        } catch (error) {
            throw new ConflictException(error.message);
        }
    }

    calculateConsumption(ancho: number, medidas: number[]) {
        medidas.sort((a, b) => b - a);
        const anchos: number[] = [];
        const mpAnchos: { [key: number]: number[] } = {};
        let pos = 0;

        medidas.forEach((medida) => {
            let colocada = false;
            pos = 0;

            anchos.forEach((anchoUsado, idx) => {
                pos++;
                if (!colocada && anchoUsado + medida <= ancho) {
                    anchos[idx] += medida;
                    if (!mpAnchos[pos]) {
                        mpAnchos[pos] = [];
                    }
                    mpAnchos[pos].push(medida);
                    colocada = true;
                }
            });

            if (!colocada) {
                pos++;
                anchos.push(medida);
                mpAnchos[pos] = [medida];
            }
        });

        let suma = 0;
        anchos.forEach((anchoUsado) => {
            const consumo = ancho * (1.0 / Math.floor(ancho / anchoUsado));
            suma += consumo;
        });

        return {
            consumo: suma,
            anchos,
            mpAnchos,
        };
    }

    async createCalculation(data: Calculation, username: string): Promise<Calculation> {
        try {
            if (data.sentido != 2)
                await this.validateWidthConsistency(data.nroMuestra, data.ancho, data.sentido);

            const newCalculation = this.calculationRepository.create({
                ...data,
                createdBy: username,
            });
            return this.calculationRepository.save(newCalculation);
        } catch (error) {
            throw new ConflictException(error.message);
        }

    }

    async getAllCalculations(): Promise<CalculationWithGeneric[]> {

        const calculations = await this.calculationRepository.find();

        const nroMuestras = calculations.map(calc => calc.nroMuestra);

        const normalizations = await this.normalizationService.getNormalizationsByMuestras(nroMuestras);

        const normalizationMap = new Map<string, string>();
        normalizations.forEach(norm => {
            normalizationMap.set(norm.nroMuestra, norm.nroGenerico);
        });

        calculations.forEach(calc => {
            calc['nroGenerico'] = normalizationMap.get(calc.nroMuestra) || null;
        });

        return calculations as CalculationWithGeneric[];
    }

    async getCalculationById(id: number): Promise<Calculation> {
        return this.calculationRepository.findOne({ where: { id } });
    }

    async getCalculationByMuestra(nroMuestra: string): Promise<Calculation> {
        return this.calculationRepository.findOne({ where: { nroMuestra } });
    }

    async getCalculationsByGenerico(nroGenerico: string): Promise<Calculation[]> {
        const nroMuestra = await this.normalizationService.findMuestraByGenerico(nroGenerico);

        const calculations = await this.calculationRepository.find({ where: { nroMuestra } });
        if (!calculations || calculations.length === 0) {
            throw new NotFoundException('No se encontraron cálculos asociados al genérico.');
        }

        return calculations;
    }

    private async validateWidthConsistency(nroMuestra: string, nuevoAncho: number, sentido: number): Promise<void> {

        const existingCalculations = await this.calculationRepository.find({
            where: {
                nroMuestra,
                sentido: In([1, 3])
            }
        });

        if (existingCalculations.length > 0) {
            const previousAncho = existingCalculations[0].ancho;

            if (nuevoAncho != previousAncho) {
                throw new Error(`El ancho ingresado (${nuevoAncho} cm) no coincide con el ancho de los cálculos previos (${previousAncho} cm) para esta muestra.`);
            }
        }
    }
}
