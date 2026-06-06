// home-assistant/frontend/src/common/datetime/format_time.ts

import { useAmPm } from "./use_am_pm";
import { FrontendLocaleDataFixed } from "../../types/fixes";

// 9:15 PM || 21:15
export const formatTime = (dateObj: Date, locale: FrontendLocaleDataFixed): string =>
    formatTimeMem(locale).format(dateObj);

const formatTimeMem = (locale: FrontendLocaleDataFixed) =>
    new Intl.DateTimeFormat(locale.language === "en" && !useAmPm(locale) ? "en-u-hc-h23" : locale.language, {
        hour: "numeric",
        minute: "2-digit",
        hour12: useAmPm(locale),
    });
