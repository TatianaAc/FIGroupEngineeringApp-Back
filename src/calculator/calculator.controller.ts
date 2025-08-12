import { Controller, Post, Get, Body, Param, Req } from '@nestjs/common';
import { CalculatorService } from './calculator.service';
import { Calculation } from './model/calculation.entity';
import { CreateCalculationDto } from './model/calculation.dto';
import { ApiTags } from '@nestjs/swagger';
import { CalculationWithGeneric } from './model/calculation-generic.dto';

@ApiTags('Calculadora')
@Controller('calculator')
export class CalculatorController {
  constructor(private readonly calculatorService: CalculatorService) { }

  @Post('calculate')
  async calculate(@Body() data: CreateCalculationDto): Promise<any> {
    return this.calculatorService.calculate(data);
  }

  @Post('save')
  async saveCalculation(@Body() data: Calculation, @Req() req: Request): Promise<Calculation> {
    const username = req['username'];
    return this.calculatorService.createCalculation(data, username);
  }

  @Get('all')
  async getAllCalculations(): Promise<CalculationWithGeneric[]> {
    return this.calculatorService.getAllCalculations();
  }

  @Get(':id')
  async getCalculationById(@Param('id') id: number): Promise<Calculation> {
    return this.calculatorService.getCalculationById(id);
  }
}
