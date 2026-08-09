import { Injectable } from '@nestjs/common';
import type { Material as PrismaMaterialModel } from '@prisma/client';
import { PrismaService } from '@/common/infra/prisma/prisma.service';
import MaterialRepositoryInterface from '@materials/domain/contracts/material-repository.interface';
import Material from '@materials/domain/entities/material.entity';
import InsufficientMaterialStockException from '@materials/domain/exceptions/insufficient-material-stock.exception';
import MaterialFactory from '@materials/domain/factories/material.factory';
import type { PartRepository as ServiceOrdersPartRepository } from '@service-orders/domain/acls/part-repository.interface';

@Injectable()
export default class PrismaMaterialRepository
  implements MaterialRepositoryInterface, ServiceOrdersPartRepository
{
  constructor(private readonly prisma: PrismaService) {}

  async create(material: Material): Promise<void> {
    await this.prisma.material.create({
      data: {
        id: material.id,
        name: material.name,
        description: material.description,
        price: material.price,
        type: material.type,
        stockQuantity: material.stockQuantity,
        stockUnit: material.stockUnit,
        expiresAt: material.expiresAt,
        createdAt: material.createdAt,
        updatedAt: material.updatedAt,
      },
    });
  }

  async findAll(): Promise<Material[]> {
    const materials = await this.prisma.material.findMany({
      orderBy: { name: 'asc' },
    });

    return materials.map((material) => this.toDomain(material));
  }

  async findById(id: string): Promise<Material | null> {
    const material = await this.prisma.material.findUnique({
      where: { id },
    });

    return material ? this.toDomain(material) : null;
  }

  async update(material: Material): Promise<void> {
    await this.prisma.material.update({
      where: { id: material.id },
      data: {
        name: material.name,
        description: material.description,
        price: material.price,
        type: material.type,
        stockQuantity: material.stockQuantity,
        stockUnit: material.stockUnit,
        expiresAt: material.expiresAt,
      },
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.material.delete({
      where: { id },
    });
  }

  async decrementStock(materialId: string, quantity: number): Promise<void> {
    const material = await this.findById(materialId);

    if (!material) {
      return;
    }

    material.decrementStock(quantity);

    const result = await this.prisma.material.updateMany({
      where: {
        id: materialId,
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
      const currentMaterial = await this.findById(materialId);
      throw new InsufficientMaterialStockException(
        currentMaterial?.name ?? material.name,
        currentMaterial?.stockQuantity ?? 0,
      );
    }
  }

  async incrementStock(materialId: string, quantity: number): Promise<void> {
    await this.prisma.material.updateMany({
      where: { id: materialId },
      data: {
        stockQuantity: {
          increment: quantity,
        },
      },
    });
  }

  private toDomain(material: PrismaMaterialModel): Material {
    return MaterialFactory.create({
      id: material.id,
      name: material.name,
      description: material.description,
      price: material.price,
      type: material.type,
      stockQuantity: material.stockQuantity,
      stockUnit: material.stockUnit,
      expiresAt: material.expiresAt,
      createdAt: material.createdAt,
      updatedAt: material.updatedAt,
    });
  }
}
