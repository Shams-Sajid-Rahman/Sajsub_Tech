import StorePage, { CARD } from '../../components/store/StorePage.jsx';

export default function AboutPage() {
  return (
    <StorePage narrow title="About Sajsub Tech" subtitle="Smart Products. Better Tomorrow.">
      <section className={`${CARD} space-y-3 p-6 text-sm leading-6 text-muted`}>
        <p>Sajsub Tech is an online store for electronics and everyday essentials, from laptops and smartphones to audio, wearables, gaming and more.</p>
        <p>We aim to make shopping simple: clear product information, straightforward prices, and support when you need it.</p>
      </section>
    </StorePage>
  );
}
