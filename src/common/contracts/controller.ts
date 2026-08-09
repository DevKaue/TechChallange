import { HttpResponse } from '@/common/contracts/http';

export interface Controller<TRequest, TResponse> {
  handle(httpRequest: TRequest): Promise<HttpResponse<TResponse>>;
}
