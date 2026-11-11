import Link from "next/link";
import { TestLoginButton } from "@/components/test-login-button";
import { CategoryTile } from "./_components/category-tile";
import { AgentChat, type AgentHit } from "./_components/agent-chat";
import { HeroVideo } from "./_components/hero-video";
import { McpConnect } from "./_components/mcp-connect";
import { PartDemo } from "./_components/part-demo";
import { VertexLines } from "./_components/vertex-lines";
import "./home.css";

// Placeholder media (Pexels clips, Unsplash photos) until creators' real videos are in.
const PEXELS = "https://images.pexels.com/videos/";
const CLIPS = "https://videos.pexels.com/video-files/";
const UNSPLASH = "https://images.unsplash.com/";

const CATEGORIES = [
  { name: "Comedy", still: `${PEXELS}4994037/pexels-photo-4994037.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=600&h=800`, clip: `${CLIPS}4994037/4994037-sd_960_540_25fps.mp4`, durationSec: 16 },
  { name: "Food", still: `${PEXELS}10200311/pexels-photo-10200311.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=600&h=800`, clip: `${CLIPS}10200311/10200311-sd_540_960_25fps.mp4`, durationSec: 5 },
  { name: "Dance", still: `${PEXELS}27865969/cultural-dance-from-nigeria-27865969.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=600&h=800`, clip: `${CLIPS}27865969/12248475_960_540_50fps.mp4`, durationSec: 9 },
  { name: "Owambe", still: `${PEXELS}38299944/pexels-photo-38299944.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=600&h=800`, clip: `${CLIPS}38299944/16262944_540_960_24fps.mp4`, durationSec: 32, loopEndSec: 8 },
];

// The same clip twice: all of it, and just a part
const DEMO = {
  src: `${CLIPS}4994037/4994037-sd_960_540_25fps.mp4`,
  stripSrc: `${CLIPS}4994037/4994037-sd_960_540_25fps.mp4`,
  poster: `${PEXELS}4994037/pexels-photo-4994037.jpeg?auto=compress&cs=tinysrgb&w=1200`,
  durationSec: 16,
};

// What an agent finds when it searches Àmì (clips from the demo catalogue, with the moment it picked)
const AGENT_HITS: AgentHit[] = [
  {
    title: "Owambe aunty seat negotiations",
    by: "Kemi Johnson",
    clip: `${CLIPS}37964255/16109125_540_960_24fps.mp4`,
    still: `${PEXELS}37964255/pexels-photo-37964255.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=480&h=360`,
    lengthSec: 28,
    start: 12,
    end: 18,
  },
  {
    title: "Shoki footwork in 60 seconds",
    by: "Kemi Johnson",
    clip: `${CLIPS}8956007/8956007-sd_540_960_25fps.mp4`,
    still: `${PEXELS}8956007/pexels-photo-8956007.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=480&h=360`,
    lengthSec: 15,
    start: 3,
    end: 8,
  },
];

export default function Home() {
  return (
    <div className="p-home">
      <section className="hero wrap">
        <div className="frame">
          <HeroVideo
            src={`${CLIPS}5664462/5664462-hd_1280_720_50fps.mp4`}
            poster={`${PEXELS}5664462/african-dancing-headphones-listening-5664462.jpeg?auto=compress&cs=tinysrgb&w=1600`}
          />
          <div className="hero-copy">
            <h1>License videos from creators you love.</h1>
            <p>Use their clips in your own content, legally. They get paid every time.</p>
            <div className="ctas">
              <Link className="btn btn-white" href="/browse">
                Browse videos
              </Link>
              <a className="btn btn-outline-white" href="#creators">
                Sell your videos
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="section wrap" aria-labelledby="cats-h">
        <div className="center-head">
          <h2 id="cats-h">Clips for every kind of video</h2>
          <p>Skits, recipes, dance and owambe, straight from the people who made them.</p>
        </div>
        <div className="cats">
          {CATEGORIES.map((c) => (
            <CategoryTile key={c.name} {...c} />
          ))}
        </div>
      </section>

      <section className="section wrap split" aria-labelledby="how-h">
        <div>
          <h2 id="how-h">Three steps. No wahala.</h2>
          <ol className="steps">
            <li>
              <span className="n">1</span>
              <div>
                <b>Find a clip</b>
                <span>Search skits, food, dance and more.</span>
              </div>
            </li>
            <li>
              <span className="n">2</span>
              <div>
                <b>Choose the part and how long</b>
                <span>The whole video or a clip, for a month or forever.</span>
              </div>
            </li>
            <li>
              <span className="n">3</span>
              <div>
                <b>Pay once and post</b>
                <span>Get the clean file and your licence.</span>
              </div>
            </li>
          </ol>
        </div>
        <div className="pic">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`${UNSPLASH}photo-1677935711525-1059c0cb9b44?auto=format&fit=crop&crop=faces&w=900&h=1125&q=75`} alt="" loading="lazy" />
        </div>
      </section>

      <section className="section wrap" aria-labelledby="part-h">
        <div className="center-head">
          <h2 id="part-h">The whole video, or just the part you need.</h2>
          <p>Pay for the seconds you use, for a month, a year or forever.</p>
        </div>
        <div className="parts">
          <PartDemo label="Whole video" {...DEMO} />
          <PartDemo label="Just a part" {...DEMO} start={4} end={10} />
        </div>
      </section>

      <section className="section wrap split rev" id="creators" aria-labelledby="creators-h">
        <div className="pic">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`${UNSPLASH}photo-1680878790148-18c83f270499?auto=format&fit=crop&crop=faces&w=900&h=1125&q=75`} alt="" loading="lazy" />
        </div>
        <div>
          <h2 id="creators-h">Get paid when people reuse your videos.</h2>
          <p className="lede">List your videos, set your own prices, and keep 85% of every sale.</p>
          <div className="actions">
            <Link className="btn btn-ink" href="/upload">
              Start selling
            </Link>
          </div>
        </div>
      </section>

      <section className="section wrap" aria-labelledby="agents-h">
        <div className="agents">
          <VertexLines />
          <div className="agents-copy">
            <h2 id="agents-h">Built for AI agents too.</h2>
            <p className="lede">Connect your agent to Àmì over MCP. It can search every video, find the exact moment and get it licensed for you.</p>
            <McpConnect />
          </div>
          <AgentChat
            ask="Find me a few seconds of people dancing at an owambe for our party ad."
            query="dancing at an owambe"
            hits={AGENT_HITS}
            reply={
              <>
                I found 2 clips. Shall I license <span className="nw">0:12 – 0:18</span> of the first one for a month?
              </>
            }
          />
        </div>
      </section>

      <section className="wrap">
        <div className="close">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`${UNSPLASH}photo-1785094165691-643aa8db87ca?auto=format&fit=crop&w=2000&h=1000&q=75`} alt="" loading="lazy" />
          <div>
            <h2>
              Your work.
              <br />
              Your mark.
              <br />
              Your money.
            </h2>
            <div className="ctas">
              <TestLoginButton className="btn btn-white" then="/upload">
                Join Àmì free
              </TestLoginButton>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
