import StorePage, { CARD } from '../../components/store/StorePage.jsx';

export default function BlogPage() {
  return (
    <StorePage narrow title="Blog" subtitle="News and guides from Sajsub Tech.">
      <p className={`${CARD} p-10 text-center text-sm text-muted`}>No articles have been published yet. Please check back soon.</p>
    </StorePage>
  );
}
