export function canShareFiles(): boolean {
  if (typeof navigator === 'undefined' || !navigator.canShare) {
    return false;
  }
  try {
    const testFile = new File([], 'test.jpg', { type: 'image/jpeg' });
    return navigator.canShare({ files: [testFile] });
  } catch {
    return false;
  }
}
