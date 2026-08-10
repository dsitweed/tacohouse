import { type Dictionary, t } from 'intlayer';

const loginPageContent = {
  key: 'loginPage',
  content: {
    hero: {
      title: t({
        vi: 'Quản lý nhà trọ thông minh hơn với dữ liệu chuyên sâu.',
        en: 'Smarter rental management with deep insights.',
      }),
      description: t({
        vi: 'Hơn 2.000 chủ nhà và quản lý chuyên nghiệp đang dùng nền tảng TacoHouse để tối ưu tỷ lệ lấp đầy, tự động hóa bảo trì và gia tăng lợi nhuận.',
        en: 'Over 2,000 landlords and professional managers use TacoHouse to optimize occupancy rates, automate maintenance, and increase revenue.',
      }),
      retentionValue: t({ vi: '98%', en: '98%' }),
      retentionLabel: t({
        vi: 'Tỷ lệ giữ chân khách thuê',
        en: 'Tenant Retention Rate',
      }),
      responseValue: t({ vi: '15 phút', en: '15 min' }),
      responseLabel: t({
        vi: 'Thời gian phản hồi',
        en: 'Response Time',
      }),
      quote: t({
        vi: '"Công cụ trực quan nhất trong bộ công cụ của tôi." — Chị Lan, Quản lý bất động sản',
        en: '"The most intuitive tool in my toolkit." — Ms. Lan, Property Manager',
      }),
    },
    title: t({
      vi: 'Chào mừng trở lại',
      en: 'Welcome back',
    }),
    subtitle: t({
      vi: 'Đăng nhập để quản lý tài sản và khách thuê của bạn.',
      en: 'Sign in to manage your properties and tenants.',
    }),
    googleButton: t({ vi: 'Google', en: 'Google' }),
    facebookButton: t({ vi: 'Facebook', en: 'Facebook' }),
    emailLabel: t({ vi: 'Email', en: 'Email' }),
    passwordLabel: t({ vi: 'Mật khẩu', en: 'Password' }),
    submitButton: t({ vi: 'Đăng nhập', en: 'Sign In' }),
    divider: t({
      vi: 'Hoặc dùng email',
      en: 'Or use email',
    }),
    rememberMe: t({
      vi: 'Ghi nhớ đăng nhập',
      en: 'Remember me',
    }),
    forgotPassword: t({
      vi: 'Quên mật khẩu?',
      en: 'Forgot password?',
    }),
    noAccount: t({
      vi: 'Chưa có tài khoản? ',
      en: "Don't have an account? ",
    }),
    createAccount: t({
      vi: 'Tạo tài khoản mới',
      en: 'Create new account',
    }),
    comingSoon: t({
      vi: 'Tính năng sắp ra mắt',
      en: 'Coming soon',
    }),
    validation: {
      emailInvalid: t({
        vi: 'Email không hợp lệ.',
        en: 'Invalid email.',
      }),
      passwordMin: t({
        vi: 'Mật khẩu phải có ít nhất 6 ký tự.',
        en: 'Password must be at least 6 characters.',
      }),
    },
  },
} satisfies Dictionary;

export default loginPageContent;
