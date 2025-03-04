import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { MongoError } from 'mongodb';
import { Error as MongooseError } from 'mongoose';

@Catch()
export class AllExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal Server Error';

    // Handle NestJS HttpExceptions - which include ValidationPipe errors
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();

      // Log the full exception response for debugging
      this.logger.debug(`Exception response: ${JSON.stringify(res)}`);

      // Special handling for validation errors from ValidationPipe
      if (
        exception instanceof BadRequestException &&
        typeof res !== 'string' &&
        Array.isArray((res as any).message)
      ) {
        // These are class-validator errors
        const validationErrors = (res as any).message;
        message = this.formatValidationErrorsToMessage(validationErrors);

        // Log the validation errors
        this.logger.debug(
          `Validation errors: ${JSON.stringify(validationErrors)}`
        );
      } else {
        // Normal HttpException handling
        message =
          typeof res === 'string'
            ? res
            : Array.isArray((res as any).message)
              ? (res as any).message[0]
              : (res as any).message || 'Bad request';
      }
    }
    // Handle MongoDB/Mongoose specific errors
    else if (
      exception instanceof MongoError ||
      exception instanceof MongooseError
    ) {
      status = this.getMongoErrorStatus(exception);
      message = this.getMongoErrorMessage(exception);
    }
    // Fallback for Unhandled Errors
    else if (exception instanceof Error) {
      message = exception.message;
      this.logger.error(
        `Unhandled exception: ${exception.message}`,
        exception.stack
      );
    }
    // Unknown error type
    else {
      this.logger.error('Unknown error type:', exception);
    }

    // Send Consistent Error Response
    const errorResponse = {
      statusCode: status,
      message
    };

    this.logger.debug(`Error response: ${JSON.stringify(errorResponse)}`);
    response.status(status).json(errorResponse);
  }

  /**
   * Format validation errors into a concise message
   */
  private formatValidationErrorsToMessage(validationErrors: string[]): string {
    if (!validationErrors || validationErrors.length === 0) {
      return 'Validation failed';
    }

    // Just return the first validation error for simplicity
    return validationErrors[0];
  }

  /**
   * Determine the HTTP status code dynamically for MongoDB errors
   */
  private getMongoErrorStatus(exception: MongoError | MongooseError): number {
    if ('code' in exception) {
      switch (exception.code) {
        case 11000:
          return HttpStatus.CONFLICT; // Duplicate key
        case 121:
          return HttpStatus.BAD_REQUEST; // Schema validation failed
        default:
          return HttpStatus.BAD_REQUEST;
      }
    }
    if (exception instanceof MongooseError.CastError)
      return HttpStatus.BAD_REQUEST;
    if (exception instanceof MongooseError.ValidationError)
      return HttpStatus.UNPROCESSABLE_ENTITY; // 422 is more appropriate for validation errors
    return HttpStatus.INTERNAL_SERVER_ERROR;
  }

  /**
   * Generate a human-readable error message dynamically for MongoDB errors
   */
  private getMongoErrorMessage(exception: MongoError | MongooseError): string {
    if ('code' in exception) {
      if (exception.code === 11000 && 'keyValue' in exception) {
        const duplicateFields = Object.keys(exception.keyValue);
        const fieldValues = Object.values(exception.keyValue).join(', ');
        return `A record with ${duplicateFields.join(', ')} '${fieldValues}' already exists`;
      }
      if (exception.code === 121) return `Document validation failed`;
    }

    if (exception instanceof MongooseError.ValidationError) {
      const firstError = Object.values(exception.errors)[0];
      return firstError?.message || 'Validation failed';
    }

    if (exception instanceof MongooseError.CastError) {
      return `Invalid ${exception.kind} value '${exception.value}' for field '${exception.path}'`;
    }

    return 'Database operation failed';
  }
}
