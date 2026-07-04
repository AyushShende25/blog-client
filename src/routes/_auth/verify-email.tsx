import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { userQueryOptions, useVerifyEmail } from "@/api/authApi";
import { verifyEmailSearchParamsSchema } from "@/constants/schema";
import { useEffect } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { WarningIcon } from "@phosphor-icons/react";

export const Route = createFileRoute("/_auth/verify-email")({
	component: VerifyEmailComponent,
	validateSearch: verifyEmailSearchParamsSchema,
	beforeLoad: async ({ context, search }) => {
		const data = await context.queryClient.ensureQueryData(userQueryOptions());
		if (data?.user) {
			throw redirect({ to: search.redirect });
		}
	},
});

function VerifyEmailComponent() {
	const navigate = useNavigate();
	const { token, redirect } = Route.useSearch();
	const verifyEmailMutation = useVerifyEmail();

	// biome-ignore lint/correctness/useExhaustiveDependencies: <We intentionally run this only once on mount to avoid repeated mutation calls.>
	useEffect(() => {
		verifyEmailMutation.mutate({ token });
	}, []);

	useEffect(() => {
		if (verifyEmailMutation.isSuccess) {
			navigate({ to: "/login", search: { redirect } });
		}
	}, [verifyEmailMutation.isSuccess, navigate, redirect]);

	if (verifyEmailMutation.isPending) {
		return (
			<div className="h-screen flex items-center justify-center">
				<Alert className="max-w-md">
					<AlertTitle>Verification in progress</AlertTitle>
				</Alert>
			</div>
		);
	}

	if (verifyEmailMutation.isError) {
		return (
			<div className="h-screen flex items-center justify-center">
				<Alert variant="destructive" className="max-w-md">
					<WarningIcon size={32} />
					<AlertTitle>Verification failed</AlertTitle>
					<AlertDescription>Token may be invalid or expired.</AlertDescription>
				</Alert>
			</div>
		);
	}

	return null;
}
