import type { AnyFieldApi } from "@tanstack/react-form";
import { FieldError } from "./ui/field";

export function FieldInfo({ field }: { field: AnyFieldApi }) {
	return (
		<>
			{field.state.meta.isTouched && !field.state.meta.isValid ? (
				<FieldError errors={field.state.meta.errors} />
			) : null}
			{field.state.meta.isValidating ? "Validating..." : null}
		</>
	);
}
