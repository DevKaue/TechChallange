import { ApiProperty } from '@nestjs/swagger';
import { DocumentType } from '@prisma/client';

export class ClientResponseDto {
  @ApiProperty({ description: 'Client ID' })
  id: string;

  @ApiProperty({ description: 'Document number (CPF, CNPJ, Passport, etc.)' })
  document: string;

  @ApiProperty({ description: 'Document type', enum: DocumentType })
  documentType: DocumentType;

  @ApiProperty({ description: 'Client name' })
  name: string;

  @ApiProperty({ description: 'Client email', required: false, nullable: true })
  email: string | null;

  @ApiProperty({ description: 'Client phone', required: false, nullable: true })
  phone: string | null;

  @ApiProperty({ description: 'Registration date' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update date' })
  updatedAt: Date;
}
