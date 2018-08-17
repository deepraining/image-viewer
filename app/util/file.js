import fs from 'fs';

export function dirExist(dirPath: string): boolean {
  try {
    const stat = fs.statSync(dirPath);

    return stat.isDirectory();
  } catch (err) {
    if (err.code === 'ENOENT') return !1;

    throw new Error(err);
  }
}

export function fileExist(filePath: string): boolean {
  try {
    const stat = fs.statSync(filePath);

    return stat.isFile();
  } catch (err) {
    if (err.code === 'ENOENT') return !1;

    throw new Error(err);
  }
}
