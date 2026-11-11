// A quiet network of vertices and lines for the "Built for AI agents" panel.
// Drawn once on the server from a fixed seed, so it's the same on every load.
// A few hubs glow and a few dots travel along the lines; both stop for reduced motion.

const W = 1200;
const H = 720;
const COLS = 13;
const ROWS = 8;

/** Small seeded random number generator (mulberry32), so the pattern never changes. */
function seeded(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function buildNetwork() {
  const rand = seeded(7);
  const round = (n: number) => Math.round(n * 10) / 10;

  // A loose grid of points, each nudged off its spot
  const points: { x: number; y: number }[] = [];
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      points.push({
        x: round(((c + 0.5) / COLS) * W + (rand() - 0.5) * 70),
        y: round(((r + 0.5) / ROWS) * H + (rand() - 0.5) * 60),
      });
    }
  }

  // Join every point to its three nearest neighbours
  const edges = new Set<string>();
  const neighbours: number[][] = points.map(() => []);
  points.forEach((p, i) => {
    points
      .map((q, j) => ({ j, d: (p.x - q.x) ** 2 + (p.y - q.y) ** 2 }))
      .filter((n) => n.j !== i)
      .sort((a, b) => a.d - b.d)
      .slice(0, 3)
      .forEach(({ j }) => {
        const key = i < j ? `${i}-${j}` : `${j}-${i}`;
        if (edges.has(key)) return;
        edges.add(key);
        neighbours[i].push(j);
        neighbours[j].push(i);
      });
  });

  // Hubs: a handful of points that glow
  const hubs = points.filter((_, i) => i % 11 === 4);

  // Paths for the travelling dots: short walks along the lines
  const walks = [5, 40, 77, 96].map((start) => {
    const path = [start];
    for (let step = 0; step < 4; step++) {
      const options = neighbours[path[path.length - 1]].filter((n) => !path.includes(n));
      if (!options.length) break;
      path.push(options[Math.floor(rand() * options.length)]);
    }
    return path.map((i) => `${points[i].x},${points[i].y}`).join(" L");
  });

  return {
    points,
    lines: [...edges].map((key) => key.split("-").map(Number) as [number, number]),
    hubs,
    walks,
  };
}

const NET = buildNetwork();

export function VertexLines() {
  return (
    <svg className="net" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice" aria-hidden focusable="false">
      <g className="net-lines">
        {NET.lines.map(([a, b]) => (
          <line key={`${a}-${b}`} x1={NET.points[a].x} y1={NET.points[a].y} x2={NET.points[b].x} y2={NET.points[b].y} />
        ))}
      </g>
      <g className="net-dots">
        {NET.points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={2.4} />
        ))}
      </g>
      <g className="net-hubs">
        {NET.hubs.map((p, i) => (
          <g key={i} style={{ animationDelay: `${i * 0.9}s` }}>
            <circle className="halo" cx={p.x} cy={p.y} r={14} />
            <circle cx={p.x} cy={p.y} r={4.5} />
          </g>
        ))}
      </g>
      <g className="net-packets">
        {NET.walks.map((d, i) => (
          <circle key={i} r={3.5}>
            <animateMotion dur={`${7 + i * 1.5}s`} begin={`${i * 1.8}s`} repeatCount="indefinite" path={`M${d}`} />
          </circle>
        ))}
      </g>
    </svg>
  );
}
