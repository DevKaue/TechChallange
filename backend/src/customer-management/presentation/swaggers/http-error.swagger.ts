import { ApiProperty } from '@nestjs/swagger';

export class HttpErrorSwaggerResponse {
  @ApiProperty({ description: 'Código do status HTTP', example: 400 })
  statusCode!: number;

  @ApiProperty({ description: 'Nome do erro/status', example: 'Bad Request' })
  error!: string;

  @ApiProperty({ description: 'Mensagem detalhada do erro', example: 'Mensagem explicativa aqui' })
  message!: string;
}