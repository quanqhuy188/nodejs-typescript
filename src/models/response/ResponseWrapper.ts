// import { HTTP_STATUS } from '@/constants/httpStatus'
// import { USERS_MESSAGES } from '@/constants/messages'

// type ErrorsType = Record<string, { msg: string; [key: string]: any }>

// export class ErrorWithStatus {
//   message: string
//   status: number
//   constructor({ message, status }: { message: string; status: number }) {
//     this.message = message
//     this.status = status
//   }
// }
import { HTTP_STATUS } from '@/constants/httpStatus'
import { USERS_MESSAGES } from '@/constants/messages'

type ErrorsType = Record<string, { msg: string; [key: string]: any }>

export class ResponseWrapper<T = any> {
  status: number
  message: string
  data?: T
  errors?: ErrorsType

  constructor({ status, message, data, errors }: { status: number; message: string; data?: T; errors?: ErrorsType }) {
    this.status = status
    this.message = message
    this.data = data
    this.errors = errors
  }

  // Phương thức cho thành công
  static success<T>(
    data: T,
    message: string = USERS_MESSAGES.SUCCESS,
    status: number = HTTP_STATUS.OK
  ): ResponseWrapper<T> {
    return new ResponseWrapper({ status, message, data })
  }

  // Phương thức cho lỗi
  static error(message: string, status: number, errors?: ErrorsType): ResponseWrapper<null> {
    return new ResponseWrapper({ status, message, errors })
  }
}
