import { fetchCategoriesQueryOptions } from '@/api/categoriesApi';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Category } from '@/constants/types';
import { useQuery } from '@tanstack/react-query';

function CategorySelector() {
  const { data } = useQuery(fetchCategoriesQueryOptions());

  return (
    <Select>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Add Categories" />
      </SelectTrigger>
      <SelectContent>
        {data?.data?.map((category: Category) => (
          <SelectItem value={category.name} key={category.id}>
            {category.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
export default CategorySelector;
