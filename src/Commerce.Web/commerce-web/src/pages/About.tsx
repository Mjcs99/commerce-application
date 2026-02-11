import styles from "./About.module.css";

export default function About() {
  return (
    <div className={styles.aboutPage}>
      <section className={styles.aboutHero}>
        <h1>About Urban Streetwear</h1>
        <p>
          Built for people who work hard, live fast, and wear what feels right.
        </p>
      </section>

      <section className={styles.aboutSection}>
        <h2>Who We Are</h2>
        <p>
          Urban Streetwear started with a simple idea: clothes should feel as
          solid as the people wearing them. No fake hype. No disposable fashion.
          Just clean designs, quality materials, and fits that actually work in
          real life.
        </p>
        <p>
          We’re inspired by blue-collar culture, street style, and everyday
          grit. Whether you’re on the job, out with friends, or just living your
          life, our pieces are made to move with you.
        </p>
      </section>

      <section className={styles.aboutSection}>
        <h2>What We Stand For</h2>
        <ul className={styles.aboutValues}>
          <li><strong>Quality first.</strong> Materials that last.</li>
          <li><strong>Honest pricing.</strong> No inflated hype costs.</li>
          <li><strong>Real people.</strong> Designed for everyday wear.</li>
          <li><strong>Timeless style.</strong> Not trends that die in a month.</li>
        </ul>
      </section>

      <section className={styles.aboutSection}>
        <h2>Why We Do This</h2>
        <p>
          Clothing is personal. It’s how you show up without saying a word.
          Urban Streetwear exists to give you pieces you can rely on — stuff
          that looks good, feels right, and doesn’t try too hard.
        </p>
      </section>
    </div>
  );
}
