import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';

@Catch()
export class DomainExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    if (exception instanceof HttpException) {
      const statusCode = exception.getStatus();
      const errorTitle = this.resolveErrorTitle(exception, statusCode);
      const withErrorCode = exception as { errorCode?: string };
      const payload = exception.getResponse();
      const message = this.resolveHttpExceptionMessage(payload);

      response.status(statusCode).json({
        error: errorTitle,
        ...(withErrorCode.errorCode ? { error_code: withErrorCode.errorCode } : {}),
        message,
      });
      return;
    }

    if (!(exception instanceof Error)) {
      response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        error: 'Internal Server Error',
        message: 'Unexpected non-error exception',
      });
      return;
    }

    const statusCode = this.resolveStatusCode(exception);
    const errorTitle = this.resolveErrorTitle(exception, statusCode);
    const withErrorCode = exception as { errorCode?: string };

    response.status(statusCode).json({
      error: errorTitle,
      ...(withErrorCode.errorCode ? { error_code: withErrorCode.errorCode } : {}),
      message: exception.message,
    });
  }

  private resolveStatusCode(exception: Error): number {
    const exceptionName = exception.name;

    if (exceptionName.endsWith('NotFoundException')) {
      return HttpStatus.NOT_FOUND;
    }

    if (
      exceptionName.endsWith('AlreadyExistsException') ||
      exceptionName.endsWith('IsArchivedException') ||
      exceptionName.endsWith('InsufficientMaterialStockException')
    ) {
      return HttpStatus.CONFLICT;
    }

    if (
      exceptionName === 'DomainException' ||
      exceptionName.endsWith('DomainException') ||
      exceptionName.endsWith('ValidationException')
    ) {
      return HttpStatus.BAD_REQUEST;
    }

    return HttpStatus.INTERNAL_SERVER_ERROR;
  }

  private resolveErrorTitle(exception: Error, statusCode: number): string {
    if (statusCode === HttpStatus.NOT_FOUND) {
      return 'Not Found';
    }

    if (statusCode === HttpStatus.CONFLICT) {
      return 'Conflict';
    }

    if (statusCode === HttpStatus.BAD_REQUEST) {
      return 'Bad Request';
    }

    if (exception.name.endsWith('Exception')) {
      return exception.name.replace(/Exception$/, '');
    }

    return 'Internal Server Error';
  }

  private resolveHttpExceptionMessage(payload: unknown): unknown {
    if (typeof payload === 'string') {
      return payload;
    }

    if (
      typeof payload === 'object' &&
      payload !== null &&
      'message' in payload
    ) {
      return (payload as { message: unknown }).message;
    }

    return 'HTTP Exception';
  }
}