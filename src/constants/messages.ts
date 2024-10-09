export const USERS_MESSAGES = {
  LOGIN_SUCCESS: 'Login success',
  REGISTER_SUCCESS: 'Register success',

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

  DATE_OF_BIRTH_INVALID: 'Ngày sinh không hợp lệ. Vui lòng nhập ngày theo định dạng YYYY-MM-DD.'
} as const
