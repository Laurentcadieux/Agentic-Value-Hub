/** @type {import('postcss-load-config').Config} */
// Tailwind CSS v4: the PostCSS plugin moved to the @tailwindcss/postcss package.
// autoprefixer is built into the v4 engine, so it is no longer needed here.
const config = {
  plugins: {
    '@tailwindcss/postcss': {},
  },
}

export default config
