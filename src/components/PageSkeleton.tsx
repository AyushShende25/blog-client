import { Skeleton } from "@/components/ui/skeleton";

function PageSkeleton() {
	return (
		<section className="pd-x pd-y">
			<h1 className="text-5xl md:text-6xl lg:text-7xl tracking-wider py-6 text-center">
				<Skeleton className="h-12 w-3/4 mx-auto" />
				<Skeleton className="h-12 w-1/2 mx-auto mt-2" />
			</h1>

			<div className="space-x-4 text-lg font-semibold text-center flex justify-center items-center">
				<Skeleton className="h-10 w-32" />
				<span>and get Inspired!</span>
			</div>

			<div className="h-1 bg-foreground w-full my-10" />

			<section>
				<Skeleton className="h-10 w-48 mx-auto mb-6" />

				<div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-10">
					{Array.from({ length: 6 }).map((_, index) => (
						// biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
						<div key={index} className="space-y-4">
							<Skeleton className="h-60 w-full" />
							<Skeleton className="h-6 w-1/2" />
							<Skeleton className="h-4 w-full" />
							<Skeleton className="h-4 w-3/4" />
						</div>
					))}
				</div>

				<div className="bg-muted my-4 py-4 rounded-lg text-center font-semibold">
					<Skeleton className="h-6 w-40 mx-auto" />
				</div>
			</section>
		</section>
	);
}

export default PageSkeleton;
