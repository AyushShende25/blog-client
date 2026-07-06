import { useEffect, useMemo } from "react";
import { Button } from "./ui/button";
import { FilePlusIcon, XIcon } from "@phosphor-icons/react";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import type { CoverImageValue } from "@/constants/types";

type CoverImageInputProps = {
	value: CoverImageValue;
	onChange: (value: CoverImageValue) => void;
	onBlur?: () => void;
};

function CoverImageInput({ value, onChange, onBlur }: CoverImageInputProps) {
	const previewUrl = useMemo(() => {
		if (value instanceof File) {
			return URL.createObjectURL(value);
		}

		return value;
	}, [value]);

	useEffect(() => {
		return () => {
			if (previewUrl?.startsWith("blob:")) {
				URL.revokeObjectURL(previewUrl);
			}
		};
	}, [previewUrl]);

	return (
		<div className="w-fit">
			{previewUrl ? (
				<div className="relative w-fit">
					<img
						src={previewUrl}
						alt="Cover preview"
						className="h-40 rounded-md object-cover overflow-hidden"
					/>

					<Button
						type="button"
						size="icon"
						variant="destructive"
						className="absolute right-0 top-0 size-6 cursor-pointer rounded-tr-md"
						onClick={() => onChange(null)}
					>
						<XIcon className="size-3" />
					</Button>
				</div>
			) : (
				<Label className="flex min-h-10 cursor-pointer items-center rounded-sm border border-input bg-background px-3 py-3 transition-colors duration-300 hover:bg-background/50">
					<FilePlusIcon size={32} />

					<Input
						type="file"
						accept="image/*"
						className="hidden"
						onBlur={onBlur}
						onChange={(event) => {
							const file = event.target.files?.[0];

							event.target.value = "";

							if (!file) {
								return;
							}

							onChange(file);
						}}
					/>
				</Label>
			)}
		</div>
	);
}
export default CoverImageInput;
