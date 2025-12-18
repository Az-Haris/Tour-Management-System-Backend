/* eslint-disable @typescript-eslint/no-explicit-any */
import { TGenericErrorResponse } from "../interfaces/error.types";

export const handleDuplicateError = (err: any): TGenericErrorResponse => {
  const duplicateValues = err.message.match(/"([^"]*)"/);

  return {
    statusCode: 400,
    message: `${
      duplicateValues ? duplicateValues[1] : "Field"
    } already exists. Please use another value.`,
  };
};
