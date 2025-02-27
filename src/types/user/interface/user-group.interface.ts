export namespace UserInterfaces {
  export interface LogInRequest {
    username: string;
    password: string;
  }

  export interface LogInResponse {
    accessToken: string;
    permissions: any;
    user: any; // need to change when create RESPONSE
  }
}
