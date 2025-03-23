import { diskStorage } from 'multer';
import * as path from 'node:path';
import { FileTypeResult, fromFile } from 'file-type';
import * as fs from 'node:fs';

type validFilterExtension = 'png' | 'jpg' | 'jpeg';
type validMimeType = 'image/png' | 'image/jpg' | 'image/jpeg';

const validFileExtensions: validFilterExtension[] = ['jpg', 'jpeg', 'png'];
const validMimeTypes: validMimeType[] = [
  'image/png',
  'image/jpg',
  'image/jpeg',
];

export const saveImgToStorage = (folder?: 'avatars' | 'posts') => ({
  storage: diskStorage({
    destination: `./uploads/${folder}`,
    filename: (req: any, file, callback) => {
      const fileExtension: string = path.extname(file.originalname);
      const addition = folder === 'avatars' ? req.user.id : Date.now();
      const fileName: string = addition + fileExtension;
      callback(null, fileName);
    },
  }),
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes: validMimeType[] = validMimeTypes;
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(null, file);
    }
  },
});

export const isFileExtensionSafe = async (fullFilePath: string) => {
  const type: FileTypeResult = await fromFile(fullFilePath);
  if (!type) return false;
  const isFileTypeLegit = validFileExtensions.includes(
    type.ext as validFilterExtension,
  );
  const isMimeTypeLegit = validMimeTypes.includes(type.mime as validMimeType);
  return isFileTypeLegit && isMimeTypeLegit;
};

export const removeFile = (fullFilePath: string) => {
  try {
    fs.unlinkSync(fullFilePath);
  } catch (err) {
    console.error(err);
  }
};
