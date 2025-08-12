import { Controller, Post, Get, Body, Param, Req } from '@nestjs/common';
import { NormalizationService } from './normalization.service';
import { Normalization } from './model/normalization.entity';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Normalizacion')
@Controller('normalization')
export class NormalizationController {
    constructor(private readonly normalizationService: NormalizationService) { }

    @Post('save')
    async saveNormalization(@Body() data: { nroMuestra: string, nroGenerico: string, overwrite?: boolean }, @Req() req: Request): Promise<Normalization> {
        const username = req['username'];
        return this.normalizationService.createNormalization(data, username);
    }

    @Get('all')
    async getAllNormalizations(): Promise<Normalization[]> {
        return this.normalizationService.getAllNormalizations();
    }

    @Get(':id')
    async getNormalizationById(@Param('id') id: number): Promise<Normalization> {
        return this.normalizationService.getNormalizationById(id);
    }
}
