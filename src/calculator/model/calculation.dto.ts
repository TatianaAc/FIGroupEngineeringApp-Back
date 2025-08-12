import { IsArray, IsNumber, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class Medida {
    @IsNumber()
    value: number;

    @IsNumber()
    escala: number;
}

export class Resultado {
    @IsString()
    label: string;

    @IsString()
    value: string;

    @IsString()
    talla: string;
}

export class DetallePorTalla {
    @IsNumber()
    consumo: number;

    @IsArray()
    anchos: number[];

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => Number)
    mpAnchos: { [key: number]: number[] };
}

export class Talla {
    @IsString()
    key: string;

    @IsNumber()
    value: number;
}

export class CreateCalculationDto {
    @IsString()
    nroMuestra: string;

    @IsNumber()
    ancho: number;

    @IsNumber()
    sentido: number; // Cambié a `sentido` para alinear con el ejemplo que diste (`optSesgo` debe ser `sentido`)

    @IsString()
    linea: string; // Cambié a `linea` para alinearlo con `lineaSeleccionada` de tu ejemplo

    @IsNumber()
    tallaBase: number; // Cambié a `tallaBase` para alinear con `tallaInicial`

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => Medida)
    medidas: Medida[];

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => Resultado)
    resultados: Resultado[];

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => DetallePorTalla)
    detalles: DetallePorTalla[];

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => Talla)
    tallas: Talla[];

    @IsString()
    createdBy: string;
}
