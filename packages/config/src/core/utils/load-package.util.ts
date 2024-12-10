const MISSING_REQUIRED_DEPENDENCY = (name: string, reason: string) =>
  `The "${name}" package is missing. Please, make sure to install this library ($ npm install ${name}) to take advantage of ${reason}.`;

export function loadPackage(packageName: string, context: string): any {
  try {
    return require(packageName);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (e) {
    console.error(MISSING_REQUIRED_DEPENDENCY(packageName, context));
    process.exit(1);
  }
}
