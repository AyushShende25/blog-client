import { useEffect, useState } from "react";

function useDebounce<T>(value: T, delay = 500) {
	const [debouncedValue, setDebouncedValue] = useState<T>(value);

	useEffect(() => {
		const tm = setTimeout(() => setDebouncedValue(value), delay);

		return () => clearTimeout(tm);
	}, [value, delay]);

	return debouncedValue;
}

export default useDebounce;
