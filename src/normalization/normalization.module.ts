import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NormalizationService } from './normalization.service';
import { NormalizationController } from './normalization.controller';
import { Normalization } from './model/normalization.entity';
import { CalculatorModule } from 'src/calculator/calculator.module';

@Module({
    imports: [TypeOrmModule.forFeature([Normalization]), forwardRef(() => CalculatorModule)],
    controllers: [NormalizationController],
    providers: [NormalizationService],
    exports: [NormalizationService],
})
export class NormalizationModule { }
