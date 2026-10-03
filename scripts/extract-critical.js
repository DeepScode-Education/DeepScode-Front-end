import critical from 'critical';

critical.generate({
  inline: true,
  base: 'dist/',
  src: 'index.html',
  dest: 'dist/index-critical.html',
  width: 1300,
  height: 900,
  penthouse: {
    blockJSRequests: false,
  }
});