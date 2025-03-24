import { useSuspenseQuery } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';

import { fetchCategoriesQueryOptions } from '@/api/categoriesApi';
import { Badge } from '@/components/ui/badge';
import type { Category } from '@/constants/types';

function FeaturedCategories() {
  const { data: featuredCategories } = useSuspenseQuery(
    fetchCategoriesQueryOptions()
  );

  return (
    <div className="mb-6 space-x-4 md:space-x-6 rounded-lg">
      <Link to="/">
        {({ isActive }) => {
          return (
            <Badge
              className="text-lg mb-3 cursor-pointer"
              variant={isActive ? 'default' : 'outline'}
            >
              All Posts
            </Badge>
          );
        }}
      </Link>
      {featuredCategories?.data.map((cat: Category) => (
        <Link
          key={cat.id}
          to="/search"
          search={(prev) => ({
            ...prev,
            category: cat.name,
          })}
        >
          {({ isActive }) => {
            return (
              <Badge
                className="text-lg mb-3 cursor-pointer"
                variant={isActive ? 'default' : 'outline'}
              >
                {cat.name}
              </Badge>
            );
          }}
        </Link>
      ))}
    </div>
  );
}
export default FeaturedCategories;
