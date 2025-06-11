import { formatInTimeZone } from 'date-fns-tz';
import { parseISO, isValid } from 'date-fns';

/**
 * Dateオブジェクトを Asia／Tokyo の YYYY/MM/DD HH:MM 形式の文字列にフォーマットします。
 * @param date Dateオブジェクトまたは日付文字列
 * @returns フォーマットされた日付文字列。無効な日付の場合は空文字列。
 */
export function formatDateTime(dateInput: Date | string | null | undefined): string {
  if (!dateInput) {
    return '';
  }

  let dateToConvert: Date;

  if (typeof dateInput === 'string') {
    let isoCompatibleString = dateInput;
    if (dateInput.length === 19 && dateInput.charAt(10) === ' ') {
      isoCompatibleString = dateInput.replace(' ', 'T') + 'Z'; // UTCを明示
    } else if (!dateInput.endsWith('Z') && dateInput.includes('T')) {
      isoCompatibleString = dateInput + 'Z';
    }
    dateToConvert = parseISO(isoCompatibleString);
  } else if (dateInput instanceof Date) {
    dateToConvert = dateInput;
  } else {
    return '';
  }

  if (!isValid(dateToConvert)) {
    console.error('日付のフォーマットが不正です。', dateInput);
    return '';
  }

  try {
    const formattedDate = formatInTimeZone(dateToConvert, 'Asia/Tokyo', 'yyyy/MM/dd HH:mm');
    return formattedDate;
  } catch (error) {
    console.log('日付のフォーマットに失敗しました。', error);
    return '';
  }
}
