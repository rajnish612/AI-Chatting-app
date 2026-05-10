export const getApiErrorMessage = (error: unknown, fallback = "Something went wrong") => {
  if (typeof error === "object" && error !== null) {
    const err = error as {
      response?: { data?: { message?: string } };
      message?: string;
    };

    if (err.response?.data?.message) {
      return err.response.data.message;
    }

    if (err.message) {
      return err.message;
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
};
