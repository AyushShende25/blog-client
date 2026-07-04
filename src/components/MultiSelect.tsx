import { XIcon } from "@phosphor-icons/react";
import { useEffect, useRef, useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

type Option = {
	id: string;
	name: string;
};

type MultiSelectProps = {
	options: Option[];
	value: Option[]; // selectedOptions
	onChange: (value: Option[]) => void; // setSelectedOptions
	placeholder?: string;
	searchPlaceholder?: string;
};

function MultiSelect({
	options,
	value,
	onChange,
	placeholder = "Select options",
	searchPlaceholder = "Search...",
}: MultiSelectProps) {
	const [isOpen, setIsOpen] = useState(false);
	const [searchTerm, setSearchTerm] = useState("");

	const dropdownRef = useRef<HTMLDivElement>(null);
	const searchInputRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		if (isOpen) {
			searchInputRef.current?.focus();
		} else {
			setSearchTerm("");
		}
	}, [isOpen]);

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				dropdownRef.current &&
				!dropdownRef.current.contains(event.target as Node)
			) {
				setIsOpen(false);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);

		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, []);

	const toggleSelected = (option: Option) => {
		const exists = value.some((item) => item.id === option.id);

		if (exists) {
			onChange(value.filter((item) => item.id !== option.id));
			return;
		}

		onChange([...value, option]);
	};

	const removeSelected = (id: string) => {
		onChange(value.filter((item) => item.id !== id));
	};

	const filteredOptions = options.filter((option) =>
		option.name.toLowerCase().includes(searchTerm.toLowerCase()),
	);

	return (
		<div ref={dropdownRef} className="relative w-full">
			<div
				role="button"
				tabIndex={0}
				onClick={() => setIsOpen((prev) => !prev)}
				className="flex min-h-11 w-full cursor-pointer flex-wrap items-center gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs transition-colors focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50"
			>
				{value.length === 0 && (
					<span className="text-muted-foreground">{placeholder}</span>
				)}

				{value.map((option) => (
					<span
						key={option.id}
						className="inline-flex items-center gap-1 rounded-md bg-primary px-2 py-1 text-xs font-medium text-primary-foreground"
					>
						{option.name}

						<button
							type="button"
							onClick={(event) => {
								event.stopPropagation();
								removeSelected(option.id);
							}}
							className="rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:outline-none"
							aria-label={`Remove ${option.name}`}
						>
							<XIcon size={14} weight="bold" />
						</button>
					</span>
				))}

				{value.length > 0 && (
					<Button
						type="button"
						variant="ghost"
						size="sm"
						onClick={(event) => {
							event.stopPropagation();
							onChange([]);
						}}
						className="ml-auto text-xs text-muted-foreground hover:text-foreground cursor-pointer"
					>
						Clear
					</Button>
				)}
			</div>

			{isOpen && (
				<div className="absolute z-50 mt-2 w-full rounded-md border border-border bg-popover text-popover-foreground shadow-md">
					<div className="border-b border-border p-2">
						<Input
							ref={searchInputRef}
							value={searchTerm}
							onChange={(event) => setSearchTerm(event.target.value)}
							onClick={(event) => event.stopPropagation()}
							placeholder={searchPlaceholder}
							className="h-9"
						/>
					</div>

					<ul className="max-h-60 overflow-y-auto p-1">
						{filteredOptions.length === 0 && (
							<li className="px-3 py-6 text-center text-sm text-muted-foreground">
								No options found.
							</li>
						)}

						{filteredOptions.map((option) => {
							const isSelected = value.some((item) => item.id === option.id);

							return (
								<li
									key={option.id}
									onClick={() => toggleSelected(option)}
									className="flex cursor-pointer items-center rounded-sm px-3 py-2 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground"
								>
									<span className="flex-1">{option.name}</span>

									{isSelected && (
										<span className="text-xs font-medium text-primary">
											Selected
										</span>
									)}
								</li>
							);
						})}
					</ul>
				</div>
			)}
		</div>
	);
}

export default MultiSelect;
