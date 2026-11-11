/**
 * Runs `create` with Math.random returning a fixed value, then puts Math.random back.
 *
 * Redux and RTK Query call Math.random while setting up: RTK Query gives each api a random id, and
 * Redux names its reducer-check actions randomly. With Cache Components, Next.js fails the build if
 * Math.random runs while a page is prerendering, and the store is set up during that render. None of
 * these values need to be unpredictable, so set-up uses a fixed one. Requests made later still get
 * random ids as normal.
 */
export function withFixedRandom<T>(create: () => T): T {
  const random = Math.random;
  Math.random = () => 0.5;
  try {
    return create();
  } finally {
    Math.random = random;
  }
}
