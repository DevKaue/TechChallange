import { Injectable } from '@nestjs/common';
import type { Part as PrismaPartModel } from '@prisma/client';
import { PrismaService } from '@/prisma/prisma.service';
import PartRepositoryInterface from '@parts/domain/contracts/part-repository.interface';
import Part from '@parts/domain/entities/part.entity';
import InsufficientPartStockException from '@parts/domain/exceptions/insufficient-part-stock.exception';
import PartFactory from '@parts/domain/factories/part.factory';
import type { PartRepository as ServiceOrdersPartRepository } from '@service-orders/domain/acls/part-repository.interface';

@Injectable()
export default class PrismaPartRepository
  implements PartRepositoryInterface, ServiceOrdersPartRepository
{
  constructor(private readonly prisma: PrismaService) {}

  async create(part: Part): Promise<void> {
    await this.prisma.part.create({
      data: {
        id: part.id,
        name: part.name,
        description: part.description,
        price: part.price,
        stockQuantity: part.stockQuantity,
        createdAt: part.createdAt,
        updatedAt: part.updatedAt,
      },
    });
  }

  async findAll(): Promise<Part[]> {
    const parts = await this.prisma.part.findMany({
      orderBy: { name: 'asc' },
    });

    return parts.map((part) => this.toDomain(part));
  }

  async findById(id: string): Promise<Part | null> {
    const part = await this.prisma.part.findUnique({
      where: { id },
    });

    return part ? this.toDomain(part) : null;
  }

  async update(part: Part): Promise<void> {
    await this.prisma.part.update({
      where: { id: part.id },
      data: {
        name: part.name,
        description: part.description,
        price: part.price,
        stockQuantity: part.stockQuantity,
      },
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.part.delete({
      where: { id },
    });
  }

  async decrementStock(partId: string, quantity: number): Promise<void> {
    const part = await this.findById(partId);

    if (!part) {
      return;
    }

    part.decrementStock(quantity);

    const result = await this.prisma.part.updateMany({
      where: {
        id: partId,
        stockQuantity: {
          gte: quantity,
        },
      },
      data: {
        stockQuantity: {
          decrement: quantity,
        },
      },
    });

    if (result.count === 0) {
      const currentPart = await this.findById(partId);
      throw new InsufficientPartStockException(
        currentPart?.name ?? part.name,
        currentPart?.stockQuantity ?? 0,
      );
    }
  }

  private toDomain(part: PrismaPartModel): Part {
    return PartFactory.create({
      id: part.id,
      name: part.name,
      description: part.description,
      price: part.price,
      stockQuantity: part.stockQuantity,
      createdAt: part.createdAt,
      updatedAt: part.updatedAt,
    });
  }
}
