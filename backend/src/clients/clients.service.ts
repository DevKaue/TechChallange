import {
  ConflictException,
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class ClientsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createClientDto: CreateClientDto) {
    const exists = await this.prisma.client.findUnique({
      where: { cpfCnpj: createClientDto.cpfCnpj },
    });

    if (exists) {
      throw new ConflictException(
        'Já existe um cliente cadastrado com este CPF/CNPJ',
      );
    }

    return this.prisma.client.create({
      data: createClientDto,
    });
  }

  findAll() {
    return this.prisma.client.findMany();
  }

  async findOne(id: string) {
    const client = await this.prisma.client.findUnique({
      where: { id },
    });
    if (!client) throw new NotFoundException('Cliente não encontrado');
    return client;
  }

  async update(id: string, updateClientDto: UpdateClientDto) {
    const client = await this.findOne(id); // Garante que existe
    if (updateClientDto.cpfCnpj && updateClientDto.cpfCnpj !== client.cpfCnpj) {
      throw new BadRequestException(
        'O CPF/CNPJ de um cliente não pode ser alterado após o cadastro.',
      );
    }
    return this.prisma.client.update({
      where: { id },
      data: updateClientDto,
    });
  }

  async remove(id: string) {
    await this.findOne(id); // Garante que existe
    return this.prisma.client.delete({
      where: { id },
    });
  }
}
