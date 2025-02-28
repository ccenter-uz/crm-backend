import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { MongoError } from 'mongodb';
import { Error as MongooseError } from 'mongoose';

@Catch()
export class AllExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal Server Error';

    // Handle NestJS HttpExceptions
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();
      message = typeof res === 'string' ? res : (res as any).message;
    }

    if (exception instanceof MongoError || exception instanceof MongooseError) {
      status = this.getMongoErrorStatus(exception);
      message = this.getMongoErrorMessage(exception);
    }

    // Fallback for Unhandled Errors
    else if (exception instanceof Error) {
      message = exception.message;
    }

    // Send Consistent Error Response
    response.status(status).json({
      statusCode: status,
      message,
      path: request.url,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * 🔹 Determine the HTTP status code dynamically for MongoDB errors
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
      return HttpStatus.BAD_REQUEST;
    return HttpStatus.INTERNAL_SERVER_ERROR;
  }

  /**
   * 🔹 Generate a human-readable error message dynamically for MongoDB errors
   */
  private getMongoErrorMessage(exception: MongoError | MongooseError): string {
    if ('code' in exception) {
      if (exception.code === 11000 && 'keyValue' in exception) {
        const duplicateFields = Object.keys(exception.keyValue);
        return `Duplicate value for fields: ${duplicateFields.join(', ')}`;
      }
      if (exception.code === 121) return `Document validation failed`;
    }

    if (exception instanceof MongooseError.ValidationError) {
      console.log(
        Object.values(exception.errors).map((err) => err.message),
        'VALIDATION ERROR MONGO'
      );
      return Object.values(exception.errors).map((err) => err.message)[0];
    }

    if (exception instanceof MongooseError.CastError) {
      return `Invalid value for '${exception.path}': ${exception.value}`;
    }
    return 'Database Error';
  }
}
