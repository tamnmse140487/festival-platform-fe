const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
const timezone = require("dayjs/plugin/timezone");

dayjs.extend(utc);
dayjs.extend(timezone);

export const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString("vi-VN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export const convertToVietnamTimeWithFormat = (
  utcTimeString,
  format = "YYYY-MM-DD HH:mm:ss"
) => {
  const vietnamTime = dayjs.utc(utcTimeString).tz("Asia/Ho_Chi_Minh");
  return vietnamTime.format(format);
};
