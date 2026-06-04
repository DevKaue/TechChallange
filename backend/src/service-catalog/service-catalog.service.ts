import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateServiceCatalogDto } from './dto/create-service-catalog.dto';
import { UpdateServiceCatalogDto } from './dto/update-service-catalog.dto';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class ServiceCatalogService {
  constructor(private prisma: PrismaService) {}

  async create(createServiceCatalogDto: CreateServiceCatalogDto) {
    return this.prisma.serviceCatalog.create({
      data: createServiceCatalogDto,
    });
  }

  async findAll() {
    return this.prisma.serviceCatalog.findMany();
  }

  async findOne(id: string) {
    const serviceCatalog = await this.prisma.serviceCatalog.findUnique({
      where: { id },
    });

    if (!serviceCatalog) {
      throw new NotFoundException(`Service catalog with ID ${id} not found`);
    }

    return serviceCatalog;
  }

  async update(id: string, updateServiceCatalogDto: UpdateServiceCatalogDto) {
    await this.findOne(id); // Check existence

    return this.prisma.serviceCatalog.update({
      where: { id },
      data: updateServiceCatalogDto,
    });
  }

  async remove(id: string) {
    await this.findOne(id); // Check existence

    return this.prisma.serviceCatalog.delete({
      where: { id },
    });
  }
}
