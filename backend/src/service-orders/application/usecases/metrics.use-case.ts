import { Injectable } from '@nestjs/common';
import { ServiceOrdersRepositoryInterface } from '@service-orders/domain/contracts/service-orders-repository.interface';

@Injectable()
export class MetricsUseCase {
  constructor(private readonly repository: ServiceOrdersRepositoryInterface) {}

  async getAverageExecutionTime() {
    const finishedOrders = await this.repository.findExecutionTimes();

    if (finishedOrders.length === 0) {
      return {
        averageExecutionTimeMinutes: 0,
        totalOrdersAnalyzed: 0,
        message:
          'No finished or delivered service orders to calculate average.',
      };
    }

    let totalDurationMs = 0;
    for (const order of finishedOrders) {
      totalDurationMs += order.endTime.getTime() - order.startTime.getTime();
    }

    const averageDurationMinutes =
      totalDurationMs / finishedOrders.length / (1000 * 60);

    return {
      averageExecutionTimeMinutes: Number.parseFloat(
        averageDurationMinutes.toFixed(2),
      ),
      totalOrdersAnalyzed: finishedOrders.length,
    };
  }
}
