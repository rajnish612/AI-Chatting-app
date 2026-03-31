export type ResponseError = {
  errorType: "none" | "server" | "internet" | "other";
  err: boolean;
  message: string;
  status?: number;
};
