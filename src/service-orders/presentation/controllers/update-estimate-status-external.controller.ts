import { Controller } from '@/common/application/contracts/controller';
import { HttpRequest, HttpResponse } from '@/common/application/contracts/http';
import { EstimateResponseDto } from '@service-orders/application/dto/estimate/estimate-response.dto';
import { UpdateEstimateStatusExternalDto } from '@service-orders/application/dto/estimate/update-estimate-status-external.dto';
import { UpdateEstimateStatusUseCase } from '@service-orders/application/usecases/estimate/update-estimate-status.use-case';
import { EstimateStatus } from '@service-orders/domain/enums/estimate-status.enum';

type UpdateEstimateStatusExternalRequest = HttpRequest<
  UpdateEstimateStatusExternalDto,
  { estimateId: string },
  undefined
>;

export default class UpdateEstimateStatusExternalController implements Controller<
  UpdateEstimateStatusExternalRequest,
  EstimateResponseDto
> {
  constructor(
    private readonly updateEstimateStatusUseCase: UpdateEstimateStatusUseCase,
  ) {}

  async handle(
    httpRequest: UpdateEstimateStatusExternalRequest,
  ): Promise<HttpResponse<EstimateResponseDto>> {
    const output = await this.updateEstimateStatusUseCase.execute(
      httpRequest.params.estimateId,
      { status: httpRequest.body.decision as unknown as EstimateStatus },
    );

    return {
      statusCode: 200,
      body: output,
    };
  }
}
