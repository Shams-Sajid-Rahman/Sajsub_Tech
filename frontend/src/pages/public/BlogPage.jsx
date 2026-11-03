import { Newspaper } from 'lucide-react';
import StorePage, { CARD } from '../../components/store/StorePage.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';

export default function BlogPage() {
  return (
    <StorePage narrow title="Blog" subtitle="News and guides from Sajsub Tech.">
      <div className={CARD}>
        <EmptyState icon={Newspaper} title="No articles yet" message="No articles have been published yet. Please check back soon." />
      </div>
    </StorePage>
  );
}
