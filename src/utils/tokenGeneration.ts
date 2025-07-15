export function getConfirmationLink() {
  const subString = () => Math.random().toString(36).substring(2);
  return subString() + subString();
};