// src/cut-section/cut-section.controller.ts
import { Controller, Post, Body, Req, Get } from '@nestjs/common';
import { CutSectionService } from './cut-section.service';
import { ApiTags } from '@nestjs/swagger';
import { CorteRecalculation } from './model/corte-recalculation.entity';

@ApiTags('Corte')
@Controller('cut-section')
export class CutSectionController {
    constructor(private readonly cutSectionService: CutSectionService) { }

    @Post('validate')
    async validateCut(@Body('genericNumber') genericNumber: string, @Body('orderNumber') orderNumber: string, @Body('width') width: number) {
        return this.cutSectionService.validateCut(genericNumber, orderNumber, width);
    }

    @Post('recalculate')
    async recalculateCut(@Body('genericNumber') genericNumber: string, @Body('orderNumber') orderNumber: string, @Body('width') width: number, @Req() req: Request): Promise<any> {
        const username = req['username'];
        return this.cutSectionService.recalculateCut(genericNumber, orderNumber, width, username);
    }

    @Get('all-recalculations')
    async getAllRecalculations(): Promise<CorteRecalculation[]> {
        return this.cutSectionService.getAllRecalculations();
    }
}
