export const ACCEPTED_IMAGES = 'image/jpeg,image/png,image/webp';
export const MAX_IMAGE_MB = 5;

const ACCEPTED_TYPES = ACCEPTED_IMAGES.split(',');

// A quick check for a helpful message. The server makes the real decision.
export const findImageProblem = (files) => {
  for (const file of files) {
    if (!ACCEPTED_TYPES.includes(file.type)) return `${file.name} isn't a JPEG, PNG or WebP image.`;
    if (file.size > MAX_IMAGE_MB * 1024 * 1024) return `${file.name} is larger than ${MAX_IMAGE_MB} MB.`;
  }
  return null;
};

export const toFormData = (field, files) => {
  const data = new FormData();
  [...files].forEach((file) => data.append(field, file));
  return data;
};
