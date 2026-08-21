import { HttpStatus } from '@nestjs/common';
import { ExceptionStatusMap } from '@/common/infra/filters/exception-status.map';
import DomainException from '@/service-catalog/domain/exceptions/domain.exception';
import ServiceNotFoundException from '@/service-catalog/application/exceptions/service-not-found.exception';

export const serviceCatalogStatusMap: ExceptionStatusMap = [
  [DomainException, HttpStatus.BAD_REQUEST],
  [ServiceNotFoundException, HttpStatus.NOT_FOUND],
];
