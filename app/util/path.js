// @flow

/**
 * Replace back slash with slash.
 *
 * @example
 *
 * ```
 * \\ -> /
 * \\\\ -> /
 * ```
 *
 * @param str
 * @returns {string}
 */
export const replaceBackSlash = (str: string): string => str.replace(/(\\\\|\\)/g, '/');
