import UpdateEstimateStatusExternalController from '@service-orders/presentation/controllers/update-estimate-status-external.controller';
import type { UpdateEstimateStatusUseCase } from '@service-orders/application/usecases/estimate/update-estimate-status.use-case';
import { EstimateExternalDecision } from '@service-orders/application/dto/estimate/update-estimate-status-external.dto';

describe('UpdateEstimateStatusExternalController', () => {
  it('retorna 200 e delega ao use case com o status externo', async () => {
    // Arrange
    const output = { id: 'os-1' };
    const execute = jest.fn().mockResolvedValue(output);
    const controller = new UpdateEstimateStatusExternalController({
      execute,
    } as unknown as UpdateEstimateStatusUseCase);

    // Act
    const response = await controller.handle({
      body: { decision: EstimateExternalDecision.APPROVED },
      params: { estimateId: 'est-1' },
      query: undefined,
    });

    // Assert
    expect(response.statusCode).toBe(200);
    expect(response.body).toBe(output);
    expect(execute).toHaveBeenCalledWith('est-1', { status: 'APPROVED' });
  });

  it('mapeia REJECTED para o status do use case', async () => {
    // Arrange
    const output = { id: 'os-1' };
    const execute = jest.fn().mockResolvedValue(output);
    const controller = new UpdateEstimateStatusExternalController({
      execute,
    } as unknown as UpdateEstimateStatusUseCase);

    // Act
    const response = await controller.handle({
      body: { decision: EstimateExternalDecision.REJECTED },
      params: { estimateId: 'est-1' },
      query: undefined,
    });

    // Assert
    expect(response.statusCode).toBe(200);
    expect(execute).toHaveBeenCalledWith('est-1', { status: 'REJECTED' });
  });
});
