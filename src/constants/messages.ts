export const USERS_MESSAGES = {
  SUCCESS: 'Thành công',
  VERIFIED_USER: 'Tài khoản đã kích hoạt',
  UNVERIFIED_USER: 'Tài khoản chưa được kích hoạt',
  BANNED_USER: 'Tài khoản đã bị khoá',
  LOGIN_SUCCESS: 'Đăng nhập thành công',
  LOGOUT_SUCCESS: 'Đăng xuất thành công',
  LOGIN_FAILED: 'Đăng nhập thất bại',
  REGISTER_SUCCESS: 'Đăng ký thành công',

  VALIDATION_ERROR: 'Lỗi xác thực',

  NAME_IS_REQUIRED: 'Tên không được để trống',
  NAME_MUST_BE_A_STRING: 'Tên phải là một chuỗi',
  NAME_LENGTH: 'Tên phải có độ dài từ 1 đến 50 ký tự',

  EMAIL_IS_REQUIRED: 'Email không được để trống',
  INVALID_EMAIL: 'Email không hợp lệ',
  EMAIL_TAKEN: 'Email đã tồn tại',
  EMAIL_NOTFOUND: 'Email không tồn tại',

  PASSWORD_IS_REQUIRED: 'Mật khẩu không được để trống',
  PASSWORD_MUST_BE_A_STRING: 'Mật khẩu phải là một chuỗi',
  WEAK_PASSWORD:
    'Mật khẩu không đủ mạnh. Mật khẩu cần có ít nhất 8 ký tự, bao gồm chữ thường, chữ hoa, số và ký tự đặc biệt.',
  PASSWORDS_DO_NOT_MATCH: 'Mật khẩu xác nhận không khớp',

  DATE_OF_BIRTH_INVALID: 'Ngày sinh không hợp lệ. Vui lòng nhập ngày theo định dạng YYYY-MM-DD.',

  REQUIRED_ACCESS_TOKEN: 'Access token không được để trống',
  REQUIRED_REFRESH_TOKEN: 'Refresh token không được để trống',

  INVALID_TOKEN: 'Token không hợp lệ',
  NOT_FOUND_REFRESH_TOKEN: 'Token không tồn tại',
  TOKEN_NOT_ACTIVE_YET: 'Token chưa được sử dụng',
  TOKEN_EXPIRED: 'Token đã hết hạn',
  LINK_EXPIRED: 'Đường dẫn đã hết hạn',
  USER_NOTFOUND: 'Thông tin người dùng không tồn tại',
  CANT_NOT_CHANGE_PASSWORD: 'Không thể thay đổi mật khẩu'
} as const
