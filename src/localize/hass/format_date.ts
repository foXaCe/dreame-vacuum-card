// home-assistant/frontend/src/common/datetime/format_date.ts

import { FrontendLocaleDataFixed } from "../../types/fixes";

// August 10, 2021
export const formatDate = (dateObj: Date, locale: FrontendLocaleDataFixed): string =>
    formatDateMem(locale).format(dateObj);

const formatDateMem = (locale: FrontendLocaleDataFixed) =>
    new Intl.DateTimeFormat(locale.language, {
        year: "numeric",
        month: "long",
        day: "numeric",
    });
