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
export default (str: string): string => str.replace(/(\\\\|\\)/g, '/');
