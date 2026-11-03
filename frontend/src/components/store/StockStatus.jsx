// Availability in words and color, so it is never shown by color alone.
export default function StockStatus({ product, className = 'text-sm' }) {
  const [label, color] = !product.inStock
    ? ['Out of stock', 'text-danger']
    : product.stockLeft
      ? [`Only ${product.stockLeft} left`, 'text-warning']
      : ['In stock', 'text-success'];

  return <span className={`font-semibold ${color} ${className}`}>{label}</span>;
}
