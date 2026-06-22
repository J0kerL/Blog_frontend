import http from "./axios";
import type {
  ApiResult,
  LoginDTO,
  LoginVO,
  RegisterDTO,
  CaptchaVO,
  ForgotPasswordDTO,
  SliderCaptchaVO,
  SliderCaptchaVerifyDTO,
} from "@/types";

export const authApi = {
  getCaptcha: () =>
    http.get<ApiResult<CaptchaVO>>("/auth/captcha").then((r) => r.data.data),

  getSliderCaptcha: () =>
    http.get<ApiResult<SliderCaptchaVO>>("/auth/captcha/slider").then((r) => r.data.data),

  verifySliderCaptcha: (dto: SliderCaptchaVerifyDTO) =>
    http.post<ApiResult<SliderCaptchaVO>>("/auth/captcha/slider/verify", dto).then((r) => r.data.data),

  login: (dto: LoginDTO) =>
    http.post<ApiResult<LoginVO>>("/auth/login", dto).then((r) => r.data.data),

  register: (dto: RegisterDTO) =>
    http.post<ApiResult<LoginVO>>("/auth/register", dto).then((r) => r.data.data),

  forgotPassword: (dto: ForgotPasswordDTO) =>
    http.post<ApiResult<void>>("/auth/forgot-password", dto).then((r) => r.data),
};
