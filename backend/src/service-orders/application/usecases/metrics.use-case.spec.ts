import { Test, TestingModule } from '@nestjs/testing';
import { MetricsUseCase } from './metrics.use-case';
import { ServiceOrdersRepositoryInterface } from '@service-orders/domain/contracts/service-orders-repository.interface';

describe('MetricsUseCase', () => {
  let useCase: MetricsUseCase;
  let repository: jest.Mocked<ServiceOrdersRepositoryInterface>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MetricsUseCase,
        {
          provide: ServiceOrdersRepositoryInterface,
          useValue: {
            findExecutionTimes: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get(MetricsUseCase);
    repository = module.get(ServiceOrdersRepositoryInterface);
  });

  describe('getAverageExecutionTime', () => {
    it('should return 0 when no orders', async () => {
      repository.findExecutionTimes.mockResolvedValue([]);

      const result = await useCase.getAverageExecutionTime();

      expect(result.totalOrdersAnalyzed).toBe(0);
    });

    it('should calculate average', async () => {
      const now = Date.now();
      repository.findExecutionTimes.mockResolvedValue([
        { startTime: new Date(now - 120000), endTime: new Date(now) },
        { startTime: new Date(now - 60000), endTime: new Date(now) },
      ]);

      const result = await useCase.getAverageExecutionTime();

      expect(result.totalOrdersAnalyzed).toBe(2);
      expect(result.averageExecutionTimeMinutes).toBeGreaterThan(0);
    });
  });
});
