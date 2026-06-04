import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePartDto } from './dto/create-part.dto';
import { UpdatePartDto } from './dto/update-part.dto';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class PartsService {
  constructor(private prisma: PrismaService) {}

  async create(createPartDto: CreatePartDto) {
    return this.prisma.part.create({
      data: createPartDto,
    });
  }

  async findAll() {
    return this.prisma.part.findMany();
  }

  async findOne(id: string) {
    const part = await this.prisma.part.findUnique({
      where: { id },
    });

    if (!part) {
      throw new NotFoundException(`Part with ID ${id} not found`);
    }

    return part;
  }

  async update(id: string, updatePartDto: UpdatePartDto) {
    await this.findOne(id); // Check existence

    return this.prisma.part.update({
      where: { id },
      data: updatePartDto,
    });
  }

  async remove(id: string) {
    await this.findOne(id); // Check existence

    return this.prisma.part.delete({
      where: { id },
    });
  }
}
