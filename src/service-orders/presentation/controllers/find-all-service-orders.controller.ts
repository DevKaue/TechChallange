import { Controller } from '@/common/contracts/controller';
import { HttpRequest, HttpResponse } from '@/common/contracts/http';
import { FindAllServiceOrdersUseCase } from '@service-orders/application/usecases/service-order/find-all-service-orders.use-case';
import {
  ServiceOrderPresenter,
  ServiceOrderSummaryResponse,
} from '@service-orders/presentation/presenters/service-order.presenter';

type FindAllServiceOrdersRequest = HttpRequest<undefined, undefined, undefined>;

export default class FindAllServiceOrdersController
  implements Controller<FindAllServiceOrdersRequest, ServiceOrderSummaryResponse[]>
{
  constructor(
    private readonly findAllServiceOrdersUseCase: FindAllServiceOrdersUseCase,
  ) {}

  async handle(): Promise<HttpResponse<ServiceOrderSummaryResponse[]>> {
    const output = await this.findAllServiceOrdersUseCase.execute();

    return {
      statusCode: 200,
      body: ServiceOrderPresenter.presentMany(output),
    };
  }
}
