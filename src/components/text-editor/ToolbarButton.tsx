import { Toggle } from "@/components/ui/toggle";
import type { FormatOption } from "@/constants/types";

type ToolbarButtonProps = FormatOption;

export function ToolbarButton({
	label,
	icon: Icon,
	isActive,
	isDisabled,
	onClick,
}: ToolbarButtonProps) {
	return (
		<Toggle
			aria-label={label}
			pressed={isActive}
			disabled={isDisabled}
			onPressedChange={onClick}
			className="data-[state=on]:bg-primary-foreground"
		>
			<Icon className="size-4" />
		</Toggle>
	);
}

type ToolbarGroupProps = {
	label: string;
	options: FormatOption[];
};

export function ToolbarGroup({ label, options }: ToolbarGroupProps) {
	return (
		<div className="flex gap-1 items-center">
			<span className="text-xs text-muted-foreground mr-1">{label}:</span>
			{options.map((option) => (
				<ToolbarButton key={option.label} {...option} />
			))}
		</div>
	);
}
