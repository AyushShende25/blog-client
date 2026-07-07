import { fetchCategoriesQueryOptions } from "@/api/categoriesApi";
import { fetchPostsQueryOptions } from "@/api/postsApi";
import { fetchTagsQueryOptions } from "@/api/tagsApi";
import PostCard from "@/components/PostCard";
import { Button } from "@/components/ui/button";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { blogSearchSchema } from "@/constants/schema";
import type { Post } from "@/constants/types";
import { useQuery, useSuspenseInfiniteQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useInView } from "react-intersection-observer";

export const Route = createFileRoute("/_site/posts/search")({
	component: RouteComponent,
	validateSearch: blogSearchSchema,
});

function RouteComponent() {
	const searchParams = Route.useSearch();

	const categoriesQuery = useQuery(fetchCategoriesQueryOptions());
	const tagsQuery = useQuery(fetchTagsQueryOptions());

	const navigate = useNavigate();

	const { ref, inView } = useInView();

	const { data, isFetchingNextPage, hasNextPage, fetchNextPage } =
		useSuspenseInfiniteQuery(
			fetchPostsQueryOptions({
				search: searchParams.search,
				category: searchParams.category,
				tag: searchParams.tag,
				sort: searchParams.sort,
			}),
		);

	// biome-ignore lint/correctness/useExhaustiveDependencies: <correct-deps>
	useEffect(() => {
		if (inView) {
			fetchNextPage();
		}
	}, [fetchNextPage, hasNextPage, inView]);

	const handleSortChange = (val: string) => {
		navigate({
			to: "/posts/search",
			search: {
				...searchParams,
				sort: val,
			},
		});
	};

	const handleCategoryChange = (val: string) => {
		navigate({
			to: "/posts/search",
			search: { ...searchParams, category: val },
		});
	};
	const handleTagChange = (val: string) => {
		navigate({
			to: "/posts/search",
			search: { ...searchParams, tag: val },
		});
	};

	return (
		<main className="container px-4 sm:px-10 lg:px-14">
			<h1 className="text-3xl md:text-4xl font-bold tracking-wider py-6">
				Search Posts
			</h1>

			<p className="text-lg">
				{data?.pages[0]?.meta?.totalItems || 0} results found
				{searchParams.category && ` in category "${searchParams.category}"`}
				{searchParams.search && ` for "${searchParams.search}"`}
				{searchParams.tag && ` for "${searchParams.tag}"`}
			</p>

			<div className="flex justify-end items-center gap-6 md:gap-10 my-4">
				<Select value={searchParams.sort} onValueChange={handleSortChange}>
					<SelectTrigger className="w-25">
						<SelectValue placeholder="Sort by" />
					</SelectTrigger>
					<SelectContent>
						<SelectGroup>
							<SelectLabel>Published Date</SelectLabel>
							<SelectItem value="publishedAt:desc">Newest</SelectItem>
							<SelectItem value="publishedAt:asc">Oldest</SelectItem>
						</SelectGroup>
						<SelectGroup>
							<SelectLabel>Alphabetically</SelectLabel>
							<SelectItem value="title:asc">Title [A-Z]</SelectItem>
							<SelectItem value="title:desc">Title [Z-A]</SelectItem>
						</SelectGroup>
					</SelectContent>
				</Select>
				<Select
					value={searchParams.category}
					onValueChange={handleCategoryChange}
				>
					<SelectTrigger className="w-25">
						<SelectValue placeholder="Categories" />
					</SelectTrigger>
					<SelectContent>
						<SelectGroup>
							<SelectLabel>Categories</SelectLabel>
							{categoriesQuery.data?.categories.map((c) => (
								<SelectItem key={c.id} value={c.name}>
									{c.name}
								</SelectItem>
							))}
						</SelectGroup>
					</SelectContent>
				</Select>
				<Select value={searchParams.tag} onValueChange={handleTagChange}>
					<SelectTrigger className="w-25">
						<SelectValue placeholder="Tags" />
					</SelectTrigger>
					<SelectContent>
						<SelectGroup>
							<SelectLabel>Tags</SelectLabel>
							{tagsQuery.data?.tags.map((t) => (
								<SelectItem key={t.id} value={t.name}>
									{t.name}
								</SelectItem>
							))}
						</SelectGroup>
					</SelectContent>
				</Select>
				<Button
					onClick={() =>
						navigate({
							to: "/posts/search",
							search: {
								search: "",
								category: "",
								tag: "",
								sort: "publishedAt:desc",
								dateFrom: undefined,
								dateTo: undefined,
							},
						})
					}
					variant={"link"}
					className="cursor-pointer"
				>
					clear filter
				</Button>
			</div>

			<div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-10">
				{data?.pages.map((page) => {
					return page.posts.map((item: Post) => (
						<PostCard key={item.id} postData={item} />
					));
				})}
			</div>
			<div ref={ref} />

			<p className="bg-muted my-4 py-4 rounded-lg text-center font-semibold">
				{isFetchingNextPage
					? "Loading more..."
					: hasNextPage
						? "Load Newer"
						: "Nothing more to load"}
			</p>
		</main>
	);
}
