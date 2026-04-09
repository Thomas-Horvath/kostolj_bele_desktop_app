import styles from "../styles/infoPage.module.scss";

export default function InfoPage({ eyebrow, title, intro, sections }) {
  return (
    <section className={styles.page}>
      <div className={styles.hero}>
        <p className={styles.eyebrow}>{eyebrow}</p>
        <h1>{title}</h1>
        <p className={styles.intro}>{intro}</p>
      </div>

      <div className={styles.content}>
        {sections.map((section) => (
          <article key={section.title} className={styles.section}>
            <h2>{section.title}</h2>
            {section.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </article>
        ))}
      </div>
    </section>
  );
}
