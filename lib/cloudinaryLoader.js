/**
 * Next.js custom Cloudinary loader.
 *
 * Expects `src` to be a Cloudinary public_id like: "products/almonds123".
 */
export default function cloudinaryLoader({ src, width, quality }) {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  if (!cloudName) {
    throw new Error('Missing NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME');
  }

  void quality;
  const rawSrc = String(src);
  let cleanSrc = rawSrc.replace(/^\//, '');

  if (/^https?:\/\//i.test(rawSrc)) {
    try {
      const url = new URL(rawSrc);
      const marker = '/image/upload/';
      const idx = url.pathname.indexOf(marker);
      if (idx !== -1) {
        let after = url.pathname.slice(idx + marker.length);
        after = after.replace(/^v\d+\//, '');
        cleanSrc = after.replace(/^\//, '');
      }
    } catch {
      // keep original cleanSrc fallback
    }
  }

  return `https://res.cloudinary.com/${cloudName}/image/upload/f_auto,q_auto,w_${width}/${cleanSrc}`;
}
