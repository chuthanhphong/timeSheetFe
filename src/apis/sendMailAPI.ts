import { request } from "../utils/apiCore";

const MAIL_REQUEST_MAPPING = "mail";

export const sendMail = (params: any) => {
  return request({
    url: `${MAIL_REQUEST_MAPPING}/send-mail`,
    method: "POST",
    data: params
  });
};
