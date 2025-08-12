// src/cut-section/cut-section.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CutSectionService } from './cut-section.service';
import { CutSectionController } from './cut-section.controller';
import { Calculation } from '../calculator/model/calculation.entity';
import { CalculatorModule } from 'src/calculator/calculator.module';
import { CorteRecalculation } from './model/corte-recalculation.entity';

@Module({
    imports: [TypeOrmModule.forFeature([CorteRecalculation, Calculation]), CalculatorModule],
    controllers: [CutSectionController],
    providers: [CutSectionService],
})
export class CutSectionModule { }
