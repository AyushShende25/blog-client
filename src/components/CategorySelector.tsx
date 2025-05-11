import { useQuery } from '@tanstack/react-query';
import { ChevronDown, X } from 'lucide-react';
import { useState } from 'react';

import { fetchCategoriesQueryOptions } from '@/api/categoriesApi';
import type { Category } from '@/constants/types';

function CategorySelector() {
  const { data } = useQuery(fetchCategoriesQueryOptions());

  const [selectedOptions, setSelectedOptions] = useState<Category[]>([]);

  const [isOpen, setIsOpen] = useState(false);

  const handleOptionClick = (option: Category) => {
    // check if option is already in selectedOptions
    if (selectedOptions.some((item) => item.id === option.id)) {
      // If selected, remove it
      setSelectedOptions(
        selectedOptions.filter((item) => item.id !== option.id)
      );
    } else {
      // If not selected, add it
      setSelectedOptions([...selectedOptions, option]);
    }
  };

  const removeOption = (
    option: Category,
    e: React.MouseEvent<SVGSVGElement, MouseEvent>
  ) => {
    e.stopPropagation(); // Prevent dropdown from toggling
    setSelectedOptions(selectedOptions.filter((item) => item.id !== option.id));
  };

  return (
    <div className="relative min-w-44">
      {/* Dropdown Button */}
      <div
        onClick={() => setIsOpen((prev) => !prev)}
        className="px-3 py-2 rounded cursor-pointer border"
      >
        {selectedOptions.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {selectedOptions.map((option: Category) => (
              <span
                key={option.id}
                className="px-2 py-1 bg-muted rounded-md flex items-center text-sm"
              >
                {option.name}

                <X
                  size={12}
                  className="ml-1 cursor-pointer"
                  onClick={(e) => removeOption(option, e)}
                />
              </span>
            ))}
          </div>
        ) : (
          <div className="flex justify-between items-center gap-4">
            <span className="text-sm">select categories</span>
            <ChevronDown size={20} />
          </div>
        )}
      </div>

      {/* Dropdown menu */}
      {isOpen && (
        <ul className="absolute bg-card shadow border mt-1 rounded-md p-1 w-full z-20">
          {data?.data.map((category: Category) => (
            <li
              className="hover:bg-muted px-3 py-1 rounded cursor-pointer"
              key={category.id}
              onClick={() => handleOptionClick(category)}
            >
              {category.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
export default CategorySelector;
